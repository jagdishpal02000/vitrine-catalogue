import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApiError } from '../api/errors';
import { QueryStatus } from './QueryStatus';

function renderWith(state: Partial<UseQueryResult<string>>) {
  render(
    <QueryStatus query={state as UseQueryResult<string>}>{(data) => <p>{data}</p>}</QueryStatus>,
  );
}

describe('QueryStatus', () => {
  it('shows loading until the first answer arrives', () => {
    renderWith({ isPending: true });

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('shows a friendly error when there is nothing to show yet', () => {
    renderWith({ isError: true, error: new ApiError(404, 'NOT_FOUND') });

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Sorry, we couldn't find what you were looking for.",
    );
  });

  it('never shows the text of an unexpected error', () => {
    renderWith({ isError: true, error: new URIError('URI malformed') });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong on our side. Please try again in a moment.',
    );
    expect(screen.queryByText(/URI malformed/)).not.toBeInTheDocument();
  });

  it('keeps showing loaded data when a background refresh fails', () => {
    renderWith({ data: 'Loaded product', isError: true, error: new Error('Refresh failed') });

    expect(screen.getByText('Loaded product')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
