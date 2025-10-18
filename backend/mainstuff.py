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
active_laptops = set()
total_events_received = 0


def get_user_data(laptop_name):
    if laptop_name not in user_data:
        user_data[laptop_name] = {
            'laptop_name': laptop_name,
            'files_accessed_1h': 0,
            'files_accessed_24h': 0,
            'processes_started_1h': 0,
            'processes_started_24h': 0,
            'sensitive_files_accessed': 0,
            'suspicious_programs_used': 0,
            'usb_devices_connected': 0,
            'after_hours_logins': 0,
            'network_connections': 0,
            'first_seen': datetime.now().isoformat(),
            'last_seen': None
        }
    return user_data[laptop_name]


def calculate_risk_score(user):
    risk = 0.0
    risk += min(user['suspicious_programs_used'] * 0.2, 0.4)
    risk += min(user['sensitive_files_accessed'] * 0.1, 0.3)
    risk += min(user['usb_devices_connected'] * 0.3, 0.5)
    risk += min(user['after_hours_logins'] * 0.05, 0.2)
    
    if user['files_accessed_1h'] > 50:
        risk += 0.2
    
    if user['processes_started_1h'] > 30:
        risk += 0.1
    
    return min(risk, 1.0)


def process_event(event_data):
    global total_events_received
    
    laptop = event_data.get('hostIdentifier', 'unknown')
    event_type = event_data.get('name', '')
    details = event_data.get('columns', {})
    
    user = get_user_data(laptop)
    user['last_seen'] = datetime.now().isoformat()
    active_laptops.add(laptop)
    
    if event_type in ['suspicious_processes', 'process_events', 'processes']:
        user['processes_started_1h'] += 1
        user['processes_started_24h'] += 1
        
        process_name = details.get('name', '').lower()
        process_path = details.get('path', '').lower()
        cmdline = details.get('cmdline', '').lower()
        
        if process_name in [p.lower() for p in settings.SUSPICIOUS_PROGRAMS]:
            user['suspicious_programs_used'] += 1
            print(f"Suspicious program: {laptop} -> {process_name}")
        
        if 'powershell' in process_name and cmdline:
            for pattern in settings.POWERSHELL_SUSPICIOUS_PATTERNS:
                if pattern.lower() in cmdline:
                    user['suspicious_programs_used'] += 1
                    print(f"Suspicious PowerShell: {laptop} -> {pattern}")
                    break
    
    elif event_type == 'file_downloads':
        file_path = details.get('path', '') or details.get('filename', '')
        if file_path:
            user['files_accessed_1h'] += 1
            user['files_accessed_24h'] += 1
            
            if any(file_path.lower().endswith(ext) for ext in settings.EXECUTABLE_EXTENSIONS):
                user['suspicious_programs_used'] += 1
                print(f"Executable downloaded: {laptop} -> {file_path}")
    
    elif event_type == 'logged_in_users':
        now = datetime.now()
        hour = now.hour
        weekday = now.weekday()
        
        if hour < settings.WORK_START_HOUR or hour > settings.WORK_END_HOUR or weekday not in settings.WORK_DAYS:
            user['after_hours_logins'] += 1
            print(f"After hours login: {laptop} at {hour}:00")
    
    elif event_type in ['usb_devices', 'usb_activity']:
        user['usb_devices_connected'] += 1
        device_model = details.get('model', 'Unknown')
        device_vendor = details.get('vendor', 'Unknown')
        print(f"USB connected: {laptop} -> {device_vendor} {device_model}")
    
    elif event_type in ['unusual_network_connections', 'network_connections', 'socket_events', 'process_open_sockets']:
        user['network_connections'] += 1
        
        remote_port = details.get('remote_port')
        if remote_port:
            try:
                port_num = int(remote_port)
                if port_num in settings.SUSPICIOUS_PORTS:
                    user['suspicious_programs_used'] += 1
                    print(f"Suspicious port connection: {laptop} -> Port {port_num}")
            except (ValueError, TypeError):
                pass
    
    elif event_type == 'startup_programs':
        program_name = details.get('name', '').lower()
        program_path = details.get('path', '').lower()
        
        if any(tool in program_name or tool in program_path for tool in settings.REMOTE_ACCESS_TOOLS):
            user['suspicious_programs_used'] += 1
            print(f"Remote access tool in startup: {laptop} -> {program_name}")
    
    elif event_type == 'installed_applications':
        app_name = details.get('name', '').lower()
        
        if any(tool in app_name for tool in settings.REMOTE_ACCESS_TOOLS):
            user['suspicious_programs_used'] += 1
            print(f"Remote access tool installed: {laptop} -> {app_name}")
    
    elif event_type == 'admin_users':
        username = details.get('username', 'Unknown')
        print(f"Admin user detected: {laptop} -> {username}")
    
    elif event_type == 'security_services':
        service_name = details.get('name', '')
        status = details.get('status', '')
        
        if status != 'RUNNING':
            user['suspicious_programs_used'] += 2
            print(f"CRITICAL: Security service stopped: {laptop} -> {service_name}")
    
    elif event_type == 'registry_persistence':
        key_path = details.get('key', '').lower()
        data = details.get('data', '').lower()
        
        if any(pattern.lower() in data for pattern in settings.SUSPICIOUS_PROGRAMS):
            user['suspicious_programs_used'] += 1
            print(f"Suspicious registry persistence: {laptop}")
    
    elif event_type == 'powershell_events':
        script_text = details.get('script_block_text', '').lower()
        
        for pattern in settings.POWERSHELL_SUSPICIOUS_PATTERNS:
            if pattern.lower() in script_text:
                user['suspicious_programs_used'] += 1
                print(f"Suspicious PowerShell detected: {laptop} -> {pattern}")
                break
    
    risk_score = calculate_risk_score(user)
    
    if risk_score >= settings.HIGH_RISK_THRESHOLD:
        create_alert(laptop, risk_score, event_data, user)


