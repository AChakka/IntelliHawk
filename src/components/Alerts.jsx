// src/components/Alerts.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./Alerts.css";
import { api } from "../lib/api";

/* ---------- helpers: map backend → table rows ---------- */

// Simple severity inference for raw events (backend events have no severity)
const inferSeverity = (name = "", columns = {}) => {
  const n = String(name).toLowerCase();
  const msg = JSON.stringify(columns || {}).toLowerCase();
  if (/(multiple failed|failed login|error|security_services)/.test(n) || /(failed|stopped|malware|ransom)/.test(msg))
    return "High";
  if (/(suspicious|unusual|usb|powershell)/.test(n) || /(usb|enc|b64|remote)/.test(msg))
    return "Medium";
  return "Low";
};

const fmtTs = (ts) => {
  try {
    return ts ? new Date(ts).toLocaleString() : "-";
  } catch {
    return ts || "-";
  }
};

// Map GET /api/events → rows: Timestamp | User | Device | Event | Severity
function mapEventsToRows(events = []) {
  return events.map((e, i) => ({
    timestamp: fmtTs(e.received_at || e.timestamp),
    user: e.columns?.username || e.columns?.user || "-", // best-effort
    device: e.hostIdentifier || "-",
    event: e.name || "-",
    severity: inferSeverity(e.name, e.columns),
    _idx: i,
  }));
}

// Map GET /api/alerts → rows (backend already includes severity & event_type)
function mapAlertsToRows(alerts = []) {
  return alerts.map((a) => ({
    timestamp: fmtTs(a.timestamp),
    user: "-", // backend alert doesn't carry a user field
    device: a.laptop || "-",
    event: a.event_type || "Alert",
    severity: String(a.severity || "HIGH").toUpperCase().slice(0, 1) +
      String(a.severity || "HIGH").toLowerCase().slice(1), // HIGH→High
    _id: a.id,
  }));
}

/* ---------- reusable table ---------- */

const AlertTable = ({ title, columns, data, loading }) => (
  <div className="alert-panel">
    <h2 className="panel-title">{title}</h2>
    <table className="alert-table">
      <thead>
        <tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={columns.length}>Loading…</td></tr>
        ) : data.length === 0 ? (
          <tr><td colSpan={columns.length}>No data yet.</td></tr>
        ) : (
          data.map((row, idx) => (
            <tr key={row._id ?? row._idx ?? idx}>
              <td>{row.timestamp}</td>
              <td>{row.user}</td>
              <td>{row.device}</td>
              <td>{row.event}</td>
              <td>{row.severity}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

/* ------------------------- page ------------------------- */

export default function AlertsPage() {
  const [allLogs, setAllLogs] = useState([]);
  const [suspiciousLogs, setSuspiciousLogs] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setError("");
        setLoadingEvents(true);
        setLoadingAlerts(true);

        // Supported by backend + new api client:
        const [eventsRes, alertsRes] = await Promise.all([
          api.events({ limit: 200 }), // GET /api/events?limit=200
          api.alerts({ limit: 200 }), // GET /api/alerts?limit=200
        ]);

        if (!mounted) return;

        setAllLogs(mapEventsToRows(eventsRes.events || []));
        setSuspiciousLogs(mapAlertsToRows(alertsRes.alerts || []));
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load alerts");
      } finally {
        if (mounted) {
          setLoadingEvents(false);
          setLoadingAlerts(false);
        }
      }
    };

    load();
    const id = setInterval(load, 5000); // refresh every 5s
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Show most recent first in “All Log Data”
  const allLogsDesc = useMemo(() => [...allLogs].reverse(), [allLogs]);

  return (
    <div className="alerts-container">
      {error && <div className="alert-error">Error: {error}</div>}

      <AlertTable
        title="All Log Data"
        columns={["Timestamp", "User", "Device", "Event", "Severity"]}
        data={allLogsDesc}
        loading={loadingEvents}
      />

      <AlertTable
        title="Suspicious Log Data"
        columns={["Timestamp", "User", "Device", "Event", "Severity"]}
        data={suspiciousLogs}
        loading={loadingAlerts}
      />
    </div>
  );
}
