import styles from "./dealCard.module.css";

export default function DealCard({ deal }) {
  const {
    _id,
    title,
    image,
    price,
    originalPrice,
    discount,
    source,
    rating,
    orders,
    featured,
  } = deal;

  const sourceClass =
    styles[`source${source.charAt(0).toUpperCase() + source.slice(1)}`] || "";

  return (
    <div className={styles.card}>
      {/* Badges */}
      {discount && discount > 0 && (
        <span className={`${styles.badge} ${styles.badgeDiscount}`}>
          -{discount}%
        </span>
      )}
      {featured && (
        <span className={`${styles.badge} ${styles.badgeFeatured}`}>
          ★ Picks
        </span>
      )}
      <span className={`${styles.badgeSource} ${sourceClass}`}>{source}</span>

      {/* Image */}
      <div className={styles.imageWrap}>
        <img src={image} alt={title} className={styles.image} loading="lazy" />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>${price.toFixed(2)}</span>
          {originalPrice && originalPrice > price && (
            <span className={styles.originalPrice}>
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className={styles.meta}>
          {rating && <span className={styles.rating}>★ {rating}</span>}
          {orders > 0 && <span>{orders.toLocaleString()} sold</span>}
        </div>

        <a
          href={`/api/go/${_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaButton}
        >
          View Deal →
        </a>
      </div>
    </div>
  );
}
