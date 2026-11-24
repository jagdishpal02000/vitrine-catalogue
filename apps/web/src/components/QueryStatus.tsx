import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

interface QueryStatusProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}

/** Shows the loading and error states of a query, then renders `children` with its data. */
export function QueryStatus<T>({ query, children }: QueryStatusProps<T>) {
  if (query.isPending) return <p role="status">Loading…</p>;
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  return children(query.data);
}
