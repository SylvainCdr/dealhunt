import DealCard from "../dealCard/dealCard.jsx";
import styles from "./dealGrid.module.css";

export default function DealGrid({ deals, title, loading }) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingDot}></span>
        <span className={styles.loadingDot}></span>
        <span className={styles.loadingDot}></span>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className={styles.empty}>No deals available at the moment.</div>
    );
  }

  return (
    <div className={styles.container}>
      {title && <h2 className={styles.sectionTitle}>{title}</h2>}
      <div className={styles.grid}>
        {deals.map((deal) => (
          <DealCard key={deal._id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
