import React from "react";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar
} from "recharts";
import "./ThreatOverview.css";

// --- demo data (swap with real data later) ---
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

const eventTypes = [
  { type: "Failed Logins", value: 54 },
  { type: "Privilege Esc.", value: 21 },
  { type: "Data Exfil", value: 12 },
  { type: "Malware", value: 9 },
];

// color palette
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ThreatOverview() {
  return (
    <div className="threat-grid">
      {/* KPI Trend */}
      <section className="card">
        <h3 className="section-title">User Security Events (7 days)</h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
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

      {/* Internal vs External */}
      <section className="card">
        <h3 className="section-title">Threat Source Split</h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={threatSplit}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {threatSplit.map((e, i) => (
                  <Cell key={e.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Event types */}
      <section className="card">
        <h3 className="section-title">Top Event Categories</h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={eventTypes} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
