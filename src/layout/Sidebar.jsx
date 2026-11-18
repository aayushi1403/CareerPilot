import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  Map,
  Mic,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { path: '/jobs', icon: Briefcase, label: 'Job Matcher' },
  { path: '/skill-gap', icon: Target, label: 'Skill Gap' },
  { path: '/roadmap', icon: Map, label: 'Career Roadmap' },
  { path: '/interview', icon: Mic, label: 'Mock Interview' },
  { path: '/assistant', icon: Bot, label: 'AI Assistant' },
  { path: '/profile', icon: User, label: 'My Profile' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();

  const userName = user?.name || 'My Account';
  const userRole = user?.targetJobRole || 'Job Seeker';
  const initials = (user?.name || 'CP')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } flex flex-col bg-[#0a1628] border-r border-slate-700/50 transition-all duration-300 select-none shrink-0`}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700/50">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow shadow-violet-500/20">
              CP
            </div>
            <span className="font-bold text-slate-100 text-lg tracking-tight">
              Career<span className="text-violet-400">Pilot</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow shadow-violet-500/20">
              CP
            </div>
          </Link>
        )}

        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navLinks.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600 text-white shadow shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Authenticated user mini profile */}
      <div className="border-t border-slate-700/50 p-3">
        {collapsed ? (
          <Link
            to="/profile"
            className="flex justify-center"
            title={`${userName} — ${userRole}`}
          >
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white select-none ring-2 ring-violet-500/40">
              {initials}
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Link to="/profile" className="flex items-center gap-2.5 overflow-hidden group">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0 select-none ring-2 ring-violet-500/40 group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-violet-300 transition-colors">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {userRole}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
