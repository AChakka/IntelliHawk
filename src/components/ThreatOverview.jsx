// ThreatOverview.jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import "./ThreatOverview.css";

const eventsOverTime = [
  { date: "Mon", alerts: 110, incidents: 3 },
  { date: "Tue", alerts: 135, incidents: 5 },
  { date: "Wed", alerts: 120, incidents: 4 },
  { date: "Thu", alerts: 160, incidents: 6 },
  { date: "Fri", alerts: 140, incidents: 5 },
  { date: "Sat", alerts: 95,  incidents: 2 },
  { date: "Sun", alerts: 100, incidents: 3 },
];

const threatSplit = [
  { name: "External", value: 62 },
  { name: "Internal", value: 38 },
];
const COLORS = ["#3b82f6", "#10b981"];

export default function ThreatOverview() {
  return (
  <div className="threat-grid">
    {/* WIDE LEFT */}
    <section className="card card--main">
      <h3 className="section-title">User Security Events (7 days)</h3>
      <div className="chart-wrap chart-wrap--main">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={eventsOverTime} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="alerts" stroke="#3b82f6" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>

    {/* RIGHT: pie + summary in one card */}
    <section className="card card--side">
      <h3 className="section-title">Threat Source Split</h3>

      <div className="side-stack">
        <div className="chart-wrap chart-wrap--side">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie data={threatSplit} dataKey="value" nameKey="name" innerRadius={60} outerRadius={92} paddingAngle={2}>
                {threatSplit.map((e, i) => <Cell key={e.name} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="summary">
          <h4>Summary</h4>
          <ul>
            <li><strong>62%</strong> of threats are <strong>External</strong>; <strong>38%</strong> are <strong>Internal</strong>.</li>
            <li>Alerts peak mid-week; incidents remain low with a small spike on Thu.</li>
            <li>Prioritize accounts producing repeated alerts Thu–Fri.</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
  );
}
