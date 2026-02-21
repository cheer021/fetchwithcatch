import { getBuildableProperties } from './property-logic';
import { HOUSE_COST_MULTIPLIER } from '../lib/constants';

/**
 * AI personality types with buy thresholds.
 * - aggressive: buys if price < 85% of cash
 * - balanced: buys if price < 70% of cash
 */
const PERSONALITIES = Object.freeze({
  aggressive: { buyThreshold: 0.85, buildThreshold: 0.6 },
  balanced: { buyThreshold: 0.70, buildThreshold: 0.4 },
});

/**
 * Assigns a personality to a bot based on index.
 */
export function getBotPersonality(botIndex) {
  return botIndex % 2 === 0 ? 'aggressive' : 'balanced';
}

/**
 * Bot decides whether to buy a property.
 */
export function botDecidePurchase(bot, space, personality) {
  const config = PERSONALITIES[personality] ?? PERSONALITIES.balanced;
  return space.price <= bot.money * config.buyThreshold;
}

/**
 * Bot decides whether to build houses, and on which properties.
 * Returns an array of space IDs to build on (may be empty).
 */
export function botDecideBuild(bot, propertyOwnership, houseCount, personality) {
  const config = PERSONALITIES[personality] ?? PERSONALITIES.balanced;
  const buildable = getBuildableProperties(bot, propertyOwnership, houseCount);

  if (buildable.length === 0) return [];

  // Sort by rent potential (highest base rent first)
  const sorted = [...buildable].sort((a, b) => b.baseRent - a.baseRent);

  const toBuild = [];
  let availableMoney = bot.money;

  for (const space of sorted) {
    const cost = Math.floor(space.price * HOUSE_COST_MULTIPLIER);
    if (cost <= availableMoney * config.buildThreshold) {
      toBuild.push(space.id);
      availableMoney -= cost;
    }
  }

  return toBuild;
}

/**
 * Bot decides whether to pay jail fee or try to roll doubles.
 */
export function botDecideJail(bot, jailTurns, personality) {
  const config = PERSONALITIES[personality] ?? PERSONALITIES.balanced;
  // Aggressive bots pay immediately; balanced wait unless last attempt
  if (personality === 'aggressive') return 'pay';
  return jailTurns >= 2 ? 'pay' : 'roll';
}
