/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui';
import { RefreshCw, Workflow } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);

  React.useEffect(() => {
    const handler = (e: ErrorEvent) => {
      setError(e.error);
      setHasError(true);
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-surface-200">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-rose-50 border border-rose-200 rounded-2xl mx-auto">
              <Workflow size={32} className="text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-surface-900 font-display tracking-tight">
                Something went wrong
              </h1>
              <p className="text-sm text-surface-500 mt-2 font-medium">
                The application encountered an unexpected error. We've logged the details.
              </p>
            </div>
            
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-rose-800 font-semibold whitespace-pre-wrap">
                  {error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-brand-500/20 transition-all"
              >
                Return Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2.5 bg-white text-surface-700 border border-surface-200 hover:border-surface-300 rounded-xl text-sm font-extrabold transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
