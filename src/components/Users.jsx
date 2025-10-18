import React from "react";
import "./users.css";

// Sample data
const sampleUsers = [
  { id: 1, name: "Ava Patel", role: "Analyst", status: "active", risk: "high" },
  { id: 2, name: "Liam Chen", role: "Engineer", status: "active", risk: "medium" },
  { id: 3, name: "Noah Smith", role: "Manager", status: "inactive", risk: "low" },
  { id: 4, name: "Mia Garcia", role: "Scientist", status: "active", risk: "high" },
  { id: 5, name: "Ethan Johnson", role: "Intern", status: "active", risk: "low" },
  { id: 6, name: "Olivia Davis", role: "Engineer", status: "inactive", risk: "medium" },
  { id: 7, name: "Sophia Martinez", role: "Security", status: "active", risk: "medium" },
  { id: 8, name: "James Lee", role: "Engineer", status: "active", risk: "high" },
];

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

export default function Users({ users = sampleUsers }) {
  const activeUsers = users.filter((u) => u.status === "active");
  const highestRisk = [...users]
    .sort((a, b) => riskOrder[b.risk] - riskOrder[a.risk])
    .slice(0, 10);

  return (
    <div className="users-page">
      <div className="container">
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
        <svg
          className="fab-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
