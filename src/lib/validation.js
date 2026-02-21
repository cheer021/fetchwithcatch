export function validatePlayerName(name) {
  if (typeof name !== 'string') return 'Name must be a string.';
  const trimmed = name.trim();
  if (trimmed.length < 1) return 'Name is required.';
  if (trimmed.length > 20) return 'Name must be 20 characters or less.';
  return null;
}

export function validateColor(color) {
  if (typeof color !== 'string') return 'Invalid color.';
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return 'Invalid hex color.';
  return null;
}

export function isValidGameState(state) {
  if (!state || typeof state !== 'object') return false;
  if (!Array.isArray(state.players) || state.players.length < 2) return false;
  if (typeof state.currentPlayerIndex !== 'number') return false;
  if (typeof state.turnNumber !== 'number') return false;
  if (!['active', 'finished'].includes(state.gameStatus)) return false;
  return true;
}
