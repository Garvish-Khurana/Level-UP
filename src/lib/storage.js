export const STORAGE_KEY = "levelup_settings_v1";

function safeLocalStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    // Accessing localStorage can throw in some contexts (privacy mode) [2]
  }
  return null;
}

export function loadSettings() {
  const ls = safeLocalStorage(); // guard SSR/unavailable storage [2]
  if (!ls) return null;
  try {
    const raw = ls.getItem(STORAGE_KEY); // may return null [1]
    return raw ? JSON.parse(raw) : null; // parse guarded by truthy check [1]
  } catch {
    return null; // corrupted JSON or access error [1]
  }
}

export function saveSettings(obj) {
  const ls = safeLocalStorage(); // [2]
  if (!ls) return false;
  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(obj)); // stringify + store [1]
    return true;
  } catch {
    // Quota exceeded or circular structure; swallow to avoid crashing [2]
    return false;
  }
}

// Optional: helper to merge settings atomically
export function updateSettings(patch) {
  const current = loadSettings() || {};
  const next = { ...current, ...patch };
  return saveSettings(next); // returns boolean success [1]
}
