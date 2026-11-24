import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryCache } from '../src/infra/cache.js';

describe('createMemoryCache', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads once and reuses the value until it expires', async () => {
    vi.useFakeTimers();
    const cache = createMemoryCache();
    const load = vi.fn(() => Promise.resolve('value'));

    await cache.getOrSet('key', 1000, load);
    await cache.getOrSet('key', 1000, load);
    expect(load).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1001);
    await cache.getOrSet('key', 1000, load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('shares one load between concurrent callers', async () => {
    const cache = createMemoryCache();
    const load = vi.fn(() => Promise.resolve('value'));

    await Promise.all([cache.getOrSet('key', 1000, load), cache.getOrSet('key', 1000, load)]);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not cache failures, so the next call retries', async () => {
    const cache = createMemoryCache();
    const load = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce('value');

    await expect(cache.getOrSet('key', 1000, load)).rejects.toThrow('down');
    await expect(cache.getOrSet('key', 1000, load)).resolves.toBe('value');
  });
});
