import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useGameState from '../hooks/useGameState';
import Board from '../components/game/Board';
import DiceDisplay from '../components/game/DiceDisplay';
import PlayerPanel from '../components/game/PlayerPanel';
import GameLog from '../components/game/GameLog';
import BuyModal from '../components/game/BuyModal';
import GameOverModal from '../components/game/GameOverModal';
import { getBuildableProperties } from '../game/property-logic';
import { MAX_TURN_LIMIT, JAIL_FEE } from '../lib/constants';
import { saveToStorage, loadFromStorage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/constants';

export default function Game({ profile, savedGame, onGameSave, onGameEnd, onUpdateProfile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isNewGame = location.state?.newGame === true;

  const {
    gameState,
    rolling,
    startNewGame,
    humanRoll,
    humanBuy,
    humanDecline,
    humanBuildHouse,
    humanPayJail,
    endGame,
  } = useGameState({ profile, savedGame, onGameSave, onGameEnd });

  // Start new game if requested
  useEffect(() => {
    if (isNewGame && !gameState) {
      startNewGame();
      // Clear the state so refreshing doesn't restart
      window.history.replaceState({}, '');
    }
  }, [isNewGame, gameState, startNewGame]);

  // Record results when game ends
  useEffect(() => {
    if (gameState?.gameStatus === 'finished' && gameState.winnerId) {
      const leaderboard = loadFromStorage(STORAGE_KEYS.LEADERBOARD) ?? [];
      const winner = gameState.players.find((p) => p.id === gameState.winnerId);
      const entry = {
        date: new Date().toISOString(),
        winnerName: winner?.name ?? 'Unknown',
        isHumanWin: winner ? !winner.isBot : false,
        turnCount: gameState.turnNumber,
        reason: gameState.winReason,
      };
      const updated = [entry, ...leaderboard].slice(0, 50);
      saveToStorage(STORAGE_KEYS.LEADERBOARD, updated);

      // Update profile stats
      if (profile) {
        const newProfile = {
          ...profile,
          gamesPlayed: (profile.gamesPlayed ?? 0) + 1,
          wins: (profile.wins ?? 0) + (winner && !winner.isBot ? 1 : 0),
        };
        saveToStorage(STORAGE_KEYS.PROFILE, newProfile);
        onUpdateProfile(newProfile);
      }
    }
  }, [gameState?.gameStatus, gameState?.winnerId]);

  // No game loaded - show start prompt
  if (!gameState) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <h2 className="text-2xl font-bold">Ready to Play?</h2>
        <button
          onClick={startNewGame}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Start New Game
        </button>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = !currentPlayer.isBot;
  const buildable = isHumanTurn
    ? getBuildableProperties(currentPlayer, gameState.propertyOwnership, gameState.houseCount)
    : [];

  return (
    <div className="flex-1 p-2 sm:p-4">
      {/* Turn info bar */}
      <div className="max-w-6xl mx-auto mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">
          Turn {gameState.turnNumber}/{MAX_TURN_LIMIT}
        </span>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentPlayer.avatarColor }}
          />
          <span className="font-semibold">
            {currentPlayer.name}{currentPlayer.isBot ? "'s turn (AI)" : "'s turn"}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4">
        {/* Board */}
        <div className="flex-1 flex justify-center">
          <Board
            boardSpaces={gameState.boardSpaces}
            players={gameState.players}
            propertyOwnership={gameState.propertyOwnership}
            houseCount={gameState.houseCount}
            currentPlayerIndex={gameState.currentPlayerIndex}
          >
            {/* Center area content */}
            <div className="flex flex-col items-center gap-2 p-2 w-full">
              <DiceDisplay dice={gameState.lastDiceRoll} rolling={rolling} />

              {isHumanTurn && gameState.turnPhase === 'roll' && (
                <div className="flex flex-col gap-1 items-center">
                  {currentPlayer.isInJail ? (
                    <div className="flex gap-2">
                      <button
                        onClick={humanRoll}
                        disabled={rolling}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg disabled:opacity-50 transition-colors"
                      >
                        Roll for Doubles
                      </button>
                      {currentPlayer.money >= JAIL_FEE && (
                        <button
                          onClick={humanPayJail}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors"
                        >
                          Pay ${JAIL_FEE}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={humanRoll}
                      disabled={rolling}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {rolling ? 'Rolling...' : 'Roll Dice'}
                    </button>
                  )}

                  {/* Build houses button */}
                  {buildable.length > 0 && (
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Build houses:</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {buildable.map((space) => (
                          <button
                            key={space.id}
                            onClick={() => humanBuildHouse(space.id)}
                            className="text-[10px] bg-green-100 hover:bg-green-200 text-green-800 px-1.5 py-0.5 rounded transition-colors"
                            title={`Build on ${space.name} ($${Math.floor(space.price * 0.5)})`}
                          >
                            {space.name.split(' ')[0]} ${Math.floor(space.price * 0.5)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isHumanTurn && gameState.gameStatus === 'active' && (
                <p className="text-sm text-slate-500 animate-pulse">
                  {currentPlayer.name} is thinking...
                </p>
              )}
            </div>
          </Board>
        </div>

        {/* Side panel */}
        <div className="lg:w-64 flex flex-col gap-3">
          <PlayerPanel
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            propertyOwnership={gameState.propertyOwnership}
            houseCount={gameState.houseCount}
          />
          <GameLog log={gameState.log} />
        </div>
      </div>

      {/* Buy modal */}
      <BuyModal
        isOpen={isHumanTurn && gameState.turnPhase === 'buy-decision'}
        spaceId={gameState.pendingAction?.spaceId}
        player={currentPlayer}
        onBuy={humanBuy}
        onDecline={humanDecline}
      />

      {/* Game over modal */}
      <GameOverModal
        isOpen={gameState.gameStatus === 'finished'}
        gameState={gameState}
        onPlayAgain={() => {
          endGame();
          startNewGame();
        }}
        onGoHome={() => {
          endGame();
          navigate('/');
        }}
      />
    </div>
  );
}
