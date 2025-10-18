import React from "react";
import "./securityCenter.css";

const sysLogs = [
  { id: 1, timestamp: "2025-10-17 10:12:03", level: "WARN",  source: "auth",   message: "Multiple failed logins for user jlee" },
  { id: 2, timestamp: "2025-10-17 10:15:22", level: "INFO",  source: "kernel", message: "Interface eth0 link up" },
  { id: 3, timestamp: "2025-10-17 10:17:40", level: "ERROR", source: "api",    message: "Rate limit exceeded by 10.0.0.31" },
  { id: 4, timestamp: "2025-10-17 10:22:05", level: "INFO",  source: "cron",   message: "Scheduled job completed: rotate-logs" },
];

const systemActions = [
  { id: 1, time: "2025-10-17 10:18:10", user: "admin",  action: "Locked account",  target: "jlee",          status: "success" },
  { id: 2, time: "2025-10-17 10:19:01", user: "system", action: "Rotated keys",    target: "service-api",   status: "success" },
  { id: 3, time: "2025-10-17 10:20:30", user: "agupta", action: "Changed role",    target: "mgarcia → Analyst", status: "pending" },
  { id: 4, time: "2025-10-17 10:23:44", user: "system", action: "Quarantined host",target: "10.0.0.31",     status: "failed" },
];

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
              <td><span className={`sc-badge sc-badge--${r.level.toLowerCase()}`}>{r.level}</span></td>
              <td>{r.source}</td>
              <td className="sc-cell-ellipsis" title={r.message}>{r.message}</td>
            </tr>
          ))}
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
              <td><span className={`sc-badge sc-badge--${r.status}`}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SecurityCenter() {
  return (
    <div className="sc-page">
      <div className="sc-container">
        <div className="sc-grid">
          <section className="sc-card sc-card--large">
            <SectionHeader title="System Log Data" />
            <SysLogTable rows={sysLogs} />
          </section>

          <section className="sc-card sc-card--large">
            <SectionHeader title="System Action Data" />
            <ActionsTable rows={systemActions} />
          </section>
        </div>
      </div>
    </div>
  );
}