def create_alert(laptop, risk_score, event_data, user):
    recent_alerts = [a for a in alerts if a['laptop'] == laptop]
    if recent_alerts:
        last_alert_time = datetime.fromisoformat(recent_alerts[-1]['timestamp'])
        time_since_last = (datetime.now() - last_alert_time).total_seconds()
        if time_since_last < settings.ALERT_COOLDOWN:
            return
    
    reasons = []
    if user['suspicious_programs_used'] > 0:
        reasons.append(f"Used {user['suspicious_programs_used']} suspicious programs")
    if user['sensitive_files_accessed'] > 5:
        reasons.append(f"Accessed {user['sensitive_files_accessed']} sensitive files")
    if user['usb_devices_connected'] > 0:
        reasons.append(f"Connected {user['usb_devices_connected']} USB devices")
    if user['after_hours_logins'] > 2:
        reasons.append(f"After-hours activity: {user['after_hours_logins']} logins")
    if user['files_accessed_1h'] > 50:
        reasons.append(f"High volume: {user['files_accessed_1h']} files in 1 hour")
    
    if risk_score >= settings.CRITICAL_RISK_THRESHOLD:
        severity = 'CRITICAL'
    else:
        severity = 'HIGH'
    
    alert = {
        'id': len(alerts) + 1,
        'timestamp': datetime.now().isoformat(),
        'laptop': laptop,
        'risk_score': round(risk_score, 2),
        'severity': severity,
        'reasons': reasons,
        'event_type': event_data.get('name', 'unknown'),
        'event_details': event_data
    }
    
    alerts.append(alert)
    print(f"ALERT #{alert['id']}: {laptop} - Risk: {risk_score:.2f} - {severity}")
    print(f"   Reasons: {', '.join(reasons)}")


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Insider Threat Detection Backend',
        'status': 'running',
        'endpoints': {
            'health': '/api/health',
            'summary': '/api/summary',
            'events': '/api/events',
            'users': '/api/users',
            'alerts': '/api/alerts',
            'osquery_ingestion': '/api/ingest/osquery'
        }
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'total_events': total_events_received,
        'active_laptops': len(active_laptops)
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
        print(f"Error processing event: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/summary', methods=['GET'])
def get_summary():
    high_risk_count = sum(
        1 for user in user_data.values() 
        if calculate_risk_score(user) >= settings.HIGH_RISK_THRESHOLD
    )
    
    return jsonify({
        'active_laptops': len(active_laptops),
        'total_events': total_events_received,
        'total_alerts': len(alerts),
        'high_risk_users': high_risk_count,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/events', methods=['GET'])
def get_events():
    limit = request.args.get('limit', 50, type=int)
    laptop = request.args.get('laptop', None)
    
    if laptop:
        filtered_events = [e for e in events if e.get('hostIdentifier') == laptop]
    else:
        filtered_events = list(events)
    
    recent_events = filtered_events[-limit:]
    
    return jsonify({
        'count': len(recent_events),
        'events': recent_events
    })


@app.route('/api/users', methods=['GET'])
def get_users():
    users_with_risk = []
    for laptop, user in user_data.items():
        risk = calculate_risk_score(user)
        
        users_with_risk.append({
            **user,
            'risk_score': round(risk, 2),
            'risk_level': get_risk_level(risk)
        })
    
    users_with_risk.sort(key=lambda x: x['risk_score'], reverse=True)
    
    return jsonify({
        'count': len(users_with_risk),
        'users': users_with_risk
    })


@app.route('/api/users/<laptop_name>', methods=['GET'])
def get_user_detail(laptop_name):
    if laptop_name not in user_data:
        return jsonify({'error': 'User not found'}), 404
    
    user = user_data[laptop_name]
    risk = calculate_risk_score(user)
    
    user_events = [e for e in events if e.get('hostIdentifier') == laptop_name]
    user_alerts = [a for a in alerts if a['laptop'] == laptop_name]
    
    return jsonify({
        **user,
        'risk_score': round(risk, 2),
        'risk_level': get_risk_level(risk),
        'recent_events': user_events[-20:],
        'alerts': user_alerts
    })


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    limit = request.args.get('limit', 100, type=int)
    laptop = request.args.get('laptop', None)
    severity = request.args.get('severity', None)
    
    filtered_alerts = alerts
    
    if laptop:
        filtered_alerts = [a for a in filtered_alerts if a['laptop'] == laptop]
    
    if severity:
        filtered_alerts = [a for a in filtered_alerts if a['severity'] == severity.upper()]
    
    recent_alerts = filtered_alerts[-limit:]
    
    return jsonify({
        'count': len(recent_alerts),
        'alerts': recent_alerts
    })


@app.route('/api/training-data', methods=['GET'])
def get_training_data():
    training_samples = []
    for laptop, user in user_data.items():
        has_alerts = any(a['laptop'] == laptop for a in alerts)
        
        training_samples.append({
            'features': [
                user['files_accessed_1h'],
                user['files_accessed_24h'],
                user['processes_started_1h'],
                user['processes_started_24h'],
                user['sensitive_files_accessed'],
                user['suspicious_programs_used'],
                user['usb_devices_connected'],
                user['after_hours_logins'],
                user['network_connections']
            ],
            'laptop': laptop,
            'timestamp': user['last_seen'],
            'label': 1 if has_alerts else 0
        })
    
    return jsonify({
        'count': len(training_samples),
        'samples': training_samples,
        'feature_names': [
            'files_accessed_1h',
            'files_accessed_24h',
            'processes_started_1h',
            'processes_started_24h',
            'sensitive_files_accessed',
            'suspicious_programs_used',
            'usb_devices_connected',
            'after_hours_logins',
            'network_connections'
        ]
    })


def get_risk_level(risk_score):
    if risk_score >= 0.85:
        return 'CRITICAL'
    elif risk_score >= 0.70:
        return 'HIGH'
    elif risk_score >= 0.50:
        return 'MEDIUM'
    else:
        return 'LOW'


if __name__ == '__main__':
    print("=" * 70)
    print("INSIDER THREAT DETECTION BACKEND")
    print("=" * 70)
    print(f"OSQuery Endpoint:  http://localhost:5000/api/ingest/osquery")
    print(f"API Summary:       http://localhost:5000/api/summary")
    print(f"Users API:         http://localhost:5000/api/users")
    print(f"Alerts API:        http://localhost:5000/api/alerts")
    print(f"Health Check:      http://localhost:5000/api/health")
    print("=" * 70)
    
    app.run(host='0.0.0.0', port=5000, debug=True)