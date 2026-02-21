import { TOTAL_SPACES } from './board-config';
import { rollDice } from './dice';
import { creditPlayer, debitPlayer, transferMoney } from './bank';
import { getOwner, calculateRent, buyProperty, buyHouse, canAffordProperty } from './property-logic';
import { isBankrupt, checkGameOver, getActivePlayers } from './win-condition';
import { drawCard } from './cards';
import { updatePlayer, updateGameState, addLogEntry } from './game-state';
import {
  GO_SALARY, JAIL_POSITION, GO_TO_JAIL_POSITION,
  JAIL_FEE, MAX_JAIL_TURNS,
} from '../lib/constants';

/**
 * Moves a player forward by `steps`, handling passing GO.
 * Returns { newPosition, passedGo }.
 */
export function movePlayer(currentPosition, steps) {
  const newPosition = (currentPosition + steps + TOTAL_SPACES) % TOTAL_SPACES;
  const passedGo = steps > 0 && newPosition < currentPosition;
  return { newPosition, passedGo };
}

/**
 * Executes a dice roll for the current player.
 * Returns the new game state after movement and GO salary.
 */
export function executeRoll(state) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.isBankrupt) return advanceToNextPlayer(state);

  const dice = rollDice();
  let newState = updateGameState(state, { lastDiceRoll: dice });
  newState = addLogEntry(newState, `${currentPlayer.name} rolled ${dice.die1} + ${dice.die2} = ${dice.total}`);

  // Jail handling
  if (currentPlayer.isInJail) {
    return handleJailRoll(newState, currentPlayer, dice);
  }

  // Normal movement
  const { newPosition, passedGo } = movePlayer(currentPlayer.position, dice.total);

  newState = updatePlayer(newState, currentPlayer.id, { position: newPosition });

  if (passedGo) {
    const updated = creditPlayer(
      newState.players.find((p) => p.id === currentPlayer.id),
      GO_SALARY
    );
    newState = updatePlayer(newState, currentPlayer.id, { money: updated.money });
    newState = addLogEntry(newState, `${currentPlayer.name} passed GO and collected $${GO_SALARY}`);
  }

  // Resolve landing
  return resolveLanding(newState);
}

/**
 * Handles a jail roll - doubles to escape or increment counter.
 */
function handleJailRoll(state, player, dice) {
  if (dice.isDoubles) {
    let newState = updatePlayer(state, player.id, { isInJail: false, jailTurns: 0 });
    const { newPosition } = movePlayer(JAIL_POSITION, dice.total);
    newState = updatePlayer(newState, player.id, { position: newPosition });
    newState = addLogEntry(newState, `${player.name} rolled doubles and escaped jail!`);
    return resolveLanding(newState);
  }

  const newJailTurns = player.jailTurns + 1;
  if (newJailTurns >= MAX_JAIL_TURNS) {
    // Forced to pay
    let newState = updatePlayer(state, player.id, {
      isInJail: false,
      jailTurns: 0,
      money: player.money - JAIL_FEE,
    });
    newState = addLogEntry(newState, `${player.name} paid $${JAIL_FEE} to leave jail after ${MAX_JAIL_TURNS} turns`);
    // Check bankruptcy from jail fee
    const updatedPlayer = newState.players.find((p) => p.id === player.id);
    if (isBankrupt(updatedPlayer)) {
      newState = updatePlayer(newState, player.id, { isBankrupt: true });
      newState = addLogEntry(newState, `${player.name} went bankrupt paying jail fee!`);
    }
    return advanceToNextPlayer(newState);
  }

  let newState = updatePlayer(state, player.id, { jailTurns: newJailTurns });
  newState = addLogEntry(newState, `${player.name} failed to roll doubles in jail (attempt ${newJailTurns}/${MAX_JAIL_TURNS})`);
  return advanceToNextPlayer(newState);
}

/**
 * Player pays to leave jail.
 */
