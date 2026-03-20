import styles from "./footer.module.css";
import Link from "next/link";

const CATEGORIES = [
  { slug: "tech", label: "Tech" },
  { slug: "gaming", label: "Gaming" },
  { slug: "home", label: "Home & Kitchen" },
  { slug: "beauty", label: "Beauty" },
  { slug: "fashion", label: "Fashion" },
  { slug: "sports", label: "Sports" },
  { slug: "outdoors", label: "Outdoors" },
  { slug: "auto", label: "Auto" },
  { slug: "pets", label: "Pets" },
  { slug: "toys", label: "Toys & Kids" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>🔥 DealHunt</h4>
          <p className={styles.colText}>
            The best deals from AliExpress, Amazon & more — updated daily.
          </p>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Categories</h4>
          <ul className={styles.colList}>
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/deals/${c.slug}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>More</h4>
          <ul className={styles.colList}>
            {CATEGORIES.slice(5).map((c) => (
              <li key={c.slug}>
                <Link href={`/deals/${c.slug}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Resources</h4>
          <ul className={styles.colList}>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/deals">All Deals</Link>
            </li>
            <li>
              <Link href="/deals?featured=true">Our Picks</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/disclaimer">Disclaimer</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} DealHunt. All rights reserved.</p>
        <p className={styles.disclaimer}>
          DealHunt earns commissions from qualifying purchases through affiliate
          links. Prices are subject to change.
        </p>
      </div>
    </footer>
  );
}
