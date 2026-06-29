import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-extrabold text-surface-700 uppercase tracking-widest"
        >
          {label}
        </label>
      )}
    
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-brand-500 transition-colors">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          className={`w-full px-4 py-2.5 text-sm bg-white rounded-xl border outline-none transition-all duration-150 focus:ring-2 placeholder:font-medium ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-surface-200 focus:border-brand-500 focus:ring-brand-100 hover:border-surface-300'
          } ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold pl-0.5">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-surface-500 font-semibold pl-0.5">{helperText}</p>
      )}
    </div>
  );
}
