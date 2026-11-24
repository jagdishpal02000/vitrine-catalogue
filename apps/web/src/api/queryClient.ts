import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

/** Data-fetching settings: reuse answers for a minute, and retry once, but only when a retry could help. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) => isRetryable(error) && failureCount < 1,
      },
    },
  });
}

// A 4xx (not found, invalid input) would fail the same way again; server and network errors might not.
function isRetryable(error: Error): boolean {
  return !(error instanceof ApiError && error.status >= 400 && error.status < 500);
}
