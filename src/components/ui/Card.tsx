import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}: CardProps) {
  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'hover:border-surface-300 hover:shadow-lg cursor-pointer'
    : '';

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-200 shadow-md ${paddingClasses[padding]} ${hoverStyles} transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
  icon,
}: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2.5">
        {icon && <div className="text-brand-600 shrink-0">{icon}</div>}
        <div>
          <h3 className="text-base font-extrabold text-surface-900 font-display tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-surface-500 font-semibold mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}
