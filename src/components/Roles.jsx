import React from "react";
import "./Roles.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const rolesData = [
  {
    role: "Security Analysts",
    lead: "Alice Chen",
    users: ["Dylan Morris", "Sofia Patel", "Marcus Reed"],
    riskScores: [
      { name: "Week 1", risk: 60 },
      { name: "Week 2", risk: 40 },
      { name: "Week 3", risk: 70 },
      { name: "Week 4", risk: 55 },
    ],
  },
  {
    role: "IT Administrators",
    lead: "Ryan Kim",
    users: ["Jamal Ortiz", "Erin Blake", "Tara Li"],
    riskScores: [
      { name: "Week 1", risk: 20 },
      { name: "Week 2", risk: 35 },
      { name: "Week 3", risk: 25 },
      { name: "Week 4", risk: 30 },
    ],
  },
  {
    role: "Finance Operations",
    lead: "Emily Zhao",
    users: ["Carlos Vega", "Nina Tran"],
    riskScores: [
      { name: "Week 1", risk: 45 },
      { name: "Week 2", risk: 55 },
      { name: "Week 3", risk: 65 },
      { name: "Week 4", risk: 50 },
    ],
  },
];

export default function Roles() {
  return (
    <div className="roles-page">
      <h1 className="roles-title">Roles Overview</h1>

      <div className="roles-grid">
        {rolesData.map((role) => (
          <div className="role-card" key={role.role}>
            <div className="role-header">
              <h2>{role.role}</h2>
              <button className="add-role-btn">+ Add Role</button>
            </div>

            <p>
              <strong>Team Lead:</strong> {role.lead}
            </p>
            <p>
              <strong>Members:</strong> {role.users.join(", ")}
            </p>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={role.riskScores}>
                  <XAxis dataKey="name" stroke="#aab3c5" />
                  <YAxis stroke="#aab3c5" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1b2a",
                      border: "1px solid #1b263b",
                      color: "white",
                    }}
                  />
                  <Bar dataKey="risk" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
