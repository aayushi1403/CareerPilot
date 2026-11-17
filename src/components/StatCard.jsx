import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from './Card';

const colorConfig = {
  violet: {
    bg: 'bg-violet-500/20',
    text: 'text-violet-400',
    ring: 'ring-violet-500/30',
  },
  cyan: {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    ring: 'ring-cyan-500/30',
  },
  green: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
  },
  orange: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    ring: 'ring-orange-500/30',
  },
};

const TrendIcon = ({ trend }) => {
  if (trend === 'up')
    return <TrendingUp className="w-3.5 h-3.5" />;
  if (trend === 'down')
    return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
};

const StatCard = ({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  color = 'violet',
}) => {
  const colors = colorConfig[color] ?? colorConfig.violet;

  const trendTextColor =
    trend === 'up'
      ? 'text-emerald-400'
      : trend === 'down'
      ? 'text-red-400'
      : 'text-slate-400';

  return (
    <Card hover className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className={[
            'w-10 h-10 rounded-lg flex items-center justify-center ring-1',
            colors.bg,
            colors.text,
            colors.ring,
          ].join(' ')}
        >
          {icon}
        </div>

        {/* Trend badge */}
        <div
          className={[
            'flex items-center gap-1 text-xs font-medium',
            trendTextColor,
          ].join(' ')}
        >
          <TrendIcon trend={trend} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-slate-100 leading-none">
          {value}
        </p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>

      {/* Change */}
      {change && (
        <p className={['text-xs font-medium', trendTextColor].join(' ')}>
          {change}
        </p>
      )}
    </Card>
  );
};

export default StatCard;
