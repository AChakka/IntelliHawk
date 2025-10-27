import React from "react";
import "./Roles.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const rolesData = [
  {
    role: "Human Resources",
    lead: "Alice Chen",
    users: ["Dylan Morris", "Sofia Patel", "Marcus Reed", "Rachel Raddish"],
    riskScores: [
      { name: "9/22", risk: 24 },
      { name: "9/29", risk: 35 },
      { name: "10/6", risk: 35 },
      { name: "10/13", risk: 30 },
    ],
  },
  {
    role: "IT Administrators",
    lead: "Ryan Kim",
    users: ["Jamal Ortiz", "Erin Blake", "Tara Li"],
    riskScores: [
      { name: "9/22", risk: 10 },
      { name: "9/29", risk: 12 },
      { name: "10/6", risk: 8 },
      { name: "10/13", risk: 22 },
    ],
  },
  {
    role: "Finance Operations",
    lead: "Emily Zhao",
    users: ["Carlos Vega", "Nina Tran"],
    riskScores: [
      { name: "9/22", risk: 25 },
      { name: "9/29", risk: 22 },
      { name: "10/6", risk: 67 },
      { name: "10/13", risk: 27 },
    ],
  },
];

export default function Roles() {
  return (
    <div className="roles-page">
      <div className="roles-header">
        <h1 className="roles-title">Roles Overview</h1>
        <button className="add-role-btn">+ Add Role</button>
      </div>

      <div className="roles-horizontal-container">
        {rolesData.map((role) => (
  <div className="role-card" key={role.role}>
    <div className="role-info">
      <h2>{role.role}</h2>
      <p><strong>Team Lead:</strong> {role.lead}</p>
      <p><strong>Members:</strong> {role.users.join(", ")}</p>
    </div>

    <div className="role-chart">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={role.riskScores}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis dataKey="name" stroke="#aab3c5" />
          <YAxis stroke="#aab3c5" domain={[0, 100]} />
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

    <div className="role-logs">
      <h4>High Risk Logs</h4>
      <ul>
        {role.role === "Human Resources" && (
          <>
            <li>🔴 Unusual login from Brazil - Rachel Raddish</li>
            <li>🔴 Multiple failed password attempts - Marcus Reed</li>
          </>
        )}
        {role.role === "IT Administrators" && (
          <>
            <li>🔴 Root access escalation - Jamal Ortiz</li>
            <li>🔴 Suspicious script execution - Tara Li</li>
          </>
        )}
        {role.role === "Finance Operations" && (
          <>
            <li>🔴 Unauthorized invoice export - Nina Tran</li>
            <li>🔴 Login from unknown device - Carlos Vega</li>
          </>
        )}
      </ul>
    </div>
  </div>
))}
      </div>
    </div>
  );
}
