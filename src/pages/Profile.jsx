import { useState } from 'react';
import { PLAYER_COLORS } from '../lib/constants';

export default function Profile({ profile, onSaveProfile }) {
  const [name, setName] = useState(profile?.name ?? '');
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor ?? PLAYER_COLORS[0]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 20) {
      setError('Name must be 1-20 characters.');
      return;
    }
    setError('');
    onSaveProfile({ name: trimmed, avatarColor });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 max-w-md mx-auto p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Player Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="player-name" className="block text-sm font-medium mb-1">
            Player Name
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter your name"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Avatar Color</label>
          <div className="flex gap-3">
            {PLAYER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatarColor(color)}
                className={`w-10 h-10 rounded-full border-3 transition-transform ${
                  avatarColor === color
                    ? 'border-slate-800 scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div
            className="w-12 h-12 rounded-full border-2 border-slate-300"
            style={{ backgroundColor: avatarColor }}
          />
          <span className="text-lg font-medium">{name || 'Player'}</span>
        </div>

        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
        >
          {profile ? 'Update Profile' : 'Create Profile'}
        </button>

        {saved && (
          <p className="text-emerald-600 font-medium text-center">Profile saved!</p>
        )}

        {profile && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-2">Stats</h3>
            <p className="text-sm text-slate-600">
              Games played: {profile.gamesPlayed ?? 0} &mdash; Wins: {profile.wins ?? 0}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
