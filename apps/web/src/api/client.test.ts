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
  it('calls our own versioned API and returns the JSON body', async () => {
    const fetchMock = stubFetch(Response.json([{ id: '1' }]));

    await expect(apiGet('/top-rated')).resolves.toEqual([{ id: '1' }]);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/top-rated', undefined);
  });

  it('sends JSON when posting', async () => {
    const fetchMock = stubFetch(Response.json({ message: 'Thank you' }, { status: 202 }));

    await apiPost('/enquiries', { name: 'Ada' });

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"Ada"}',
    });
  });

  it("shows friendly text for the error's code, never the API's own wording", async () => {
    stubFetch(
      Response.json(
        { error: { code: 'NOT_FOUND', message: 'Route not found: GET /api/v1/products/999' } },
        { status: 404 },
      ),
    );

    await expect(apiGet('/products/999')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: "Sorry, we couldn't find what you were looking for.",
    });
  });

  it('uses a generic friendly message when the error did not come from our API', async () => {
    stubFetch(new Response('<html>Bad Gateway</html>', { status: 502 }));

    await expect(apiGet('/top-rated')).rejects.toMatchObject({
      status: 502,
      message: 'Something went wrong on our side. Please try again in a moment.',
    });
  });

  it('uses a generic friendly message when a success response is not valid JSON', async () => {
    stubFetch(new Response('<!doctype html><title>Proxy page</title>', { status: 200 }));

    await expect(apiGet('/top-rated')).rejects.toMatchObject({
      message: 'Something went wrong on our side. Please try again in a moment.',
    });
  });

  it('explains when the server cannot be reached', async () => {
    stubFetch(new TypeError('Failed to fetch'));

    await expect(apiGet('/top-rated')).rejects.toMatchObject({
      status: 0,
      message: "We couldn't reach our servers. Please check your connection and try again.",
    });
  });
});
