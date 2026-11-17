import React from 'react';

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorClasses = {
  violet: 'progress-bar', // defined in index.css as violet gradient
  cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
  green: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
};

const ProgressBar = ({
  value = 0,
  label,
  showValue = true,
  color = 'violet',
  size = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const barClass = colorClasses[color] ?? colorClasses.violet;
  const heightClass = heightClasses[size] ?? heightClasses.md;

  return (
    <div className="w-full">
      {/* Label + value row */}
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm text-slate-300 font-medium">{label}</span>
          )}
          {showValue && (
            <span className="text-sm text-slate-400 ml-auto">{clamped}%</span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={[
          'w-full bg-slate-700/50 rounded-full overflow-hidden',
          heightClass,
        ].join(' ')}
      >
        {/* Fill */}
        <div
          className={[barClass, heightClass, 'rounded-full transition-all duration-700'].join(' ')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
