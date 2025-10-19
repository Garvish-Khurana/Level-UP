// src/hooks/useGitHub.js
import { useQuery } from "@tanstack/react-query";
import { ghFetchSummary, ghFetchCalendar, ghFetchRepoRollup } from "../lib/githubClient";

export function useGitHubSummary(login) {
  return useQuery({
    queryKey: ["gh-summary", login],
    queryFn: () => ghFetchSummary(login),
    enabled: !!login,
    staleTime: 10 * 60_000,
    retry: 0,
  });
}

export function useGitHubCalendar(login, year) {
  return useQuery({
    queryKey: ["gh-calendar", login, year],
    queryFn: () => ghFetchCalendar(login, year),
    enabled: !!login && !!year,
    staleTime: 10 * 60_000,
  });
}

export function useGitHubRepoRollup(login) {
  return useQuery({
    queryKey: ["gh-repos", login],
    queryFn: () => ghFetchRepoRollup(login),
    enabled: !!login,
    staleTime: 30 * 60_000,
  });
}
