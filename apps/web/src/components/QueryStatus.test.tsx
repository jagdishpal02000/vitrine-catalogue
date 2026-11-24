import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

  it('shows the error when there is nothing to show yet', () => {
    renderWith({ isError: true, error: new Error('Product not found') });

    expect(screen.getByRole('alert')).toHaveTextContent('Product not found');
  });

  it('keeps showing loaded data when a background refresh fails', () => {
    renderWith({ data: 'Loaded product', isError: true, error: new Error('Refresh failed') });

    expect(screen.getByText('Loaded product')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
