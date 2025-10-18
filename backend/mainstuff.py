from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from collections import deque
import settings

app = Flask(__name__)
CORS(app)

events = deque(maxlen=settings.MAX_EVENTS)
user_data = {}
alerts = []
total_events_received = 0


def normalize_hostname(hostname):
    return hostname.lower().strip()


def get_user_data(laptop_name):
    laptop_name = normalize_hostname(laptop_name)
    if laptop_name not in user_data:
        user_data[laptop_name] = {
            'laptop_name': laptop_name,
            'suspicious_programs_used': 0,
            'failed_logins': 0,
            'file_access_attempts': 0,
            'sensitive_file_access': 0,
            'suspicious_network_activity': 0,
            'privilege_escalation_attempts': 0,
            'first_seen': datetime.now().isoformat(),
            'last_seen': None
        }
    return user_data[laptop_name]


def calculate_risk_score(user):
    score = 0.0
    score += min(user['suspicious_programs_used'] * 0.15, 0.40)
    score += min(user['failed_logins'] * 0.10, 0.25)
    score += min(user['file_access_attempts'] * 0.05, 0.20)
    score += min(user['sensitive_file_access'] * 0.12, 0.30)
    score += min(user['suspicious_network_activity'] * 0.08, 0.25)
    score += min(user['privilege_escalation_attempts'] * 0.20, 0.50)
    return min(score, 1.0)


def process_event(event_data):
    global total_events_received
    
    laptop = event_data.get('hostIdentifier', 'unknown')
    event_type = event_data.get('name', '')
    event_action = event_data.get('action', '')
    details = event_data.get('columns', {})
    
    user = get_user_data(laptop)
    user['last_seen'] = datetime.now().isoformat()
    
    print(f"\n{'='*60}")
    print(f"[EVENT] Type: {event_type}")
    print(f"        Host: {laptop}")
    
    if event_action == 'removed':
        print(f"        Skipping - action is 'removed'")
        return
    
    if event_type in ['new_processes', 'suspicious_processes']:
        process_osquery_event(user, details)
    elif event_type == 'windows_security_event':
        process_windows_security_event(user, details)
    elif event_type == 'windows_system_event':
        process_windows_system_event(user, details)
    elif event_type == 'network_connection':
        process_network_event(user, details)
    elif event_type in ['file_created', 'file_modified', 'file_deleted', 'file_moved']:
        process_file_event(user, details)
    
    risk_score = calculate_risk_score(user)
    print(f"        Risk Score: {risk_score:.2f}")
    print(f"{'='*60}\n")
    
    if risk_score >= settings.HIGH_RISK_THRESHOLD:
        create_alert(laptop, risk_score, event_data, user)


def process_osquery_event(user, details):
    process_name = details.get('name', '').lower()
    process_path = details.get('path', '').lower()
    cmdline = details.get('cmdline', '').lower()
    
    print(f"        PROCESS: {process_name}")
    print(f"        Path: {process_path}")
    
    if any(susp.lower() in process_name for susp in settings.SUSPICIOUS_PROGRAMS):
        user['suspicious_programs_used'] += 1
        print(f"        SUSPICIOUS PROGRAM DETECTED!")
    
    if 'powershell' in process_name and cmdline:
        for pattern in settings.POWERSHELL_SUSPICIOUS_PATTERNS:
            if pattern.lower() in cmdline:
                user['suspicious_programs_used'] += 1
                print(f"        SUSPICIOUS POWERSHELL: {pattern}")
                break


def process_windows_security_event(user, details):
    event_id = details.get('event_id')
    event_type = details.get('event_type', 'Unknown')
    event_user = details.get('user')
    
    print(f"        Event ID: {event_id} - {event_type}")
    if event_user:
        print(f"        User: {event_user}")
    
    if event_id == 4625:
        user['failed_logins'] += 1
        print(f"        FAILED LOGIN ATTEMPT")
    elif event_id in [4663, 4656]:
        user['file_access_attempts'] += 1
        event_data_str = str(details.get('event_data', '')).lower()
        if any(pattern in event_data_str for pattern in settings.SENSITIVE_FILE_PATTERNS):
            user['sensitive_file_access'] += 1
            print(f"        SENSITIVE FILE ACCESS")
    elif event_id == 4660:
        user['file_access_attempts'] += 1
        print(f"        FILE DELETION")
    elif event_id == 4648:
        user['privilege_escalation_attempts'] += 1
        print(f"        EXPLICIT CREDENTIAL USAGE")
    elif event_id in [4720, 4726, 4732, 4733]:
        user['privilege_escalation_attempts'] += 1
        print(f"        USER ACCOUNT MODIFICATION")
    elif event_id in [5140, 5145]:
        user['suspicious_network_activity'] += 1
        print(f"        NETWORK SHARE ACCESS")


def process_windows_system_event(user, details):
    event_id = details.get('event_id')
    event_type = details.get('event_type', 'Unknown')
    
    print(f"        Event ID: {event_id} - {event_type}")
    
    if event_id == 7045:
        user['privilege_escalation_attempts'] += 1
        print(f"        NEW SERVICE INSTALLED")


def process_network_event(user, details):
    remote_addr = details.get('remote_address', 'unknown')
    process_name = details.get('process_name', 'unknown')
    is_suspicious = details.get('is_suspicious', False)
    
    print(f"        Network: {process_name} -> {remote_addr}")
    
    if is_suspicious:
        user['suspicious_network_activity'] += 1
        print(f"        SUSPICIOUS NETWORK CONNECTION")


