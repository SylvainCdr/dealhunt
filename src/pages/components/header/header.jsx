import styles from "./header.module.css";
import Link from "next/link";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/deals" className={styles.logo}>
          🔥 DealHunt
        </Link>
        <nav className={styles.nav}>
          <Link href="/deals" className={styles.navLink}>
            Deals
          </Link>
          <Link href="/deals?featured=true" className={styles.navLink}>
            ★ Picks
          </Link>
          <Link href="/blog" className={styles.navLink}>
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
