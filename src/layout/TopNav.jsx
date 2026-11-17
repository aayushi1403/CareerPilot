import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { notifications, userProfile } from '../data/mockData';
import Notification from '../components/Notification';
import ProfileDropdown from '../components/ProfileDropdown';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/resume': 'Resume Analyzer',
  '/jobs': 'Job Matcher',
  '/skill-gap': 'Skill Gap Analyzer',
  '/roadmap': 'Career Roadmap',
  '/interview': 'Mock Interview',
  '/assistant': 'AI Career Assistant',
  '/profile': 'My Profile',
};

export default function TopNav({ onMenuToggle }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const pageTitle = routeTitles[location.pathname] ?? 'CareerPilot';

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="flex items-center gap-4 px-4 md:px-6 h-16 bg-[#0a1628]/80 backdrop-blur border-b border-slate-700/50 shrink-0">
      {/* Left */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle mobile menu"
        className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-slate-100 mr-auto">
        {pageTitle}
      </h1>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 bg-[#0f1f3d] border border-slate-700/50 rounded-lg px-3 py-1.5">
          <Search size={15} className="text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 outline-none w-36 md:w-48"
          />
        </div>

        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowProfile(false);
            }}
            aria-label="Notifications"
            className="relative p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-[#0a1628]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <Notification
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile((v) => !v);
              setShowNotifications(false);
            }}
            aria-label="User profile"
            className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white hover:bg-violet-500 transition-colors select-none"
          >
            JS
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 z-50">
              <ProfileDropdown
                user={userProfile}
                onClose={() => setShowProfile(false)}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
