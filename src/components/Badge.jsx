import React from 'react';

const variantClasses = {
  default: 'bg-slate-700 text-slate-300',
  success:
    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  warning:
    'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  error:
    'bg-red-500/20 text-red-400 border border-red-500/30',
  info:
    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  violet:
    'bg-violet-500/20 text-violet-400 border border-violet-500/30',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

const Badge = ({ children, variant = 'default', size = 'md' }) => {
  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant] ?? variantClasses.default,
        sizeClasses[size] ?? sizeClasses.md,
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
