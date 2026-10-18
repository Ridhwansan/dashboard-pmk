import React from 'react';

export type BadgeVariant = 'neutral' | 'critical' | 'warning' | 'active';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  // Map any legacy variant cleanly to a quiet, dignified executive tone
  const getStyles = () => {
    switch (variant) {
      case 'critical':
      case 'alert':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      case 'warning':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'active':
      case 'success':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'info':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'purple':
      case 'neutral':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-semibold';
    }
  };

  const sizeStyles = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${getStyles()} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
};

