import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CP';

const ProfileDropdown = ({ user, onClose }) => {
  const panelRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSignOut = async () => {
    onClose?.();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-64 bg-[#0f1f3d] border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in-up"
    >
      {/* Avatar + Info */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/60">
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-violet-500/40">
          {getInitials(user?.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">
            {user?.name || 'User Profile'}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {user?.email || 'Authenticated'}
          </p>
          <p className="text-xs text-violet-400 truncate">
            {user?.targetJobRole || user?.title || 'Job Seeker'}
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/40 transition-colors group"
        >
          <User className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
          <span>View Profile</span>
          <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>

        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/40 transition-colors group"
        >
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
          <span>Edit Preferences</span>
          <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/60 my-1" />

      {/* Sign Out */}
      <div className="py-1.5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
