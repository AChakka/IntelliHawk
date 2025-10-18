import React, { useEffect, useMemo, useState } from "react";
import "./Alerts.css";
import { api } from "../lib/api";

/* ---------- helpers: map backend → your table rows ---------- */

// Events don’t include “severity”; we infer a simple level for display.
const inferSeverity = (name = "", columns = {}) => {
  const n = String(name).toLowerCase();
  const msg = JSON.stringify(columns).toLowerCase();
  if (/(multiple failed|failed login|error|security_services)/.test(n) || /(failed|stopped|malware|ransom)/.test(msg)) return "High";
  if (/(suspicious|unusual|usb|powershell)/.test(n) || /(usb|enc|b64|remote)/.test(msg)) return "Medium";
  return "Low";
};

// Map /api/events → your columns: Timestamp | User | Device | Event | Severity
function mapEventsToRows(events = []) {
  return events.map((e, i) => ({
    timestamp: e.received_at || e.timestamp || new Date().toISOString(),
    user: e.columns?.username || e.columns?.user || "-",   // best-effort
    device: e.hostIdentifier || "-",
    event: e.name || "-",
    severity: inferSeverity(e.name, e.columns),
    _idx: i,
  }));
}

// Map /api/alerts → your columns. Alerts already have severity.
function mapAlertsToRows(alerts = []) {
  return alerts.map((a) => ({
    timestamp: a.timestamp || new Date().toISOString(),
    user: a.event_details?.columns?.username || "-",       // may not exist
    device: a.laptop || "-",
    event: a.event_type || (a.reasons?.[0] ?? "Alert"),
    severity: (a.severity || "HIGH").slice(0,1) + (a.severity || "HIGH").slice(1).toLowerCase(), // HIGH→High
    _id: a.id,
  }));
}

/* ---------- reusable table stays the same (with empty state) ---------- */

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

/* ------------------------- live page ------------------------- */

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

        const [eventsRes, alertsRes] = await Promise.all([
          api.events({ limit: 200 }),      // /api/events
          api.alerts({ limit: 200 }),      // /api/alerts
        ]);

        if (!mounted) return;

        setAllLogs(mapEventsToRows(eventsRes.events || []));
        setSuspiciousLogs(mapAlertsToRows(alertsRes.alerts || []));
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load alerts");
      } finally {
        if (mounted) { setLoadingEvents(false); setLoadingAlerts(false); }
      }
    };

    load();
    const id = setInterval(load, 5000); // refresh every 5s
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Optional: filter the “all logs” table to show most recent first
  const allLogsDesc = useMemo(
    () => [...allLogs].reverse(),
    [allLogs]
  );

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
