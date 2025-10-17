// src/lib/adapters/leetcode.js
async function getJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Fetch one year of calendar and parse to { date, count }[]
export async function fetchLcCalendar(username, year = new Date().getUTCFullYear()) {
  const cal = await getJson(`/api/leetcode/${encodeURIComponent(username)}/calendar/${year}`);
  const raw = cal?.submissionCalendar ?? "{}";
  const obj = typeof raw === "string" ? JSON.parse(raw || "{}") : (raw || {});
  const days = Object.entries(obj)
    .map(([sec, count]) => ({
      date: new Date(Number(sec) * 1000).toISOString().slice(0, 10),
      count: Number(count) || 0,
    }))
    .filter(d => d.date.startsWith(String(year)))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { days, streak: Number(cal?.streak) || 0 };
}

// One-call dashboard; also attach current-year calendar as a baseline
export async function fetchLcDashboard(username) {
  const dash = await getJson(`/api/dashboard?${new URLSearchParams({ lc: username }).toString()}`);
  const lc = dash?.leetcode || null;

  const summary = await getJson(`/api/leetcode/${encodeURIComponent(username)}/summary`).catch(() => null);
  const badges = summary?.badges || [];

  let solved = { easy: 0, medium: 0, hard: 0, totalBank: {} };
  try {
    const s = await fetch(`https://leetcode-stats-api.vercel.app/${encodeURIComponent(username)}`).then(r => r.json());
    solved = {
      easy: Number(s?.easySolved) || 0,
      medium: Number(s?.mediumSolved) || 0,
      hard: Number(s?.hardSolved) || 0,
      totalBank: {
        easy: Number(s?.totalEasy) || undefined,
        medium: Number(s?.totalMedium) || undefined,
        hard: Number(s?.totalHard) || undefined,
      },
    };
  } catch {}

  const calendar = await fetchLcCalendar(username).catch(() => ({ days: [], streak: 0 }));

  if (!lc) {
    return {
      contests: { rating: null, globalRanking: null, attended: 0, topPercentage: null, totalParticipants: 0, history: [], meta: [], dist: [] },
      solved,
      badges,
      calendar,
    };
  }

  return {
    contests: {
      rating: lc.rating ?? null,
      globalRanking: lc.globalRanking ?? null,
      attended: lc.attended ?? 0,
      topPercentage: lc.topPercentage ?? null,
      totalParticipants: lc.totalParticipants ?? 0,
      history: lc.history || [],
      meta: lc.meta || [],
      dist: lc.dist || [],
    },
    solved,
    badges,
    calendar,
  };
}

export async function fetchLcSummary(username) {
  return getJson(`/api/leetcode/${encodeURIComponent(username)}/summary`);
}

export async function fetchLcDistribution() {
  // returns { bins:[{start,end,count}], totalParticipants }
  return getJson(`/api/leetcode/contest-distribution`);
}
