import { useId } from 'react';
import type { Product } from '../api/types';
import { ProductCard } from './ProductCard';
import styles from './ProductSection.module.css';

interface ProductSectionProps {
  title: string;
  products: Product[];
  emptyMessage?: string;
}

/** A titled grid of product tiles, used by the home, category and search pages. */
export function ProductSection({
  title,
  products,
  emptyMessage = 'No products to show.',
}: ProductSectionProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId}>{title}</h2>
      {products.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul className={styles.grid}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
