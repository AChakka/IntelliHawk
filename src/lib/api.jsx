// src/lib/api.js
const BASE = ''; // using Vite proxy in dev

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  health:       () => get('/api/health'),
  summary:      () => get('/api/summary'),
  events:       (opts = {}) => get(`/api/events?limit=${opts.limit ?? 50}${opts.laptop ? `&laptop=${opts.laptop}` : ''}`),
  users:        () => get('/api/users'),
  user:         (laptop) => get(`/api/users/${encodeURIComponent(laptop)}`),
  alerts:       (opts = {}) => get(`/api/alerts?limit=${opts.limit ?? 100}${opts.laptop ? `&laptop=${opts.laptop}` : ''}${opts.severity ? `&severity=${opts.severity}` : ''}`),
  trainingData: () => get('/api/training-data'),
  ingest:       (payload) => post('/api/ingest/osquery', payload),
};
