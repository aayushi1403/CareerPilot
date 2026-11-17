import React, { useEffect, useRef } from 'react';
import {
  Briefcase,
  FileText,
  MessageSquare,
  Map,
  Bell,
  X,
  CheckCircle,
} from 'lucide-react';

const typeIcon = (type) => {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'match':
    case 'application':
      return <Briefcase className={cls} />;
    case 'resume':
      return <FileText className={cls} />;
    case 'interview':
      return <MessageSquare className={cls} />;
    case 'roadmap':
      return <Map className={cls} />;
    default:
      return <Bell className={cls} />;
  }
};

const typeColor = (type) => {
  switch (type) {
    case 'match':
      return 'text-violet-400 bg-violet-500/15';
    case 'application':
      return 'text-cyan-400 bg-cyan-500/15';
    case 'resume':
      return 'text-emerald-400 bg-emerald-500/15';
    case 'interview':
      return 'text-amber-400 bg-amber-500/15';
    case 'roadmap':
      return 'text-orange-400 bg-orange-500/15';
    default:
      return 'text-slate-400 bg-slate-700/50';
  }
};

const Notification = ({ notifications = [], onClose }) => {
  const panelRef = useRef(null);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0f1f3d] border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-slate-100">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/40">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
            <CheckCircle className="w-8 h-8 text-emerald-400/60" />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={[
                'flex gap-3 px-4 py-3 hover:bg-slate-700/20 transition-colors',
                !n.read ? 'border-l-2 border-violet-500' : 'border-l-2 border-transparent',
              ].join(' ')}
            >
              {/* Icon */}
              <div
                className={[
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                  typeColor(n.type),
                ].join(' ')}
              >
                {typeIcon(n.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 leading-snug">
                  {n.title}
                  {!n.read && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 bg-violet-400 rounded-full align-middle" />
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">
                  {n.message}
                </p>
                <p className="text-xs text-slate-500 mt-1">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-700/60 text-center">
        <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default Notification;
