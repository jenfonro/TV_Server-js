export async function fetchBootstrap(page) {
  const url = new URL('/api/bootstrap', window.location.origin);
  if (page) url.searchParams.set('page', page);
  const resp = await fetch(url.toString(), { credentials: 'same-origin' });
  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    throw new Error((data && data.message) || `HTTP ${resp.status}`);
  }
  return data || {};
}

