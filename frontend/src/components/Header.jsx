import { Moon, Stethoscope, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Header({ darkMode, setDarkMode, connected }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-clinic-600 text-white">
            <Stethoscope size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Queue Cure</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time clinic queue system</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/receptionist"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-clinic-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
            }
          >
            Receptionist
          </NavLink>
          <NavLink
            to="/patient"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-clinic-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
            }
          >
            Patient
          </NavLink>
          <NavLink
            to="/board"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-clinic-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
            }
          >
            Board
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-clinic-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
            }
          >
            Analytics
          </NavLink>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200'}`}>
            {connected ? 'Live' : 'Reconnecting'}
          </span>
          <button
            aria-label="Toggle dark mode"
            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
