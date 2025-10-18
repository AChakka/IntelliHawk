#!/usr/bin/env python3

import json
import time
import requests
from pathlib import Path

LOG_FILE = r"C:\Program Files\osquery\log\osqueryd.results.log"
FLASK_ENDPOINT = "http://localhost:5000/api/ingest/osquery"
POLL_INTERVAL = 1

def follow_log_file(log_path):
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        f.seek(0, 2)
        
        while True:
            line = f.readline()
            if line:
                yield line.strip()
            else:
                time.sleep(POLL_INTERVAL)


def send_to_flask(event_data):
    try:
        response = requests.post(
            FLASK_ENDPOINT,
            json=event_data,
            timeout=5
        )
        if response.status_code == 200:
            return True
        else:
            print(f"Flask returned {response.status_code}: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Error sending to Flask: {e}")
        return False


def main():
    print("=" * 70)
    print("OSQUERY LOG FORWARDER")
    print("=" * 70)
    print(f"Reading from: {LOG_FILE}")
    print(f"Forwarding to: {FLASK_ENDPOINT}")
    print("=" * 70)
    print("")
    
    if not Path(LOG_FILE).exists():
        print(f"Log file not found: {LOG_FILE}")
        print("   Make sure OSQuery is running!")
        return
    
    try:
        health_check = requests.get("http://localhost:5000/api/health", timeout=2)
        if health_check.status_code == 200:
            print("Flask backend is reachable")
        else:
            print("Flask backend returned unexpected status")
    except:
        print("Cannot reach Flask backend at http://localhost:5000")
        print("   Make sure Flask is running: python app.py")
        return
    
    print("")
    print("Starting to forward events...")
    print("   (Press Ctrl+C to stop)")
    print("")
    
    events_sent = 0
    errors = 0
    
    try:
        for line in follow_log_file(LOG_FILE):
            if not line:
                continue
            
            try:
                event = json.loads(line)
                
                if send_to_flask(event):
                    events_sent += 1
                    print(f"Event #{events_sent}: {event.get('name', 'unknown')} from {event.get('hostIdentifier', 'unknown')}")
                else:
                    errors += 1
                    
            except json.JSONDecodeError:
                continue
            except KeyboardInterrupt:
                raise
            except Exception as e:
                errors += 1
                print(f"Error processing line: {e}")
    
    except KeyboardInterrupt:
        print("")
        print("=" * 70)
        print("Stopping forwarder...")
        print(f"Total events sent: {events_sent}")
        print(f"Errors: {errors}")
        print("=" * 70)


if __name__ == "__main__":
    main()