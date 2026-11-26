import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMemoryCache } from '../../src/infra/cache.js';

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

  it('never lets a slow failed load evict a newer entry', async () => {
    vi.useFakeTimers();
    const cache = createMemoryCache();
    let failFirstLoad: (error: Error) => void = () => undefined;
    const firstLoad = new Promise<string>((_resolve, reject) => {
      failFirstLoad = reject;
    });

    const first = cache.getOrSet('key', 1000, () => firstLoad);
    vi.advanceTimersByTime(1001); // the first entry expires while still loading...
    await cache.getOrSet('key', 1000, () => Promise.resolve('newer')); // ...and a newer one replaces it
    failFirstLoad(new Error('down'));
    await expect(first).rejects.toThrow('down');

    const load = vi.fn(() => Promise.resolve('reloaded'));
    await expect(cache.getOrSet('key', 1000, load)).resolves.toBe('newer');
    expect(load).not.toHaveBeenCalled();
  });
});
