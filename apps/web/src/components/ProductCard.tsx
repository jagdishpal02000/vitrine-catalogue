import { Link } from 'react-router';
import type { Product } from '../api/types';
import { formatPrice } from '../utils/formatPrice';
import styles from './ProductCard.module.css';

/** A product tile. The whole tile links to the product page. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      {/* Decorative here: the title next to it already names the product. */}
      <img src={product.imageUrl} alt="" loading="lazy" className={styles.image} />
      <h3 className={styles.title}>{product.title}</h3>
      <p className={styles.price}>{formatPrice(product.price)}</p>
    </Link>
  );
}
