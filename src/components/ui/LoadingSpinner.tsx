/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
  className?: string;
  color?: string;
}

export function LoadingSpinner({
  size = 24,
  text,
  fullScreen = false,
  className = '',
  color = 'text-brand-600',
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        <Loader2 size={size} className={`animate-spin ${color}`} />
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle,rgba(20,184,166,0.15) 0%,transparent 70%)' }} />
      </div>
      {text && (
        <p className="text-sm font-extrabold text-surface-600 tracking-wide">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
