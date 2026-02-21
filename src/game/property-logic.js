import BOARD_SPACES, { getGroupPropertyIds } from './board-config';
import { MAX_HOUSES, HOUSE_COST_MULTIPLIER } from '../lib/constants';

/**
 * Gets the owner player ID for a given space, or null if unowned.
 */
export function getOwner(propertyOwnership, spaceId) {
  return propertyOwnership[spaceId] ?? null;
}

/**
 * Returns whether a player owns all properties in a color group.
 */
export function hasMonopoly(propertyOwnership, playerId, group) {
  const groupIds = getGroupPropertyIds(group);
  return groupIds.every((id) => propertyOwnership[id] === playerId);
}

/**
 * Calculates rent for a property, accounting for houses.
 * - Base rent if no monopoly
 * - Double base rent if monopoly but no houses
 * - Escalating rent with houses (baseRent * (houses + 1) * 2)
 */
export function calculateRent(space, propertyOwnership, houseCount, ownerId) {
  if (space.type !== 'property') return 0;

  const houses = houseCount[space.id] ?? 0;
  const ownerHasMonopoly = hasMonopoly(propertyOwnership, ownerId, space.group);

  if (houses > 0) {
    return space.baseRent * (houses + 1) * 2;
  }

  if (ownerHasMonopoly) {
    return space.baseRent * 2;
  }

  return space.baseRent;
}

/**
 * Buys a property for a player. Returns updated state pieces.
 */
export function buyProperty(player, space, propertyOwnership) {
  const updatedPlayer = Object.freeze({
    ...player,
    money: player.money - space.price,
    ownedProperties: [...player.ownedProperties, space.id],
  });

  const updatedOwnership = Object.freeze({
    ...propertyOwnership,
    [space.id]: player.id,
  });

  return { player: updatedPlayer, propertyOwnership: updatedOwnership };
}

/**
 * Buys a house on a property. Returns updated player and houseCount.
 * Validates: player owns monopoly, houses < MAX, can afford it.
 */
export function buyHouse(player, space, propertyOwnership, houseCount) {
  const currentHouses = houseCount[space.id] ?? 0;
  const cost = Math.floor(space.price * HOUSE_COST_MULTIPLIER);

  if (!hasMonopoly(propertyOwnership, player.id, space.group)) {
    return null; // No monopoly
  }

  if (currentHouses >= MAX_HOUSES) {
    return null; // Max houses reached
  }

  if (player.money < cost) {
    return null; // Can't afford
  }

  return {
    player: Object.freeze({ ...player, money: player.money - cost }),
    houseCount: Object.freeze({ ...houseCount, [space.id]: currentHouses + 1 }),
  };
}

/**
 * Returns properties where a player can build houses.
 */
export function getBuildableProperties(player, propertyOwnership, houseCount) {
  return player.ownedProperties
    .map((id) => BOARD_SPACES[id])
    .filter((space) => {
      if (space.type !== 'property') return false;
      if (!hasMonopoly(propertyOwnership, player.id, space.group)) return false;
      if ((houseCount[space.id] ?? 0) >= MAX_HOUSES) return false;
      const cost = Math.floor(space.price * HOUSE_COST_MULTIPLIER);
      return player.money >= cost;
    });
}

/**
 * Checks if a player can afford to buy a specific property.
 */
export function canAffordProperty(player, space) {
  return player.money >= space.price;
}
