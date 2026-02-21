import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/game', label: 'Play' },
  { to: '/about', label: 'About' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar({ profile }) {
  const location = useLocation();

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight hover:text-emerald-400 transition-colors">
          Fetch With Catch
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {label}
              </Link>
            );
          })}

          {profile && (
            <div className="ml-3 flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: profile.avatarColor }}
              />
              <span className="text-sm text-slate-300 hidden sm:inline">
                {profile.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
