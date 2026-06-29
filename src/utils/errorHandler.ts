// Error handling utilities

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export class APIError extends Error {
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Handle Firebase/Firestore errors
 */
const sanitizeForLog = (value: any): string => {
  if (typeof value === 'string') return value.replace(/[\r\n]/g, ' ');
  if (value instanceof Error) return value.message.replace(/[\r\n]/g, ' ');
  return String(value).replace(/[\r\n]/g, ' ');
};

export const handleFirebaseError = (error: any): AppError => {
  console.error('Firebase Error:', sanitizeForLog(error));

  // Firebase Auth errors
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return { message: 'User not found. Please check your credentials.', code: error.code };
      case 'auth/wrong-password':
        return { message: 'Incorrect password. Please try again.', code: error.code };
      case 'auth/invalid-email':
        return { message: 'Invalid email address format.', code: error.code };
      case 'auth/email-already-in-use':
        return { message: 'Email address is already in use.', code: error.code };
      case 'auth/weak-password':
        return { message: 'Password is too weak. Use at least 6 characters.', code: error.code };
      case 'auth/network-request-failed':
        return { message: 'Network error. Please check your connection.', code: error.code };
      case 'permission-denied':
        return { message: 'Permission denied. You may not have access to this resource.', code: error.code };
      case 'not-found':
        return { message: 'Resource not found in database.', code: error.code };
      case 'already-exists':
        return { message: 'Resource already exists.', code: error.code };
      case 'resource-exhausted':
        return { message: 'Too many requests. Please try again later.', code: error.code };
      case 'unauthenticated':
        return { message: 'Authentication required. Please log in.', code: error.code };
      case 'unavailable':
        return { message: 'Service temporarily unavailable. Please try again.', code: error.code };
      default:
        return { message: `Firebase error: ${error.message || 'Unknown error'}`, code: error.code };
    }
  }

  // Generic errors
  if (error.message) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred. Please try again.' };
};

/**
 * Log errors to console with context
 */
export const logError = (context: string, error: any, additionalInfo?: any) => {
  console.group(`❌ Error in ${sanitizeForLog(context)}`);
  console.error('Error:', sanitizeForLog(error));
  if (additionalInfo) {
    console.log('Additional Info:', sanitizeForLog(additionalInfo));
  }
  console.groupEnd();
};

/**
 * Async wrapper with error handling
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context: string,
  onError?: (error: AppError) => void
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error: any) {
    const appError = handleFirebaseError(error);
    logError(context, error);
    
    if (onError) {
      onError(appError);
    }
    
    return null;
  }
};

/**
 * Format error message for user display
 */
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};
