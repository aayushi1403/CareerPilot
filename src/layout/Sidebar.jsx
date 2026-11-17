import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

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
  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } flex flex-col h-full bg-[#0a1628] border-r border-slate-700/50 transition-all duration-300 shrink-0`}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-700/50">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-slate-100 select-none">
            ⚡ <span className="gradient-text">CareerPilot</span>
          </span>
        )}
        {collapsed && (
          <span className="text-xl mx-auto select-none" title="CareerPilot">
            ⚡
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navLinks.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'sidebar-link-active'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User mini profile */}
      <div className="border-t border-slate-700/50 p-3">
        {collapsed ? (
          <div
            className="flex justify-center"
            title="Jamie Scott — Software Engineer"
          >
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white select-none">
              JS
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0 select-none">
              JS
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-100 truncate">
                Jamie Scott
              </p>
              <p className="text-xs text-slate-400 truncate">
                Software Engineer
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
