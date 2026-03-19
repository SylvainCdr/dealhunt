import { useRouter } from 'next/router';
import styles from './myProductGrid.module.css';

export default function ProductGrid({ products }) {
  const router = useRouter();

  const handleClick = (id) => {
    router.push(`/products/${id}`);
  };

  return (
    <div className={styles.gridContainer}>
      {products.map(p => (
        <div
          key={p.productId}
          className={styles.productCard}
          onClick={() => handleClick(p.productId)}

        >
          <img src={p.bigImage} alt={p.nameEn} className={styles.productImage} />
          <h3 className={styles.productTitle}>{p.nameEn}</h3>
          <p className={styles.productSku}>{p.sku}</p>
          <p className={styles.productPrice}>${p.sellPrice}</p>
        </div>
      ))}
    </div>
  );
}
