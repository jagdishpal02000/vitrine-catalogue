import { useSearchParams } from 'react-router';
import { useSearchResults } from '../api/catalogue';
import { ProductSection } from '../components/ProductSection';
import { QueryStatus } from '../components/QueryStatus';

/** Search results for ?q=term (R3). */
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const results = useSearchResults(query);

  if (!query) return <p>Enter a search term to find products.</p>;

  return (
    <QueryStatus query={results}>
      {(products) => (
        <ProductSection
          title={`Results for “${query}”`}
          products={products}
          emptyMessage={`No products match “${query}”. Try a different term.`}
        />
      )}
    </QueryStatus>
  );
}
