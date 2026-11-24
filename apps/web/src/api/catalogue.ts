import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from './client';
import type { Category, CategoryPage, EnquiryRequest, Product } from './types';

const encode = encodeURIComponent;

/** Typed calls to the API. Components use the hooks below; tests stub these functions. */
export const catalogueApi = {
  getTopRated: () => apiGet<Product[]>('/products/top-rated'),
  searchProducts: (query: string) => apiGet<Product[]>(`/products/search?q=${encode(query)}`),
  getProduct: (id: string) => apiGet<Product>(`/products/${encode(id)}`),
  getCategories: () => apiGet<Category[]>('/categories'),
  getCategoryPage: (slug: string) => apiGet<CategoryPage>(`/categories/${encode(slug)}/products`),
  sendEnquiry: (enquiry: EnquiryRequest) => apiPost<{ message: string }>('/enquiries', enquiry),
};

// React Query hooks: caching plus loading and error states for each call.

export const useTopRatedProducts = () =>
  useQuery({ queryKey: ['products', 'top-rated'], queryFn: () => catalogueApi.getTopRated() });

export const useSearchResults = (query: string) =>
  useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => catalogueApi.searchProducts(query),
    enabled: query !== '',
  });

export const useProduct = (id: string) =>
  useQuery({ queryKey: ['products', id], queryFn: () => catalogueApi.getProduct(id) });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => catalogueApi.getCategories() });

export const useCategoryPage = (slug: string) =>
  useQuery({ queryKey: ['categories', slug], queryFn: () => catalogueApi.getCategoryPage(slug) });

export const useSendEnquiry = () =>
  useMutation({ mutationFn: (enquiry: EnquiryRequest) => catalogueApi.sendEnquiry(enquiry) });