export function payJailFee(state) {
  const player = state.players[state.currentPlayerIndex];
  let newState = updatePlayer(state, player.id, {
    isInJail: false,
    jailTurns: 0,
    money: player.money - JAIL_FEE,
  });
  newState = addLogEntry(newState, `${player.name} paid $${JAIL_FEE} to leave jail`);

  const updatedPlayer = newState.players.find((p) => p.id === player.id);
  if (isBankrupt(updatedPlayer)) {
    newState = updatePlayer(newState, player.id, { isBankrupt: true });
    newState = addLogEntry(newState, `${player.name} went bankrupt paying jail fee!`);
    return advanceToNextPlayer(newState);
  }

  return updateGameState(newState, { turnPhase: 'roll' });
}

/**
 * Resolves what happens when a player lands on a space.
 * Returns new state, possibly with a pendingAction for the UI.
 */
export function resolveLanding(state) {
  const player = state.players[state.currentPlayerIndex];
  const space = state.boardSpaces[player.position];

  switch (space.type) {
    case 'property':
      return resolvePropertyLanding(state, player, space);
    case 'chance':
      return resolveCardDraw(state, player, 'chance');
    case 'community-chest':
      return resolveCardDraw(state, player, 'community-chest');
    case 'go-to-jail':
      return resolveGoToJail(state, player);
    case 'go':
    case 'jail':
    case 'free-parking':
    default:
      return advanceToNextPlayer(state);
  }
}

/**
 * Landing on a property: unowned → offer to buy, owned → pay rent.
 */
function resolvePropertyLanding(state, player, space) {
  const owner = getOwner(state.propertyOwnership, space.id);

  if (owner === null) {
    // Unowned - offer purchase
    if (canAffordProperty(player, space)) {
      return updateGameState(state, {
        turnPhase: 'buy-decision',
        pendingAction: { type: 'buy-offer', spaceId: space.id },
      });
    }
    let newState = addLogEntry(state, `${player.name} can't afford ${space.name} ($${space.price})`);
    return advanceToNextPlayer(newState);
  }

  if (owner === player.id) {
    // Own property, nothing happens
    return advanceToNextPlayer(state);
  }

  // Pay rent to owner
  const ownerPlayer = state.players.find((p) => p.id === owner);
  if (ownerPlayer.isBankrupt || ownerPlayer.isInJail) {
    return advanceToNextPlayer(state);
  }

  const rent = calculateRent(space, state.propertyOwnership, state.houseCount, owner);
  const { payer, payee } = transferMoney(player, ownerPlayer, rent);

  let newState = updatePlayer(state, player.id, { money: payer.money });
  newState = updatePlayer(newState, owner, { money: payee.money });
  newState = addLogEntry(newState, `${player.name} paid $${rent} rent to ${ownerPlayer.name} for ${space.name}`);

  if (isBankrupt(payer)) {
    newState = updatePlayer(newState, player.id, { isBankrupt: true });
    newState = addLogEntry(newState, `${player.name} went bankrupt!`);
  }

  return advanceToNextPlayer(newState);
}

/**
 * Draw a Chance or Community Chest card and apply its effect.
 */
function resolveCardDraw(state, player, deckType) {
  const deckKey = deckType === 'chance' ? 'chanceDeck' : 'communityChestDeck';
  const { card, deck: newDeck } = drawCard(state[deckKey]);

  let newState = updateGameState(state, { [deckKey]: newDeck });
  newState = addLogEntry(newState, `${player.name} drew: "${card.text}"`);

  return applyCardEffect(newState, player, card.effect);
}

/**
 * Applies a card effect to the game state.
 */
function applyCardEffect(state, player, effect) {
  switch (effect.type) {
    case 'gain': {
      const updated = creditPlayer(player, effect.amount);
      let newState = updatePlayer(state, player.id, { money: updated.money });
      return advanceToNextPlayer(newState);
    }
    case 'lose': {
      const updated = debitPlayer(player, effect.amount);
      let newState = updatePlayer(state, player.id, { money: updated.money });
      if (isBankrupt(updated)) {
        newState = updatePlayer(newState, player.id, { isBankrupt: true });
        newState = addLogEntry(newState, `${player.name} went bankrupt!`);
      }
      return advanceToNextPlayer(newState);
    }
    case 'move-to': {
      const passedGo = effect.position < player.position && effect.position !== JAIL_POSITION;
      let newState = updatePlayer(state, player.id, { position: effect.position });
      if (passedGo) {
        const updated = creditPlayer(
          newState.players.find((p) => p.id === player.id),
          GO_SALARY
        );
        newState = updatePlayer(newState, player.id, { money: updated.money });
        newState = addLogEntry(newState, `${player.name} passed GO and collected $${GO_SALARY}`);
      }
      return resolveLanding(newState);
    }
    case 'move-relative': {
      const { newPosition } = movePlayer(player.position, effect.offset);
      let newState = updatePlayer(state, player.id, { position: newPosition });
      return resolveLanding(newState);
    }
    case 'go-to-jail':
      return resolveGoToJail(state, player);
    default:
      return advanceToNextPlayer(state);
  }
}

