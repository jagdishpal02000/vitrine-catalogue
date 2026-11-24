import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from './renderRoute';

describe('app shell', () => {
  it('shows the brand on every page', () => {
    renderRoute('/anything');

    expect(screen.getByRole('link', { name: 'Vitrine' })).toHaveAttribute('href', '/');
  });

  it('shows a not-found page for unknown addresses', () => {
    renderRoute('/no-such-page');

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
