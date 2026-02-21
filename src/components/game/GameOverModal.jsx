import Modal from '../Modal';
import { calculateNetWorth } from '../../game/win-condition';

export default function GameOverModal({ isOpen, gameState, onPlayAgain, onGoHome }) {
  if (!isOpen || !gameState) return null;

  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  const isHumanWinner = winner && !winner.isBot;

  const rankings = [...gameState.players]
    .map((p) => ({
      ...p,
      netWorth: calculateNetWorth(p, gameState.boardSpaces, gameState.houseCount),
    }))
    .sort((a, b) => {
      if (a.isBankrupt && !b.isBankrupt) return 1;
      if (!a.isBankrupt && b.isBankrupt) return -1;
      return b.netWorth - a.netWorth;
    });

  return (
    <Modal isOpen={isOpen} title="Game Over!">
      <div className="flex flex-col gap-4">
        {winner && (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-yellow-400"
              style={{ backgroundColor: winner.avatarColor }}
            />
            <h3 className="text-2xl font-bold">
              {isHumanWinner ? 'You Win!' : `${winner.name} Wins!`}
            </h3>
            <p className="text-slate-500 text-sm">
              {gameState.winReason === 'turn-limit'
                ? 'Richest player at turn limit'
                : 'Last player standing'}
            </p>
          </div>
        )}

        <div className="border-t pt-3">
          <h4 className="font-semibold text-sm mb-2">Final Standings</h4>
          {rankings.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 py-1 text-sm">
              <span className="w-5 text-slate-400 font-mono">{i + 1}.</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.avatarColor }}
              />
              <span className={`flex-1 ${p.isBankrupt ? 'line-through text-slate-400' : ''}`}>
                {p.name}
              </span>
              <span className="font-mono">${p.netWorth}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onGoHome}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    </Modal>
  );
}
