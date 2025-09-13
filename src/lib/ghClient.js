export async function ghGraphQL(query, variables = {}) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) throw new Error("Missing VITE_GITHUB_TOKEN"); [1]
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  }); [1]

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GraphQL HTTP ${res.status}: ${text}`);
  } [1]

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}
