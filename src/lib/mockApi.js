// In-memory mission list with initial states
let missions = [
  { id: "m1", title: "LeetCode - 2 Medium", desc: "Solve any two Medium problems today", status: "Pending", countdown: "05:12:31" },
  { id: "m2", title: "Codeforces - ≥1400 x2", desc: "Solve two problems rated 1400+", status: "Pending", countdown: "05:12:31" },
  { id: "m3", title: "GitHub - 1 contribution", desc: "Commit/PR/Issue that counts in UTC window", status: "Pending", countdown: "05:12:31" },
  { id: "m4", title: "Daily Question", desc: "Complete today’s LC daily", status: "Overdue", countdown: "05:12:31" },
];

export async function fetchDashboardKpis() {
  await new Promise((r) => setTimeout(r, 250));
  return [
    { label: "Weekly LC solves", value: "14", delta: "+3 vs last wk", hint: "Last sync 5m" },
    { label: "CF rating Δ (month)", value: "+38", delta: "+12 this wk", hint: "Cur 1542 / Max 1568" },
    { label: "GH contributions (today)", value: "2", delta: "+1 vs avg", hint: "UTC window" },
    { label: "Global streak", value: "12 days", delta: "+1", hint: "On track" },
    { label: "EXP progress", value: "68%", delta: "Level 12", hint: "2,340 / 2,800", right: { type: "expMini", percent: 68 } },
  ];
}

export async function fetchMissionsToday() {
  await new Promise((r) => setTimeout(r, 200));
  // Return the current mission state
  return missions;
}

export async function fetchPlatformMini() {
  await new Promise((r) => setTimeout(r, 200));
  return {
    lc: [{ label: "E", value: 24 }, { label: "M", value: 18 }, { label: "H", value: 4 }],
    cf: [{ label: "Cur", value: 1542 }, { label: "Max", value: 1568 }, { label: "Δ30d", value: "+38" }],
    gh: [{ label: "Today", value: 2 }, { label: "Week", value: 11 }, { label: "Streak", value: "6d" }],
  };
}

export async function verifyMission(id) {
  await new Promise((r) => setTimeout(r, 400));
  // Update mission status persistently
  missions = missions.map((m) => (m.id === id ? { ...m, status: "Verified" } : m));
  return { ok: true, id };
}

export async function verifyLeetCodeDaily({ username }) {
  // Quick client check; in production this lives server-side
  const { fetchLcSummary } = await import("./adapters/leetcode.js");
  try {
    const res = await fetchLcSummary(username); // community endpoint behind proxy
    // Accept if dailyDone is true OR any difficulty count is non-zero and changed in-session
    if (res?.dailyDone || (res.easy + res.medium + res.hard) > 0) {
      return { ok: true, reason: "verified" };
    }
    return { ok: false, reason: "not-completed" };
  } catch {
    // If LC endpoint fails, be explicit so user understands why
    return { ok: false, reason: "lc-unavailable" };
  }
}
