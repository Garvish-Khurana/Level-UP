// src/lib/adapters/codeforces.js
async function getJSON(url) {
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Preferred: single backend call with compact summary
export async function fetchCfSummary(handle) {
  // { handle, rating, maxRating, rank, contests, solvedCount, history: [...] }
  return getJSON(`/api/codeforces/${encodeURIComponent(handle)}/summary`);
}
