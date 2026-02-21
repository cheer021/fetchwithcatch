const BOT_POOL = Object.freeze([
  { name: 'Captain Woof', color: '#0000CD' },
  { name: 'Sir Barksalot', color: '#228B22' },
  { name: 'Lady Fetchington', color: '#FF8C00' },
  { name: 'Baron Von Paws', color: '#8B008B' },
  { name: 'Duke Droolsworth', color: '#008B8B' },
]);

/**
 * Picks bot identities that don't conflict with the human player's color.
 */
export function pickBots(count, excludeColor) {
  const available = BOT_POOL.filter((b) => b.color !== excludeColor);
  return available.slice(0, count);
}
