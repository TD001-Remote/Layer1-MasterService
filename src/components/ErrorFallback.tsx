import { useRouteError } from 'react-router-dom';
import { Button } from './ui';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function ErrorFallback() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-surface-200">
        <div className="text-center space-y-5">
          <div className="inline-flex p-4 bg-rose-50 border border-rose-200 rounded-2xl mx-auto">
            <RefreshCw size={32} className="text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-surface-900 font-display tracking-tight">
              Something went wrong
            </h1>
            <p className="text-sm text-surface-500 mt-2 font-medium">
              The application encountered an unexpected error. Don't worry, this has been logged.
            </p>
          </div>
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-left overflow-auto max-h-36">
              <p className="text-xs font-mono text-rose-800 font-semibold whitespace-pre-wrap">
                {error.message || error.toString()}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={() => window.history.back()}
              variant="secondary"
              className="flex-1"
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
