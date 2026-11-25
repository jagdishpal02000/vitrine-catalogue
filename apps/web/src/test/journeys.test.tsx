import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { catalogueApi } from '../api/catalogue';
import { ApiError } from '../api/errors';
import type { Product } from '../api/types';
import { categories, hardDrive, jacket, mensClothing, tShirt } from './fixtures';
import { renderRoute } from './renderRoute';

// One journey per acceptance criterion, through the real routes and components.
// Only the API calls are stubbed.

beforeEach(() => {
  vi.spyOn(catalogueApi, 'getCategories').mockResolvedValue(categories);
  vi.spyOn(catalogueApi, 'getTopRated').mockResolvedValue([jacket, hardDrive]);
});

/** The product titles shown in the section with this heading, in order. */
async function productTitlesIn(sectionTitle: string) {
  const section = await screen.findByRole('region', { name: sectionTitle });
  return within(section)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent);
}

describe('app shell', () => {
  it('shows the brand on every page', () => {
    renderRoute('/anything');

    expect(screen.getByRole('link', { name: 'Vitrine' })).toHaveAttribute('href', '/');
  });

  it('shows a not-found page for unknown addresses', () => {
    renderRoute('/no-such-page');

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('explains when products cannot be loaded', async () => {
    vi.spyOn(catalogueApi, 'getTopRated').mockRejectedValue(
      new ApiError(502, 'UPSTREAM_UNAVAILABLE'),
    );

    renderRoute('/');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We can't load our products right now. Please try again in a moment.",
    );
  });
});

describe('friendly errors only (R6)', () => {
  it("never shows the API's wording or routes, only friendly text", async () => {
    // Only fetch is stubbed here, so the real API client, hooks and components handle the failure.
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            { error: { code: 'NOT_FOUND', message: 'Route not found: GET /api/v1/products/999' } },
            { status: 404 },
          ),
        ),
      ),
    );

    renderRoute('/products/999');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Sorry, we couldn't find what you were looking for.",
    );
    expect(document.body).not.toHaveTextContent('/api');
    expect(document.body).not.toHaveTextContent('Route not found');
  });

  it('shows a friendly error page, not the crash, when a page breaks', async () => {
    // React reports caught render errors to the console; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    // A malformed product makes the product page throw while rendering.
    vi.spyOn(catalogueApi, 'getProduct').mockResolvedValue({} as Product);

    renderRoute('/products/1');

    expect(await screen.findByRole('heading', { name: 'Something went wrong' })).toBeVisible();
    expect(document.body).not.toHaveTextContent('Cannot read properties');
    // The page broke, not the layout, so the header still works.
    expect(screen.getByRole('link', { name: 'Vitrine' })).toBeVisible();
  });
});

describe('home page (R1)', () => {
  it("shows the owner's top-rated products, in order", async () => {
    renderRoute('/');

    expect(await productTitlesIn('Top rated')).toEqual([jacket.title, hardDrive.title]);
  });
});

describe('category page (R2)', () => {
  it('shows a link to every category', async () => {
    renderRoute('/');

    const navigation = screen.getByRole('navigation', { name: 'Categories' });
    expect(await within(navigation).findByRole('link', { name: "men's clothing" })).toHaveAttribute(
      'href',
      '/categories/mens-clothing',
    );
    expect(within(navigation).getAllByRole('link')).toHaveLength(categories.length);
  });

  it('shows top-rated and additional products after clicking a category link', async () => {
    vi.spyOn(catalogueApi, 'getCategoryPage').mockResolvedValue({
      category: mensClothing,
      topRated: [jacket],
      others: [tShirt],
    });
    const user = userEvent.setup();
    renderRoute('/');

    const navigation = screen.getByRole('navigation', { name: 'Categories' });
    await user.click(await within(navigation).findByRole('link', { name: "men's clothing" }));

    expect(await screen.findByRole('heading', { level: 1, name: "men's clothing" })).toBeVisible();
    expect(await productTitlesIn('Top rated')).toEqual([jacket.title]);
    expect(await productTitlesIn("More in men's clothing")).toEqual([tShirt.title]);
    expect(catalogueApi.getCategoryPage).toHaveBeenCalledWith('mens-clothing');
  });
});

