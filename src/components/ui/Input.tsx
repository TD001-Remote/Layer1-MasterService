/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  
  const baseStyles = 'w-full px-3 py-2 text-sm border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const errorStyles = error
    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500';

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          className={`${baseStyles} ${errorStyles} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-500 font-medium">{helperText}</p>
      )}
    </div>
  );
}
