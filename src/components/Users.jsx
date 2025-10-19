// src/components/Users.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./users.css";
import { api } from "../lib/api";

// ---------- helpers ----------
const norm = (s) => (s ?? "").toString().trim();

function parseIso(d) {
  try {
    return d ? new Date(d) : null;
  } catch {
    return null;
  }
}

// Backend returns per-user counters + risk_score + first_seen/last_seen.
// Map to the UI model this page expects.
function mapApiToUi(apiUsers = []) {
  return apiUsers.map((u, i) => {
    const name = norm(u.laptop_name) || `Device ${i + 1}`;
    const lastSeen = parseIso(u.last_seen);
    const isActive = lastSeen && Date.now() - lastSeen.getTime() < 15 * 60 * 1000;

    // bucketize numeric risk_score (0..1) to low/medium/high
    const r = Number(u.risk_score ?? 0);
    const risk = r >= 0.7 ? "high" : r >= 0.5 ? "medium" : "low";

    return {
      id: name,               // stable key across refreshes
      name,
      role: "Endpoint",       // we don’t have roles from backend
      status: isActive ? "active" : "inactive",
      risk,                   // "low" | "medium" | "high"
      _raw: u,
    };
  });
}

const riskOrder = { high: 3, medium: 2, low: 1 };

function getInitials(name) {
  const parts = norm(name).split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts[1]?.[0] || "";
  return (first + last).toUpperCase();
}

function Avatar({ name }) {
  return (
    <div className="avatar" aria-label={`${name} avatar`} title={name}>
      {getInitials(name)}
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
  if (!users.length) return <div className="empty">No data yet</div>;
  return <div className="scroller">{users.map(renderItem)}</div>;
}

function AllUsersGrid({ users }) {
  if (!users.length) return <div className="empty">No users yet</div>;
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

// ---------- component ----------
export default function Users() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (mounted) setLoading(true);
        setErr("");
        const data = await api.users(); // GET /api/users
        const uiUsers = mapApiToUi(data.users || []);
        if (mounted) setUsers(uiUsers);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 10000); // refresh every 10s
    return () => {
      mounted = false;
      clearInterval(id);
    };
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
        {loading && <div className="loading">Loading users…</div>}

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
