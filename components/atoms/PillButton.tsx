import React from 'react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: 'nav' | 'action' | 'tab';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({
  children,
  active = false,
  variant = 'nav',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 select-none rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-xs md:text-sm px-3.5 py-2 min-h-[40px] gap-2',
  };

  const getVariantStyles = () => {
    if (variant === 'nav') {
      return active
        ? 'bg-slate-900 text-white font-semibold shadow-xs'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold';
    }
    if (variant === 'action') {
      return active
        ? 'bg-blue-600 text-white font-semibold shadow-xs'
        : 'bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 border border-slate-300 shadow-2xs font-semibold';
    }
    if (variant === 'tab') {
      return active
        ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-semibold';
    }
    return '';
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${getVariantStyles()} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
