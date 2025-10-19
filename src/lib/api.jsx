// src/lib/api.js
// Using Vite proxy in dev. Set BASE='' and configure /api proxy in vite.config.js.
const BASE = '';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function post(path, body = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Utility: case-insensitive laptop match like backend normalize_hostname()
const norm = s => (s ?? '').toString().trim().toLowerCase();

export const api = {
  // ----- core passthroughs -----
  health:  () => get('/api/health'),
  summary: () => get('/api/summary'),
  users:   () => get('/api/users'),

  alerts:  async (opts = {}) => {
    // Backend supports: limit, laptop
    const limit = opts.limit ?? 100;
    const qp = new URLSearchParams({ limit: String(limit) });
    if (opts.laptop) qp.set('laptop', opts.laptop);

    const data = await get(`/api/alerts?${qp.toString()}`);

    // Optional client-side severity filter to maintain compatibility
    if (opts.severity) {
      const want = opts.severity.toString().trim().toUpperCase();
      const filtered = (data.alerts || []).filter(a => (a.severity || '').toUpperCase() === want);
      return { count: filtered.length, alerts: filtered };
    }
    return data;
  },

  events:  async (opts = {}) => {
    // Backend supports: limit, type
    const limit = opts.limit ?? 50;
    const qp = new URLSearchParams({ limit: String(limit) });
    if (opts.type) qp.set('type', opts.type);

    const data = await get(`/api/events?${qp.toString()}`);

    // Optional client-side laptop filter for convenience
    if (opts.laptop) {
      const lk = norm(opts.laptop);
      const filtered = (data.events || []).filter(e => norm(e.hostIdentifier) === lk);
      return { count: filtered.length, events: filtered };
    }
    return data;
  },

  // ----- shims / helpers -----
  // Emulate GET /api/users/:laptop by selecting from /api/users
  user: async (laptop) => {
    const all = await get('/api/users'); // { count, users: [...] }
    const match = (all.users || []).find(u =>
      norm(u.laptop_name || u.laptop || u.host || '') === norm(laptop)
    );
    if (!match) {
      const err = new Error('404 Not Found');
      err.status = 404;
      throw err;
    }
    return match;
  },

  // Synthesize training data from /api/users for charts or quick models
  trainingData: async () => {
    const { users = [] } = await get('/api/users');
    const rows = users.map(u => {
      const risk = Number(u.risk_score ?? 0);
      return {
        laptop: u.laptop_name || u.laptop || '',
        suspicious_programs_used: u.suspicious_programs_used ?? 0,
        failed_logins: u.failed_logins ?? 0,
        file_access_attempts: u.file_access_attempts ?? 0,
        sensitive_file_access: u.sensitive_file_access ?? 0,
        suspicious_network_activity: u.suspicious_network_activity ?? 0,
        privilege_escalation_attempts: u.privilege_escalation_attempts ?? 0,
        risk_score: risk,
        label_high_risk: risk >= (window.APP_HIGH_RISK_THRESHOLD ?? 0.6) ? 1 : 0,
        first_seen: u.first_seen ?? null,
        last_seen: u.last_seen ?? null,
      };
    });
    return { count: rows.length, data: rows, timestamp: new Date().toISOString() };
  },

  // ----- ingest -----
  ingest: (payload) => post('/api/ingest/osquery', payload),

  // ----- NEW: lock command endpoints -----
  // GET all lock commands (admin view) or laptop-specific when { laptop } provided
  lockCommands: (opts = {}) => {
    if (opts.laptop) {
      const lap = encodeURIComponent(opts.laptop);
      return get(`/api/lock_commands/${lap}`);
    }
    return get('/api/lock_commands');
  },

  // Convenience alias for one laptop
  lockCommandsFor: (laptop) => get(`/api/lock_commands/${encodeURIComponent(laptop)}`),

  // POST mark a lock command executed
  markLockExecuted: (commandId) => post(`/api/lock_commands/${encodeURIComponent(commandId)}/executed`, {}),
};
