import { describe, expect, it } from 'vitest';
import { matchesSearch } from '../../src/utils/search.js';
import { goldRing, mensJacket, womensRainJacket } from '../fixtures.js';

describe('matchesSearch', () => {
  it('ignores case', () => {
    expect(matchesSearch(mensJacket, 'JACKET')).toBe(true);
  });

  it('matches the start of a word, so "jack" finds jackets', () => {
    expect(matchesSearch(mensJacket, 'jack')).toBe(true);
  });

  it('does not match inside a word, so "men" does not find women\'s products', () => {
    expect(matchesSearch(mensJacket, 'men')).toBe(true);
    expect(matchesSearch(womensRainJacket, 'men')).toBe(false);
  });

  it('requires every word of the query to match', () => {
    expect(matchesSearch(mensJacket, 'mens jacket')).toBe(true);
    expect(matchesSearch(womensRainJacket, 'mens jacket')).toBe(false);
  });

  it('searches the description and the category as well as the title', () => {
    expect(matchesSearch(mensJacket, 'outerwear')).toBe(true);
    expect(matchesSearch(goldRing, 'jewelery')).toBe(true);
  });

  it('ignores apostrophes, so "men\'s" matches "Mens"', () => {
    expect(matchesSearch(mensJacket, "men's")).toBe(true);
  });

  it('matches nothing when the query has no letters or digits', () => {
    expect(matchesSearch(mensJacket, '!!!')).toBe(false);
  });
});
