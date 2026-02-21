import { STORAGE_VERSION } from './constants';

export function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed._version === STORAGE_VERSION) {
      return parsed.data;
    }
    // Version mismatch or invalid shape — discard
    localStorage.removeItem(key);
    return null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function saveToStorage(key, data) {
  try {
    if (data === null || data === undefined) {
      localStorage.removeItem(key);
      return;
    }
    const wrapped = { _version: STORAGE_VERSION, data };
    localStorage.setItem(key, JSON.stringify(wrapped));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}
