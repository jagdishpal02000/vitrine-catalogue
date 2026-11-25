import { Link } from 'react-router';

/**
 * Shown when a page crashes while rendering, instead of React Router's developer error screen.
 * It never shows the error itself, only a friendly message and a way back.
 */
export function ErrorPage() {
  return (
    <section>
      <h1>Something went wrong</h1>
      <p>
        Sorry, we couldn't show this page. Please try again, or{' '}
        <Link to="/">go back to the catalogue</Link>.
      </p>
    </section>
  );
}
