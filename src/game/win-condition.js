import { MAX_TURN_LIMIT } from '../lib/constants';

/**
 * Checks if a player is bankrupt (money below 0).
 */
export function isBankrupt(player) {
  return player.money < 0;
}

/**
 * Returns active (non-bankrupt) players.
 */
export function getActivePlayers(players) {
  return players.filter((p) => !p.isBankrupt);
}

/**
 * Checks if the game should end. Returns { isOver, reason, winnerId }.
 */
export function checkGameOver(players, turnNumber) {
  const active = getActivePlayers(players);

  // Only one player left
  if (active.length <= 1) {
    return Object.freeze({
      isOver: true,
      reason: 'bankruptcy',
      winnerId: active.length === 1 ? active[0].id : null,
    });
  }

  // Turn limit reached
  if (turnNumber >= MAX_TURN_LIMIT) {
    const richest = [...active].sort((a, b) => b.money - a.money)[0];
    return Object.freeze({
      isOver: true,
      reason: 'turn-limit',
      winnerId: richest.id,
    });
  }

  return Object.freeze({ isOver: false, reason: null, winnerId: null });
}

/**
 * Calculates a player's total net worth (money + property values + house values).
 */
export function calculateNetWorth(player, boardSpaces, houseCount) {
  let worth = player.money;

  for (const propId of player.ownedProperties) {
    const space = boardSpaces[propId];
    if (space) {
      worth += space.price;
      const houses = houseCount[propId] ?? 0;
      worth += houses * Math.floor(space.price * 0.5);
    }
  }

  return worth;
}