describe('search (R3)', () => {
  it('shows only the matching products after clicking Search', async () => {
    vi.spyOn(catalogueApi, 'searchProducts').mockResolvedValue([jacket]);
    const user = userEvent.setup();
    const { router } = renderRoute('/');

    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'jacket');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await productTitlesIn('Results for “jacket”')).toEqual([jacket.title]);
    expect(catalogueApi.searchProducts).toHaveBeenCalledWith('jacket');
    expect(router.state.location.search).toBe('?q=jacket');
  });

  it('says so when nothing matches', async () => {
    vi.spyOn(catalogueApi, 'searchProducts').mockResolvedValue([]);

    renderRoute('/search?q=unicorn');

    expect(
      await screen.findByText('No products match “unicorn”. Try a different term.'),
    ).toBeVisible();
  });

  it('keeps the search box in step with the address when going back', async () => {
    vi.spyOn(catalogueApi, 'searchProducts').mockResolvedValue([jacket]);
    const user = userEvent.setup();
    const { router } = renderRoute('/');
    const searchBox = () => screen.getByRole('searchbox', { name: 'Search products' });

    await user.type(searchBox(), 'jacket');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.clear(searchBox());
    await user.type(searchBox(), 'ring');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await act(() => router.navigate(-1));

    expect(router.state.location.search).toBe('?q=jacket');
    expect(searchBox()).toHaveValue('jacket');
  });
});

describe('product page (R4)', () => {
  it('shows the product details after clicking a product tile', async () => {
    vi.spyOn(catalogueApi, 'getProduct').mockResolvedValue(jacket);
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(await screen.findByRole('link', { name: /Mens Cotton Jacket/ }));

    expect(await screen.findByRole('heading', { level: 1, name: jacket.title })).toBeVisible();
    expect(screen.getByText('US$55.99')).toBeVisible();
    expect(screen.getByText(jacket.description)).toBeVisible();
    expect(catalogueApi.getProduct).toHaveBeenCalledWith(jacket.id);
  });

  it('says so when the product does not exist', async () => {
    vi.spyOn(catalogueApi, 'getProduct').mockRejectedValue(new ApiError(404, 'NOT_FOUND'));

    renderRoute('/products/999');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Sorry, we couldn't find what you were looking for.",
    );
  });
});

describe('enquiry (R5)', () => {
  async function fillInEnquiry() {
    const user = userEvent.setup();
    vi.spyOn(catalogueApi, 'getProduct').mockResolvedValue(jacket);
    renderRoute(`/products/${jacket.id}`);

    await user.click(await screen.findByRole('button', { name: 'Enquire' }));
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Message (optional)'), 'Is it waterproof?');
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));
  }

  it('sends the contact details and thanks the customer', async () => {
    vi.spyOn(catalogueApi, 'sendEnquiry').mockResolvedValue({ message: 'Thank you.' });

    await fillInEnquiry();

    expect(await screen.findByRole('status')).toHaveTextContent('Thank you!');
    expect(catalogueApi.sendEnquiry).toHaveBeenCalledWith({
      productId: jacket.id,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: undefined,
      message: 'Is it waterproof?',
    });
  });

  it('shows the error, and no thank-you, when the enquiry cannot be sent', async () => {
    vi.spyOn(catalogueApi, 'sendEnquiry').mockRejectedValue(new ApiError(502, 'EMAIL_FAILED'));

    await fillInEnquiry();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't send your enquiry just now. Please try again in a moment.",
    );
    expect(screen.queryByText(/Thank you/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
  });
});
