import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadFromStorage } from '../lib/storage';
import { STORAGE_KEYS, PLAYER_COLORS } from '../lib/constants';

function RecentGames() {
  const leaderboard = loadFromStorage(STORAGE_KEYS.LEADERBOARD);
  if (!leaderboard || leaderboard.length === 0) return null;

  const recent = leaderboard.slice(0, 10);

  return (
    <div className="w-full max-w-md mt-10">
      <h2 className="text-lg font-bold mb-3 text-slate-700">Recent Games</h2>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs">
              <th className="text-left px-3 py-2">Winner</th>
              <th className="text-center px-3 py-2">Turns</th>
              <th className="text-center px-3 py-2">Result</th>
              <th className="text-right px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((entry, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">
                  {entry.winnerName}
                  {entry.isHumanWin && (
                    <span className="ml-1 text-emerald-600 text-xs">You</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center text-slate-500">{entry.turnCount}</td>
                <td className="px-3 py-2 text-center text-xs text-slate-400">
                  {entry.reason === 'turn-limit' ? 'Richest' : 'Knockout'}
                </td>
                <td className="px-3 py-2 text-right text-slate-400 text-xs">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickStart({ onStartGame }) {
  const [name, setName] = useState('');

  const handlePlay = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    const color = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
    onStartGame({ name: trimmed, avatarColor: color });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlePlay();
  };

  return (
    <div className="flex gap-2 w-full max-w-sm">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={20}
        placeholder="Your name"
        className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
        autoFocus
      />
      <button
        onClick={handlePlay}
        disabled={name.trim().length === 0}
        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
      >
        Play
      </button>
    </div>
  );
}

export default function Home({ profile, savedGame, onQuickStart }) {
  const navigate = useNavigate();

  const handleQuickStart = (quickProfile) => {
    onQuickStart(quickProfile);
    navigate('/game', { state: { newGame: true } });
  };

  return (
    <div className="flex-1 flex flex-col items-center p-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-4 text-slate-800">
          Fetch With Catch
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-md">
          A simplified Monopoly board game. Buy properties, build houses, and bankrupt the bots!
        </p>

        <div className="flex flex-col gap-3 w-full max-w-sm items-center">
          {profile ? (
            <>
              <p className="text-slate-500 text-sm">
                Playing as <span className="font-semibold text-slate-700">{profile.name}</span>
              </p>
              <Link
                to="/game"
                state={{ newGame: true }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg text-center transition-colors w-full max-w-xs"
              >
                New Game
              </Link>
              {savedGame && (
                <Link
                  to="/game"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-center transition-colors w-full max-w-xs"
                >
                  Continue Game
                </Link>
              )}
            </>
          ) : (
            <QuickStart onStartGame={handleQuickStart} />
          )}
        </div>
      </div>

      <RecentGames />
    </div>
  );
}
