// Mirrors the API contract (see /api/v1/docs). Kept apart from the API's code on purpose:
// the web app and the API share a contract across the network, not code.

export interface Category {
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
  rating?: { average: number; count: number };
}

export interface CategoryPage {
  category: Category;
  topRated: Product[];
  others: Product[];
}

export interface EnquiryRequest {
  productId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}
