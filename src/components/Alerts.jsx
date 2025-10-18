// AlertsPage.jsx
import React from "react";
import "./Alerts.css";

// Sample data
const allLogs = [
  { timestamp: "2025-10-17 12:01", user: "jdoe", device: "Laptop-12", event: "Login", severity: "Low" },
  { timestamp: "2025-10-17 12:05", user: "asmith", device: "Desktop-7", event: "File Download", severity: "Medium" },
  { timestamp: "2025-10-17 12:10", user: "toby", device: "Laptop-3", event: "Failed Login", severity: "High" },
];

const suspiciousLogs = [
  { timestamp: "2025-10-17 12:10", user: "toby", device: "Laptop-3", event: "Multiple Failed Logins", severity: "High" },
];

// Reusable Table Component
const AlertTable = ({ title, columns, data }) => (
  <div className="alert-panel">
    <h2 className="panel-title">{title}</h2>
    <table className="alert-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={col}>{row[col.toLowerCase()] ?? "-"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AlertsPage = () => {
  return (
    <div className="alerts-container">
      <AlertTable
        title="All Log Data"
        columns={["Timestamp", "User", "Device", "Event", "Severity"]}
        data={allLogs}
      />
      <AlertTable
        title="Suspicious Log Data"
        columns={["Timestamp", "User", "Device", "Event", "Severity"]}
        data={suspiciousLogs}
      />
    </div>
  );
};

export default AlertsPage;
