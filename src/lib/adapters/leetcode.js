async function getJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error("LC fetch error"); // HTTP guard [10]
  return res.json();
}

export async function fetchLcSummary(username) {
  try {
    const url = `/api/leetcode/${encodeURIComponent(username)}`; // ensure proxy maps this to upstream /<username> [10][1]
    const data = await getJson(url);

    const easy =
      data?.easySolved ??
      data?.submitStatsGlobal?.acSubmissionNum?.find((x) => x?.difficulty === "Easy")?.count ??
      0; // support both shapes [1]

    const medium =
      data?.mediumSolved ??
      data?.submitStatsGlobal?.acSubmissionNum?.find((x) => x?.difficulty === "Medium")?.count ??
      0; // [1]

    const hard =
      data?.hardSolved ??
      data?.submitStatsGlobal?.acSubmissionNum?.find((x) => x?.difficulty === "Hard")?.count ??
      0; // [1]

    const dailyDone = Boolean(data?.dailyQuestionDone || false); // optional convenience flag [1]

    return { easy, medium, hard, dailyDone }; // normalized summary [1]
  } catch {
    return { easy: 0, medium: 0, hard: 0, dailyDone: false }; // graceful fallback [1]
  }
}
