const BASE = 'https://api.paystack.co';
export const ps = async (path, method = 'GET', body) => {
  const r = await fetch(BASE + path, {
    method,
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.status) throw new Error(j.message || `Paystack error ${r.status}`);
  return j.data;
};
let banks; // cached
export async function resolveBankCode(name = '', explicit) {
  if (explicit) return explicit;
  banks ||= await ps('/bank?country=nigeria&perPage=100');
  const n = name.toLowerCase().replace(/[^a-z]/g, '');
  const b = banks.find((x) => { const m = x.name.toLowerCase().replace(/[^a-z]/g, ''); return m.includes(n) || n.includes(m); });
  if (!b) throw new Error(`Cannot resolve bank code for "${name}"`);
  return b.code;
}