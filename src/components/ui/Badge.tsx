import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot?: string }> = {
    default: { bg: 'bg-surface-100', text: 'text-surface-700', border: 'border-surface-200' },
    success: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
    danger:  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-500' },
    info:    { bg: 'bg-brand-100', text: 'text-brand-800', border: 'border-brand-200', dot: 'bg-brand-500' },
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-1.5',
  };

  const v = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border uppercase tracking-widest ${v.bg} ${v.text} ${v.border} ${sizeStyles[size]} ${className}`}
    >
      {dot && v.dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${v.dot} animate-pulse-soft`} />
      )}
      {children}
    </span>
  );
}
