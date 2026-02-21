import { useState, useCallback, useRef, useEffect } from 'react';
import { createGameState } from '../game/game-state';
import {
  executeRoll,
  executeBuy,
  declineBuy,
  executeBuildHouse,
  payJailFee,
} from '../game/turn-engine';
import { botDecidePurchase, botDecideBuild, botDecideJail, getBotPersonality } from '../game/ai-bot';
import { getBuildableProperties } from '../game/property-logic';
import { isValidGameState } from '../lib/validation';
import { BOT_DELAY_MS } from '../lib/constants';

export default function useGameState({ profile, savedGame, onGameSave, onGameEnd }) {
  const [gameState, setGameState] = useState(() => {
    if (savedGame && isValidGameState(savedGame)) return savedGame;
    return null;
  });
  const [rolling, setRolling] = useState(false);
  const botTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  const startNewGame = useCallback(() => {
    const state = createGameState(profile);
    setGameState(state);
    onGameSave(state);
  }, [profile, onGameSave]);

  const saveState = useCallback((state) => {
    setGameState(state);
    if (state.gameStatus === 'active') {
      onGameSave(state);
    }
  }, [onGameSave]);

  // Human actions
  const humanRoll = useCallback(() => {
    if (!gameState || gameState.gameStatus !== 'active') return;
    const player = gameState.players[gameState.currentPlayerIndex];
    if (player.isBot || gameState.turnPhase !== 'roll') return;

    setRolling(true);
    setTimeout(() => {
      if (!isMountedRef.current) return;
      const newState = executeRoll(gameState);
      saveState(newState);
      setRolling(false);
    }, 400);
  }, [gameState, saveState]);

  const humanBuy = useCallback(() => {
    if (!gameState) return;
    const newState = executeBuy(gameState);
    saveState(newState);
  }, [gameState, saveState]);

  const humanDecline = useCallback(() => {
    if (!gameState) return;
    const newState = declineBuy(gameState);
    saveState(newState);
  }, [gameState, saveState]);

  const humanBuildHouse = useCallback((spaceId) => {
    if (!gameState) return;
    const newState = executeBuildHouse(gameState, spaceId);
    saveState(newState);
  }, [gameState, saveState]);

  const humanPayJail = useCallback(() => {
    if (!gameState) return;
    const newState = payJailFee(gameState);
    saveState(newState);
  }, [gameState, saveState]);

  // Bot turn automation
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'active') return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isBot || currentPlayer.isBankrupt) return;

    const personality = currentPlayer.personality || getBotPersonality(0);

    botTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      let state = gameState;

      if (state.turnPhase === 'roll') {
        // Handle jail
        if (currentPlayer.isInJail) {
          const decision = botDecideJail(currentPlayer, currentPlayer.jailTurns, personality);
          if (decision === 'pay' && currentPlayer.money >= 50) {
            state = payJailFee(state);
            // After paying, if still active, roll
            const updatedPlayer = state.players.find((p) => p.id === currentPlayer.id);
            if (!updatedPlayer.isBankrupt && !updatedPlayer.isInJail && state.turnPhase === 'roll') {
              state = executeRoll(state);
            }
          } else {
            state = executeRoll(state);
          }
        } else {
          state = executeRoll(state);
        }
      }

      if (state.turnPhase === 'buy-decision' && state.pendingAction?.type === 'buy-offer') {
        const botPlayer = state.players.find((p) => p.id === currentPlayer.id);
        const space = state.boardSpaces[state.pendingAction.spaceId];
        if (botDecidePurchase(botPlayer, space, personality)) {
          state = executeBuy(state);
        } else {
          state = declineBuy(state);
        }
      }

      // Try to build houses
      const botAfterTurn = state.players.find((p) => p.id === currentPlayer.id);
      if (botAfterTurn && !botAfterTurn.isBankrupt) {
        const toBuild = botDecideBuild(botAfterTurn, state.propertyOwnership, state.houseCount, personality);
        for (const spaceId of toBuild) {
          state = executeBuildHouse(state, spaceId);
        }
      }

      saveState(state);
    }, BOT_DELAY_MS);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [gameState, saveState]);

  const endGame = useCallback(() => {
    onGameEnd();
    setGameState(null);
  }, [onGameEnd]);

  return {
    gameState,
    rolling,
    startNewGame,
    humanRoll,
    humanBuy,
    humanDecline,
    humanBuildHouse,
    humanPayJail,
    endGame,
  };
}
