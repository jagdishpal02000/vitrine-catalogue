import { createBrowserRouter, type RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { CategoryPage } from './pages/CategoryPage';
import { ErrorPage } from './pages/ErrorPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductPage } from './pages/ProductPage';
import { SearchPage } from './pages/SearchPage';

/** Every page of the app. Exported separately so tests can render the real routes in memory. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    // If the layout itself breaks, show the friendly error page on its own.
    errorElement: <ErrorPage />,
    children: [
      {
        // If a page breaks, show the friendly error page inside the layout, so the header still works.
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'categories/:slug', element: <CategoryPage /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'products/:id', element: <ProductPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
