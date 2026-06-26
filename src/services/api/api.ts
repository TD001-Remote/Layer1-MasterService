/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base API configuration
 * Currently uses direct Firebase calls, but can be extended to use REST API
 */

export const API_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
};

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): never => {
  if (error.code) {
    throw new ApiError(error.message || 'An error occurred', error.code);
  }
  throw new ApiError(error.message || 'An unknown error occurred');
};
