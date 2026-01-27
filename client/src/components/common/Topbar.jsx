import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { formatName } from '../../utils/format.js';

export const Topbar = ({ title, subtitle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Patient Records</p>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{formatName(user)}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
        </div>
        <Link
          to="/profile"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Profile
        </Link>
        <button
          onClick={logout}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </header>
  );
};
