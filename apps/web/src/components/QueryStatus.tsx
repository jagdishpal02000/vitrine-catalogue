import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

interface QueryStatusProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}

/** Renders `children` with a query's data when there is any; otherwise its loading or error state. */
export function QueryStatus<T>({ query, children }: QueryStatusProps<T>) {
  // Data first: if a background refresh fails we keep what is on screen,
  // so nothing the customer is using (such as a half-filled enquiry form) disappears.
  if (query.data !== undefined) return children(query.data);
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  return <p role="status">Loading…</p>;
}
