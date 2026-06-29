import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  helperText,
  options,
  children,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-extrabold text-surface-700 uppercase tracking-widest"
        >
          {label}
        </label>
      )}
    
      <div className="relative group">
        <select
          id={selectId}
          className={`w-full px-4 py-2.5 text-sm bg-white rounded-xl border outline-none transition-all duration-150 focus:ring-2 appearance-none pr-10 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-surface-200 focus:border-brand-500 focus:ring-brand-100 hover:border-surface-300'
          } ${className}`}
          {...props}
        >
          {options ? (
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-brand-500 transition-colors">
          <ChevronDown size={16} />
        </div>
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
