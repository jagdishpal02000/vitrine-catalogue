import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { catalogueApi } from '../api/catalogue';
import { categories } from './fixtures';
import { renderRoute } from './renderRoute';

// One journey per acceptance criterion, through the real routes and components.
// Only the API calls are stubbed.

beforeEach(() => {
  vi.spyOn(catalogueApi, 'getCategories').mockResolvedValue(categories);
});

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

describe('category links (R2.1)', () => {
  it('shows a link to every category', async () => {
    renderRoute('/');

    const navigation = screen.getByRole('navigation', { name: 'Categories' });
    expect(await within(navigation).findByRole('link', { name: "men's clothing" })).toHaveAttribute(
      'href',
      '/categories/mens-clothing',
    );
    expect(within(navigation).getAllByRole('link')).toHaveLength(categories.length);
  });
});

describe('search bar (R3)', () => {
  it('opens the results page for the term when Search is clicked', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute('/');

    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), "men's jacket");
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(router.state.location.pathname).toBe('/search');
    expect(router.state.location.search).toBe("?q=men's%20jacket");
  });
});
