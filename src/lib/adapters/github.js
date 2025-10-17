async function getJSON(url) {
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Basic card data (already returned by backend)
export async function fetchGhSummary(login) {
  // { login, name, publicRepos, followers, stars, forks, eventsLast30Days }
  return getJSON(`/api/github/${encodeURIComponent(login)}/summary`);
}

export async function fetchGhTodayWeekFromEvents(login) {
  const events = await getJSON(`https://api.github.com/users/${encodeURIComponent(login)}/events?per_page=100`);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = now.getTime() - 7 * 24 * 3600 * 1000;

  let today = 0, week = 0;
  for (const e of events) {
    const t = new Date(e.created_at).getTime();
    if (t >= sevenDaysAgo) week++;
    if (t >= startOfDay) today++;
  }
  return { today, week };
}
