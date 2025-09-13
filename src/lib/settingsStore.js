import { loadSettings, saveSettings } from "./storage";

const defaults = {
  tz: "IST",
  handles: { github: "", codeforces: "", leetcode: "" },
  githubUtcHint: true,
};

// Hydrate from storage with fallback to defaults
const initial =
  loadSettings() && typeof loadSettings() === "object"
    ? { ...defaults, ...loadSettings(), handles: { ...defaults.handles, ...(loadSettings().handles || {}) } }
    : { ...defaults }; // immutable merge, nested handles merged [8][9]

export const settingsStore = {
  ...initial,

  // Merge updates immutably, preserving nested handles keys
  set(next) {
    // Compute next state without mutating "this"
    const nextState = {
      tz: next.tz !== undefined ? next.tz : this.tz,
      githubUtcHint:
        next.githubUtcHint !== undefined ? next.githubUtcHint : this.githubUtcHint,
      handles: {
        ...this.handles,
        ...(next.handles || {}),
      },
    }; // nested immutable merge [9]

    // Assign the computed state to the store object
    Object.assign(this, nextState); // safe because nextState is entirely new refs [9]

    // Persist only serializable data
    saveSettings({
      tz: this.tz,
      handles: this.handles,
      githubUtcHint: this.githubUtcHint,
    }); // stringify + store [8]
  },
};
