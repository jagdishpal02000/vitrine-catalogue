import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiGet, apiPost } from './client';

function stubFetch(result: Response | Error) {
  const fetchMock = vi.fn(() =>
    result instanceof Error ? Promise.reject(result) : Promise.resolve(result),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api client', () => {
  it('calls our own /api and returns the JSON body', async () => {
    const fetchMock = stubFetch(Response.json([{ id: '1' }]));

    await expect(apiGet('/products/top-rated')).resolves.toEqual([{ id: '1' }]);
    expect(fetchMock).toHaveBeenCalledWith('/api/products/top-rated', undefined);
  });

  it('sends JSON when posting', async () => {
    const fetchMock = stubFetch(Response.json({ message: 'Thank you' }, { status: 202 }));

    await apiPost('/enquiries', { name: 'Ada' });

    expect(fetchMock).toHaveBeenCalledWith('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"Ada"}',
    });
  });

  it("turns an error response into an ApiError with the API's message", async () => {
    stubFetch(Response.json({ error: { message: 'Product not found' } }, { status: 404 }));

    await expect(apiGet('/products/999')).rejects.toMatchObject({
      status: 404,
      message: 'Product not found',
    });
  });

  it('uses a friendly message when the error did not come from our API', async () => {
    stubFetch(new Response('<html>Bad Gateway</html>', { status: 502 }));

    await expect(apiGet('/products/top-rated')).rejects.toMatchObject({
      status: 502,
      message: 'Something went wrong. Please try again.',
    });
  });

  it('explains when the server cannot be reached', async () => {
    stubFetch(new TypeError('Failed to fetch'));

    await expect(apiGet('/products/top-rated')).rejects.toMatchObject({
      status: 0,
      message: 'We could not reach the server. Check your connection and try again.',
    });
  });
});
