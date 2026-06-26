import { useRouteError } from 'react-router-dom';
import { Button } from './ui';

export default function ErrorFallback() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            The application encountered an unexpected error.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-left">
              <p className="text-xs font-mono text-red-800">
                {error.message || error.toString()}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
