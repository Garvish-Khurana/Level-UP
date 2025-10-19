// export async function ghGraphQL(query, variables = {}) {
//   const token = import.meta.env.VITE_GITHUB_TOKEN;
//   if (!token) throw new Error("Missing VITE_GITHUB_TOKEN"); [1]
//   const res = await fetch("https://api.github.com/graphql", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ query, variables }),
//   }); [1]

//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`GitHub GraphQL HTTP ${res.status}: ${text}`);
//   } [1]

//   const json = await res.json();
//   if (json.errors) {
//     throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors)}`);
//   }
//   return json.data;
// }

// src/lib/githubClient.js
// src/lib/githubClient.js
import { getJSON } from "../lib/api";

export async function ghFetchSummary(login) {
  return getJSON(`/api/github/${encodeURIComponent(login)}/summary`);
}

export async function ghFetchCalendar(login, year, includePrivate = false, opts = {}) {
  const qs = new URLSearchParams();
  qs.set("range", opts.range || "rolling");
  if (includePrivate) qs.set("private", "1");
  if (opts.from) qs.set("from", opts.from);
  if (opts.to) qs.set("to", opts.to);
  const url = `/api/github/${encodeURIComponent(login)}/calendar/${year}?${qs.toString()}`;
  return getJSON(url);
}

export async function ghFetchRepoRollup(login) {
  return getJSON(`/api/github/${encodeURIComponent(login)}/repos/rollup`);
}
