import BOARD_SPACES from './board-config';
import { createDeck } from './cards';
import { pickBots } from './bot-names';
import { getBotPersonality } from './ai-bot';
import { STARTING_MONEY } from '../lib/constants';

let nextGameId = 1;

/**
 * Creates a fresh player object.
 */
export function createPlayer({ id, name, isBot, avatarColor, personality }) {
  return Object.freeze({
    id,
    name,
    isBot,
    avatarColor,
    personality: personality ?? null,
    money: STARTING_MONEY,
    position: 0,
    ownedProperties: [],
    isBankrupt: false,
    isInJail: false,
    jailTurns: 0,
  });
}

/**
 * Creates a fresh game state with 1 human + 2 bots.
 */
export function createGameState(profile) {
  const bots = pickBots(2, profile.avatarColor);

  const human = createPlayer({
    id: 'player-0',
    name: profile.name,
    isBot: false,
    avatarColor: profile.avatarColor,
  });

  const botPlayers = bots.map((bot, i) =>
    createPlayer({
      id: `bot-${i + 1}`,
      name: bot.name,
      isBot: true,
      avatarColor: bot.color,
      personality: getBotPersonality(i),
    })
  );

  return Object.freeze({
    id: `game-${nextGameId++}`,
    players: [human, ...botPlayers],
    boardSpaces: BOARD_SPACES,
    propertyOwnership: {},
    houseCount: {},
    currentPlayerIndex: 0,
    turnPhase: 'roll',
    turnNumber: 1,
    gameStatus: 'active',
    winnerId: null,
    winReason: null,
    log: [],
    lastDiceRoll: null,
    chanceDeck: createDeck('chance'),
    communityChestDeck: createDeck('community-chest'),
    pendingAction: null,
  });
}

/**
 * Returns a new state with one player replaced.
 */
export function updatePlayer(state, playerId, updates) {
  return Object.freeze({
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? Object.freeze({ ...p, ...updates }) : p
    ),
  });
}

/**
 * Returns a new state with top-level fields updated.
 */
export function updateGameState(state, updates) {
  return Object.freeze({ ...state, ...updates });
}

/**
 * Appends a log entry (capped at 100).
 */
export function addLogEntry(state, message) {
  const newLog = [...state.log, { message, turn: state.turnNumber }];
  const capped = newLog.length > 100 ? newLog.slice(-100) : newLog;
  return updateGameState(state, { log: capped });
}
