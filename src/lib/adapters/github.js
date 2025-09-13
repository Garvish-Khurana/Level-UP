import { ghGraphQL } from "../ghClient";

export async function fetchGhContribSummary(username) {
  const q = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `; // schema: contributionCalendar.weeks.contributionDays is valid [1][5]

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();

  // Full UTC day window
  const start = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999)); // aligns with DateTime input [6]

  const data = await ghGraphQL(q, {
    login: username,
    from: start.toISOString(),
    to: end.toISOString(),
  }); // contributionsCollection allows from/to, max 1 year span [3]

  const weeks = data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
  const days = weeks.flatMap((w) => w?.contributionDays ?? []); // flatten safely [1]

  const isoDate = start.toISOString().slice(0, 10);
  const today = days
    .filter((day) => (day?.date ?? "").slice(0, 10) === isoDate)
    .reduce((acc, day) => acc + Number(day?.contributionCount ?? 0), 0); // sum counts [1]

  // Rolling 7-day window from whatever the API returned
  const last7 = days.slice(-7);
  const week = last7.reduce((acc, day) => acc + Number(day?.contributionCount ?? 0), 0); // rolling sum [5]

  return { today, week };
}
