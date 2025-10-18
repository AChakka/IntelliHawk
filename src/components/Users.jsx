// src/components/Users.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./users.css";
import { api } from "../lib/api"; // <-- uses the tiny client we added earlier

// --- helpers -------------------------------------------------

// Backend returns: laptop_name, last_seen, risk_score, risk_level, ...
// Your UI wants: { id, name, role, status, risk }
function mapApiToUi(apiUsers = []) {
  return apiUsers.map((u, i) => {
    const lastSeen = u.last_seen ? new Date(u.last_seen) : null;

    // simple "active" heuristic: seen in last 15 minutes
    const isActive =
      lastSeen && Date.now() - lastSeen.getTime() < 15 * 60 * 1000;

    // bucketize numeric risk_score (0..1) to low/medium/high for your pills
    const risk =
      u.risk_score >= 0.70 ? "high" :
      u.risk_score >= 0.50 ? "medium" : "low";

    return {
      id: u.laptop_name || String(i + 1),
      name: u.laptop_name || `Device ${i + 1}`,
      role: "Endpoint",            // backend has no role; label devices plainly
      status: isActive ? "active" : "inactive",
      risk,                        // "low" | "medium" | "high"
      _raw: u,                     // keep original around if you want to show more later
    };
  });
}

const riskOrder = { high: 3, medium: 2, low: 1 };

function getInitials(name) {
  const parts = name.split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts[1]?.[0] || "";
  return (first + last).toUpperCase();
}

function Avatar({ name }) {
  const initials = getInitials(name);
  return (
    <div className="avatar" aria-label={`${name} avatar`} title={name}>
      {initials}
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

function SectionHeader({ title, action }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {action}
    </div>
  );
}

function UsersScroller({ users, renderItem }) {
  return <div className="scroller">{users.map(renderItem)}</div>;
}

function AllUsersGrid({ users }) {
  return (
    <div className="grid">
      {users.map((u) => (
        <div className="card" key={u.id}>
          <Avatar name={u.name} />
          <div className="card-main">
            <div className="card-top">
              <strong className="name">{u.name}</strong>
              <span className="role">{u.role}</span>
            </div>
            <div className="card-badges">
              <Pill tone={u.status === "active" ? "success" : "muted"}>{u.status}</Pill>
              <Pill tone={u.risk}>{u.risk} risk</Pill>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- main component ------------------------------------------

export default function Users() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setErr("");
        const data = await api.users(); // GET /api/users
        const uiUsers = mapApiToUi(data.users || []);
        if (mounted) setUsers(uiUsers);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load users");
      }
    }

    load();
    const id = setInterval(load, 10000); // refresh every 10s (optional)
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const activeUsers = useMemo(
    () => users.filter((u) => u.status === "active"),
    [users]
  );

  const highestRisk = useMemo(
    () => [...users].sort((a, b) => riskOrder[b.risk] - riskOrder[a.risk]).slice(0, 10),
    [users]
  );

  return (
    <div className="users-page">
      <div className="container">
        {err && <div className="error-banner">Error: {err}</div>}

        <SectionHeader title="Active Users" />
        <UsersScroller
          users={activeUsers}
          renderItem={(u) => (
            <div className="chip" key={u.id}>
              <Avatar name={u.name} />
              <div className="chip-text">
                <span className="name--sm">{u.name}</span>
                <span className="role">{u.role}</span>
              </div>
            </div>
          )}
        />

        <div className="spacer" />
        <SectionHeader title="Highest Risk" />
        <UsersScroller
          users={highestRisk}
          renderItem={(u) => (
            <div className="risk-card" key={u.id}>
              <div className="risk-left">
                <Avatar name={u.name} />
                <div className="chip-text">
                  <span className="name--sm">{u.name}</span>
                  <span className="role">{u.role}</span>
                </div>
              </div>
              <Pill tone={u.risk}>{u.risk} risk</Pill>
            </div>
          )}
        />

        <div className="spacer-lg" />
        <SectionHeader title="All Users" />
        <AllUsersGrid users={users} />
      </div>

      <button type="button" className="fab" aria-label="Add a user" title="Add a user">
        <svg className="fab-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
