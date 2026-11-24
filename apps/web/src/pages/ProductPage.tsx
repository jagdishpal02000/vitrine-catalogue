import { Link, useParams } from 'react-router';
import { useProduct } from '../api/catalogue';
import { EnquiryForm } from '../components/EnquiryForm';
import { QueryStatus } from '../components/QueryStatus';
import { formatPrice } from '../utils/formatPrice';
import styles from './ProductPage.module.css';

/** Product details page, with the enquiry form (R4, R5). */
export function ProductPage() {
  const { id = '' } = useParams();
  const productQuery = useProduct(id);

  return (
    <QueryStatus query={productQuery}>
      {(product) => (
        <article className={styles.product}>
          <img src={product.imageUrl} alt={product.title} className={styles.image} />

          <div>
            <Link to={`/categories/${product.category.slug}`} className="capitalize">
              {product.category.name}
            </Link>
            <h1>{product.title}</h1>
            <p className={styles.price}>{formatPrice(product.price)}</p>
            {product.rating && (
              <p className={styles.rating}>
                Rated {product.rating.average} out of 5 by {product.rating.count} customers
              </p>
            )}
            <p>{product.description}</p>
            <EnquiryForm product={product} />
          </div>
        </article>
      )}
    </QueryStatus>
  );
}
