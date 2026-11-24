import type { Product } from '../src/models/product.model.js';
import { slugify } from '../src/utils/text.js';

function product(
  id: string,
  title: string,
  categoryName: string,
  rating: number,
  description = 'Everyday essential.',
): Product {
  return {
    id,
    title,
    description,
    price: 10,
    imageUrl: `https://images.example.com/${id}.png`,
    category: { slug: slugify(categoryName), name: categoryName },
    rating: { average: rating, count: 100 },
  };
}

export const mensJacket = product(
  '1',
  'Mens Cotton Jacket',
  "men's clothing",
  4.7,
  'Great outerwear for spring.',
);
export const mensTShirt = product('2', 'Mens Casual T-Shirt', "men's clothing", 4.1);
export const womensRainJacket = product(
  '3',
  'Rain Jacket Women Windbreaker',
  "women's clothing",
  3.8,
);
export const goldRing = product('4', 'Gold Plated Ring', 'jewelery', 3.0);
export const silverBracelet = product('5', 'Silver Dragon Bracelet', 'jewelery', 4.6);
export const hardDrive = product('6', 'Portable Hard Drive', 'electronics', 2.9);

export const products = [
  mensJacket,
  mensTShirt,
  womensRainJacket,
  goldRing,
  silverBracelet,
  hardDrive,
];
