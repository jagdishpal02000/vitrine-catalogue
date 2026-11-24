import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>
        We couldn't find that page. <Link to="/">Back to the catalogue</Link>
      </p>
    </section>
  );
}