def process_file_event(user, details):
    filename = details.get('filename', 'unknown')
    is_sensitive = details.get('is_sensitive', False)
    event_type = details.get('event_type', 'unknown')
    
    print(f"        File: {event_type} - {filename}")
    
    if is_sensitive:
        user['sensitive_file_access'] += 1
        print(f"        SENSITIVE FILE ACTIVITY")


def create_alert(laptop, risk_score, event_data, user):
    recent_alerts = [a for a in alerts if a['laptop'] == laptop]
    if recent_alerts:
        last_alert_time = datetime.fromisoformat(recent_alerts[-1]['timestamp'])
        time_since_last = (datetime.now() - last_alert_time).total_seconds()
        if time_since_last < settings.ALERT_COOLDOWN:
            return
    
    severity = 'CRITICAL' if risk_score >= settings.CRITICAL_RISK_THRESHOLD else 'HIGH'
    
    alert = {
        'id': len(alerts) + 1,
        'timestamp': datetime.now().isoformat(),
        'laptop': laptop,
        'risk_score': round(risk_score, 2),
        'severity': severity,
        'suspicious_programs': user['suspicious_programs_used'],
        'failed_logins': user['failed_logins'],
        'file_access_attempts': user['file_access_attempts'],
        'sensitive_file_access': user['sensitive_file_access'],
        'suspicious_network_activity': user['suspicious_network_activity'],
        'privilege_escalation': user['privilege_escalation_attempts'],
        'event_type': event_data.get('name', 'unknown')
    }
    
    alerts.append(alert)
    print(f"\n{'*'*60}")
    print(f"ALERT #{alert['id']}: {laptop}")
    print(f"Risk Score: {risk_score:.2f} | Severity: {severity}")
    print(f"Suspicious programs: {user['suspicious_programs_used']}")
    print(f"Failed logins: {user['failed_logins']}")
    print(f"File access attempts: {user['file_access_attempts']}")
    print(f"Sensitive file access: {user['sensitive_file_access']}")
    print(f"Network activity: {user['suspicious_network_activity']}")
    print(f"Privilege escalation: {user['privilege_escalation_attempts']}")
    print(f"{'*'*60}\n")


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Enhanced Insider Threat Detection System',
        'status': 'running',
        'monitors': ['processes', 'windows_events', 'network', 'files']
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'total_events': total_events_received
    })


@app.route('/api/ingest/osquery', methods=['POST'])
def ingest_osquery():
    global total_events_received
    
    try:
        event_data = request.json
        if not event_data:
            return jsonify({'error': 'No data provided'}), 400
        
        event_data['received_at'] = datetime.now().isoformat()
        events.append(event_data)
        total_events_received += 1
        process_event(event_data)
        
        return jsonify({'status': 'success', 'event_id': total_events_received}), 200
    
    except Exception as e:
        print(f"\nERROR: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/summary', methods=['GET'])
def get_summary():
    high_risk_count = sum(
        1 for user in user_data.values() 
        if calculate_risk_score(user) >= settings.HIGH_RISK_THRESHOLD
    )
    
    total_failed_logins = sum(u['failed_logins'] for u in user_data.values())
    total_file_access = sum(u['file_access_attempts'] for u in user_data.values())
    total_sensitive_access = sum(u['sensitive_file_access'] for u in user_data.values())
    
    return jsonify({
        'total_events': total_events_received,
        'total_alerts': len(alerts),
        'high_risk_users': high_risk_count,
        'total_failed_logins': total_failed_logins,
        'total_file_access': total_file_access,
        'total_sensitive_access': total_sensitive_access,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/users', methods=['GET'])
def get_users():
    users_with_risk = []
    for laptop, user in user_data.items():
        risk = calculate_risk_score(user)
        users_with_risk.append({
            **user,
            'risk_score': round(risk, 2)
        })
    
    users_with_risk.sort(key=lambda x: x['risk_score'], reverse=True)
    return jsonify({'count': len(users_with_risk), 'users': users_with_risk})


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    limit = request.args.get('limit', 100, type=int)
    laptop = request.args.get('laptop', None)
    
    filtered_alerts = alerts
    if laptop:
        filtered_alerts = [a for a in filtered_alerts if a['laptop'] == laptop]
    
    return jsonify({
        'count': len(filtered_alerts[-limit:]),
        'alerts': filtered_alerts[-limit:]
    })


@app.route('/api/events', methods=['GET'])
def get_events():
    limit = request.args.get('limit', 50, type=int)
    event_type = request.args.get('type', None)
    
    filtered_events = list(events)
    if event_type:
        filtered_events = [e for e in filtered_events if e.get('name') == event_type]
    
    return jsonify({
        'count': len(filtered_events[-limit:]),
        'events': filtered_events[-limit:]
    })


if __name__ == '__main__':
    print("=" * 70)
    print("ENHANCED INSIDER THREAT DETECTION SYSTEM")
    print("=" * 70)
    print("Monitoring for:")
    print("  - Suspicious program executions")
    print("  - Windows Event Logs (authentication, file access, privileges)")
    print("  - Network connections")
    print("  - File system activity")
    print("=" * 70)
    print(f"Ingest Endpoint:  http://localhost:5000/api/ingest/osquery")
    print(f"API Summary:      http://localhost:5000/api/summary")
    print(f"API Users:        http://localhost:5000/api/users")
    print(f"API Alerts:       http://localhost:5000/api/alerts")
    print(f"API Events:       http://localhost:5000/api/events")
    print("=" * 70)
    print("")
    
    app.run(host='0.0.0.0', port=5000, debug=True)