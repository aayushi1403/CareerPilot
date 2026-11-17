import React from 'react';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const variantClasses = {
  primary:
    'bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-lg shadow-violet-900/30',
  secondary:
    'border border-violet-500/50 text-violet-400 hover:bg-violet-500/10',
  ghost:
    'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50',
  danger:
    'bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg shadow-red-900/30',
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50',
        sizeClasses[size] ?? sizeClasses.md,
        variantClasses[variant] ?? variantClasses.primary,
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

export default Button;
