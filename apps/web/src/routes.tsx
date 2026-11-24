import { createBrowserRouter, type RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { NotFoundPage } from './pages/NotFoundPage';

/** Every page of the app. Exported separately so tests can render the real routes in memory. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
];

export const router = createBrowserRouter(routes);
