// components/ThreatOverview.jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import "./ThreatOverview.css";

const eventsOverTime = [
  { date: "Mon", alerts: 60, incidents: 3 },
  { date: "Tue", alerts: 33, incidents: 1 },
  { date: "Wed", alerts: 55, incidents: 1 },
  { date: "Thu", alerts: 46, incidents: 2 },
  { date: "Fri", alerts: 140, incidents: 6 },
  { date: "Sat", alerts: 5,  incidents: 0 },
  { date: "Sun", alerts: 8, incidents: 0 },
];

const threatSplit = [
  { name: "Low", value: 62 },
  { name: "Medium", value: 31 },
  { name: "High", value: 7}
];

const COLORS = ["#12a72bff", "#d7e233ff", "#d31313ff"];

export default function ThreatOverview() {
  return (
    <div className="threat-grid">
      {/* WIDE LEFT: Line chart */}
      <section className="card card--main">
        <h3 className="section-title">User Security Events </h3>
        <div className="chart-wrap chart-wrap--main">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={eventsOverTime}
              margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="alerts"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* RIGHT: Pie chart + summary */}
      <section className="card card--side">
        <h3 className="section-title">Log Threat Report</h3>

        <div className="side-stack">
          <div className="chart-wrap chart-wrap--side">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffffff",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Pie
                  data={threatSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  label
                >
                  {threatSplit.map((e, i) => (
                    <Cell key={e.name} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend under pie */}
          <div className="pie-legend">
            {threatSplit.map((entry, i) => (
              <div key={entry.name} className="legend-item">
                <span
                  className="legend-dot"
                  style={{ backgroundColor: COLORS[i] }}
                />
                {entry.name} ({entry.value}%)
              </div>
            ))}
          </div>

          <div className="summary">
            <h4>Summary</h4>
            <ul>
              <li>
                <strong>62%</strong> of threats are <strong>low risk</strong>;{" "}
                <strong>38%</strong> are <strong>medium or high risk</strong>.
              </li>
              <li>
                Alerts peak on <strong>Friday</strong>; incidents remain<strong> average</strong> with a small spike on <strong>Wednesday</strong>.
              </li>
              <li>
                Prioritize accounts producing repeated alerts Thu–Fri.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}