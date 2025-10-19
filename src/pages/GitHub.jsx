// src/pages/GitHub.jsx
import React from "react";
import GitHubProfileCard from "../components/github/GitHubProfileCard";
import { settingsStore } from "../lib/settingsStore";

export default function GitHubPage() {
  const login = settingsStore?.handles?.github || "octocat";
  return (
    <div className="space-y-4">
      <GitHubProfileCard login={login} />
    </div>
  );
}
