import { useParams } from 'react-router';
import { useCategoryPage } from '../api/catalogue';
import { ProductSection } from '../components/ProductSection';
import { QueryStatus } from '../components/QueryStatus';

/** Category page: its top-rated products first, then everything else in the category (R2). */
export function CategoryPage() {
  const { slug = '' } = useParams();
  const categoryPage = useCategoryPage(slug);

  return (
    <QueryStatus query={categoryPage}>
      {({ category, topRated, others }) => (
        <>
          <h1 className="capitalize">{category.name}</h1>
          <ProductSection title="Top rated" products={topRated} />
          {others.length > 0 && (
            <ProductSection title={`More in ${category.name}`} products={others} />
          )}
        </>
      )}
    </QueryStatus>
  );
}
