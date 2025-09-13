export async function cfGetJson(path) {
  const url = `/api/cf/api${path}`;
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  const json = await res.json();
  if (json.status !== "OK") throw new Error(json.comment || "CF API error");
  return json.result;
}

// Compute current, max, and Δ30d from rating history
export async function fetchCfRatingSummary(handle) {
  // 1) user.info for current/max
  const [info] = await cfGetJson(`/user.info?handles=${encodeURIComponent(handle)}`);
  const current = info.rating ?? 0;
  const max = info.maxRating ?? current;

  // 2) user.rating for history
  const history = await cfGetJson(`/user.rating?handle=${encodeURIComponent(handle)}`);
  const nowSec = Math.floor(Date.now() / 1000);
  const day30 = nowSec - 30 * 24 * 3600;

  let last30Start = current;
  let lastContest = null;

  if (history.length > 0) {
    // last contest
    lastContest = history[history.length - 1];
    // find rating before 30 days window
    const before = [...history].reverse().find(
      (h) => h.ratingUpdateTimeSeconds <= day30
    ) || null;
    last30Start = before?.newRating ?? current;
  }

  const delta30 = current - last30Start;

  return {
    handle,
    current,
    max,
    delta30,
    lastContest: lastContest
      ? {
          contestId: lastContest.contestId,
          contestName: lastContest.contestName,
          newRating: lastContest.newRating,
          oldRating: lastContest.oldRating,
          delta: lastContest.newRating - lastContest.oldRating,
          when: lastContest.ratingUpdateTimeSeconds,
        }
      : null,
  };
}
