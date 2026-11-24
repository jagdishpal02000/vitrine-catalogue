import type { Category, Product } from '../api/types';

export const electronics: Category = { slug: 'electronics', name: 'electronics' };
export const mensClothing: Category = { slug: 'mens-clothing', name: "men's clothing" };
export const categories = [electronics, mensClothing];

function product(id: string, title: string, category: Category, price: number): Product {
  return {
    id,
    title,
    description: `${title}, described.`,
    price,
    imageUrl: `https://images.example.com/${id}.png`,
    category,
    rating: { average: 4.5, count: 120 },
  };
}

export const jacket = product('3', 'Mens Cotton Jacket', mensClothing, 55.99);
export const tShirt = product('2', 'Mens Casual T-Shirt', mensClothing, 22.3);
export const hardDrive = product('12', 'Portable Hard Drive', electronics, 114);
export const monitor = product('13', 'Curved Gaming Monitor', electronics, 599);
