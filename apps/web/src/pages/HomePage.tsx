import { useTopRatedProducts } from '../api/catalogue';
import { ProductSection } from '../components/ProductSection';
import { QueryStatus } from '../components/QueryStatus';
import { BRAND } from '../config';

/** Home page: the business owner's top-rated picks (R1). */
export function HomePage() {
  const topRated = useTopRatedProducts();

  return (
    <>
      <h1>{BRAND.tagline}</h1>
      <QueryStatus query={topRated}>
        {(products) => <ProductSection title="Top rated" products={products} />}
      </QueryStatus>
    </>
  );
}
