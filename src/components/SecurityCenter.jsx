// src/components/SecurityCenter.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import "./securityCenter.css";

/** ---------- helpers to map API → your table shape ---------- **/

const fmtTs = (ts) => {
  try { return ts ? new Date(ts).toLocaleString() : "-"; }
  catch { return ts || "-"; }
};

// Turn /api/events into rows for the SysLog table
function eventsToSysLogs(events = []) {
  const inferLevel = (name = "") => {
    const n = String(name).toLowerCase();
    if (["error", "failed"].some(w => n.includes(w))) return "ERROR";
    if (["warn", "suspicious", "unusual"].some(w => n.includes(w))) return "WARN";
    return "INFO";
  };

  return events.map((e, idx) => ({
    id: idx + 1,
    timestamp: fmtTs(e.received_at || e.timestamp),
    level: inferLevel(e.name),
    source: e.columns?.source || e.name || "event",
    message:
      e.columns?.message ||
      e.columns?.path ||
      e.columns?.name ||
      e.name ||
      "—",
  }));
}

// Turn /api/alerts into rows for the Actions table
function alertsToActions(alerts = []) {
  const sevToStatus = (sev = "HIGH") =>
    sev === "CRITICAL" ? "failed" : "pending";

  return alerts.map((a, idx) => ({
    id: a.id ?? idx + 1,
    time: fmtTs(a.timestamp),
    user: "system",
    action: a.event_type || "Security response",
    target: a.laptop || "—",
    status: sevToStatus(a.severity),
  }));
}

/** ---------------- presentational bits ---------------- **/

function SectionHeader({ title }) {
  return (
    <div className="sc-section-header">
      <h2 className="sc-section-title">{title}</h2>
    </div>
  );
}

function SysLogTable({ rows }) {
  return (
    <div className="sc-table-wrap">
      <table className="sc-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Level</th>
            <th>Source</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.timestamp}</td>
              <td>
                <span className={`sc-badge sc-badge--${r.level.toLowerCase()}`}>
                  {r.level}
                </span>
              </td>
              <td>{r.source}</td>
              <td className="sc-cell-ellipsis" title={r.message}>
                {r.message}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="sc-empty">No logs yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ActionsTable({ rows }) {
  return (
    <div className="sc-table-wrap">
      <table className="sc-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Target</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.time}</td>
              <td>{r.user}</td>
              <td>{r.action}</td>
              <td className="sc-cell-ellipsis" title={r.target}>{r.target}</td>
              <td>
                <span className={`sc-badge sc-badge--${r.status}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="sc-empty">No actions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** ---------------- main component: fetch + render ---------------- **/

export default function SecurityCenter() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [eventRows, setEventRows] = useState([]);
  const [actionRows, setActionRows] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const [eventsRes, alertsRes] = await Promise.all([
          api.events({ limit: 200 }), // ✅ new api signature
          api.alerts({ limit: 200 }), // ✅ new api signature
        ]);

        if (!mounted) return;
        setEventRows(eventsToSysLogs(eventsRes.events || []));
        setActionRows(alertsToActions(alertsRes.alerts || []));
        setErr("");
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const id = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="sc-page">
      <div className="sc-container">
        {err && <div className="sc-error">Error: {err}</div>}
        {loading && <div className="sc-loading">Loading…</div>}

        <div className="sc-grid">
          <section className="sc-card sc-card--large">
            <SectionHeader title="High Risk Log Data" />
            <SysLogTable rows={eventRows} />
          </section>

          <section className="sc-card sc-card--large">
            <SectionHeader title="System Action Data" />
            <ActionsTable rows={actionRows} />
          </section>
        </div>
      </div>
    </div>
  );
}
