import React from 'react';

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'md',
}) => {
  return (
    <div
      className={[
        'bg-[#0f1f3d] border border-slate-700/50 rounded-xl',
        paddingClasses[padding] ?? paddingClasses.md,
        hover ? 'card-hover' : '',
        glow ? 'glow-violet' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;