/**
 * Sends a player to jail.
 */
function resolveGoToJail(state, player) {
  let newState = updatePlayer(state, player.id, {
    position: JAIL_POSITION,
    isInJail: true,
    jailTurns: 0,
  });
  newState = addLogEntry(newState, `${player.name} was sent to Jail!`);
  return advanceToNextPlayer(newState);
}

/**
 * Player decides to buy the offered property.
 */
export function executeBuy(state) {
  const player = state.players[state.currentPlayerIndex];
  const space = state.boardSpaces[state.pendingAction.spaceId];
  const { player: updatedPlayer, propertyOwnership } = buyProperty(player, space, state.propertyOwnership);

  let newState = updatePlayer(state, player.id, {
    money: updatedPlayer.money,
    ownedProperties: updatedPlayer.ownedProperties,
  });
  newState = updateGameState(newState, {
    propertyOwnership,
    pendingAction: null,
  });
  newState = addLogEntry(newState, `${player.name} bought ${space.name} for $${space.price}`);

  return advanceToNextPlayer(newState);
}

/**
 * Player declines to buy the offered property.
 */
export function declineBuy(state) {
  const player = state.players[state.currentPlayerIndex];
  const space = state.boardSpaces[state.pendingAction?.spaceId];
  let newState = updateGameState(state, { pendingAction: null });
  if (space) {
    newState = addLogEntry(newState, `${player.name} declined to buy ${space.name}`);
  }
  return advanceToNextPlayer(newState);
}

/**
 * Player builds a house on a property.
 */
export function executeBuildHouse(state, spaceId) {
  const player = state.players[state.currentPlayerIndex];
  const space = state.boardSpaces[spaceId];
  const result = buyHouse(player, space, state.propertyOwnership, state.houseCount);

  if (!result) return state; // Can't build

  let newState = updatePlayer(state, player.id, { money: result.player.money });
  newState = updateGameState(newState, { houseCount: result.houseCount });
  const houseNum = result.houseCount[spaceId];
  const label = houseNum === 5 ? 'a hotel' : `house #${houseNum}`;
  newState = addLogEntry(newState, `${player.name} built ${label} on ${space.name}`);
  return newState;
}

/**
 * Advances to the next non-bankrupt player. Checks win conditions.
 */
export function advanceToNextPlayer(state) {
  const gameOver = checkGameOver(state.players, state.turnNumber);
  if (gameOver.isOver) {
    const winner = state.players.find((p) => p.id === gameOver.winnerId);
    let newState = updateGameState(state, {
      gameStatus: 'finished',
      winnerId: gameOver.winnerId,
      winReason: gameOver.reason,
      turnPhase: 'game-over',
      pendingAction: null,
    });
    if (winner) {
      newState = addLogEntry(newState, `${winner.name} wins! (${gameOver.reason === 'turn-limit' ? 'richest at turn limit' : 'last player standing'})`);
    }
    return newState;
  }

  const playerCount = state.players.length;
  let nextIndex = (state.currentPlayerIndex + 1) % playerCount;
  let newTurnNumber = state.turnNumber;

  // If we've cycled back to player 0, increment turn
  if (nextIndex <= state.currentPlayerIndex) {
    newTurnNumber += 1;
  }

  // Skip bankrupt players
  let checked = 0;
  while (state.players[nextIndex].isBankrupt && checked < playerCount) {
    nextIndex = (nextIndex + 1) % playerCount;
    if (nextIndex === 0) newTurnNumber += 1;
    checked++;
  }

  return updateGameState(state, {
    currentPlayerIndex: nextIndex,
    turnNumber: newTurnNumber,
    turnPhase: 'roll',
    pendingAction: null,
  });
}
