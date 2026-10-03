// Adjust BASE / token lookup to match your app.
const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/admin/payments`;
const call = async (method, path, body) => {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error(j.message || `Request failed (${r.status})`);
  return j;
};
export const api = {
  get: (p) => call('GET', p), post: (p, b) => call('POST', p, b),
  put: (p, b) => call('PUT', p, b), patch: (p, b) => call('PATCH', p, b),
};
export const qs = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== '' && v != null)).toString();