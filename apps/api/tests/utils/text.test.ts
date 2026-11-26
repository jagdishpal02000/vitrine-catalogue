import { describe, expect, it } from 'vitest';
import { slugify, toWords } from '../../src/utils/text.js';

describe('toWords', () => {
  it('splits text into lower-case words without apostrophes', () => {
    expect(toWords("Men's Cotton-Jacket, 2XL")).toEqual(['mens', 'cotton', 'jacket', '2xl']);
  });
});

describe('slugify', () => {
  it('turns a name into a URL-friendly slug', () => {
    expect(slugify("men's clothing")).toBe('mens-clothing');
    expect(slugify('Electronics')).toBe('electronics');
  });
});
