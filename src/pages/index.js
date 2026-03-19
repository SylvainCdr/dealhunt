// pages/index.js — DealHunt Landing Page
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/header/header.jsx";
import Footer from "../components/footer/footer.jsx";
import DealGrid from "../components/dealGrid/dealGrid.jsx";
import Newsletter from "../components/newsletter/newsletter.jsx";
import styles from "./home.module.css";

const CATEGORIES = [
  { slug: "tech", label: "🔌 Tech", color: "#667eea" },
  { slug: "gaming", label: "🎮 Gaming", color: "#e53e3e" },
  { slug: "home", label: "🏠 Home", color: "#38a169" },
  { slug: "beauty", label: "💄 Beauty", color: "#d53f8c" },
  { slug: "fashion", label: "👗 Fashion", color: "#805ad5" },
  { slug: "sports", label: "⚽ Sports", color: "#dd6b20" },
  { slug: "outdoors", label: "🏕️ Outdoors", color: "#2b6cb0" },
  { slug: "auto", label: "🚗 Auto", color: "#4a5568" },
  { slug: "pets", label: "🐾 Pets", color: "#b7791f" },
  { slug: "toys", label: "🧸 Toys", color: "#e53e3e" },
];

export default function Home() {
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [latestDeals, setLatestDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHome() {
      try {
        const [featRes, latestRes] = await Promise.all([
          fetch("/api/affiliate/deals?sort=popular&limit=8"),
          fetch("/api/affiliate/deals?sort=newest&limit=8"),
        ]);
        const [featData, latestData] = await Promise.all([
          featRes.json(),
          latestRes.json(),
        ]);
        setFeaturedDeals(featData.deals || []);
        setLatestDeals(latestData.deals || []);
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    fetchHome();
  }, []);

  return (
    <>
      <Head>
        <title>DealHunt — Best Online Deals, Coupons & Discounts 2026</title>
        <meta
          name="description"
          content="Find the best deals from AliExpress, Amazon and more. Updated daily with thousands of discounted products across tech, gaming, home, beauty and fashion."
        />
        <meta
          name="keywords"
          content="best deals, online deals, aliexpress deals, cheap gadgets, discount coupons, best prices 2026"
        />
        <link rel="canonical" href="https://dealhuntify.com/" />
        <meta property="og:title" content="DealHunt — Best Online Deals 2026" />
        <meta
          property="og:description"
          content="Thousands of curated deals updated daily. Tech, gaming, home, beauty and more."
        />
        <meta property="og:type" content="website" />
      </Head>

      <Header />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Find the <span className={styles.accent}>Best Deals</span> Online
          </h1>
          <p className={styles.heroSub}>
            Thousands of curated deals from AliExpress, Amazon & more — updated
            daily.
          </p>
          <div className={styles.heroCta}>
            <Link href="/deals" className={styles.ctaPrimary}>
              Browse All Deals →
            </Link>
            <Link href="/deals?featured=true" className={styles.ctaSecondary}>
              ★ Staff Picks
            </Link>
          </div>
        </section>

        {/* Category Grid */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Link
                href={`/deals/${cat.slug}`}
                key={cat.slug}
                className={styles.categoryCard}
              >
                <span className={styles.categoryEmoji}>
                  {cat.label.split(" ")[0]}
                </span>
                <span className={styles.categoryLabel}>
                  {cat.label.split(" ").slice(1).join(" ")}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Deals */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔥 Popular Deals</h2>
            <Link href="/deals?sort=popular" className={styles.viewAll}>
              View All →
            </Link>
          </div>
          <DealGrid deals={featuredDeals} loading={loading} />
        </section>

        {/* Newsletter */}
        <Newsletter />

        {/* Latest Deals */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🆕 Just Added</h2>
            <Link href="/deals?sort=newest" className={styles.viewAll}>
              View All →
            </Link>
          </div>
          <DealGrid deals={latestDeals} loading={loading} />
        </section>

        {/* Blog preview */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📝 From the Blog</h2>
            <Link href="/blog" className={styles.viewAll}>
              All Articles →
            </Link>
          </div>
          <div className={styles.blogGrid}>
            <Link
              href="/blog/best-tech-gadgets-under-10-dollars"
              className={styles.blogCard}
            >
              <h3>15 Best Tech Gadgets Under $10 You Need in 2026</h3>
              <p>
                Discover the best affordable tech gadgets under $10 from
                AliExpress.
              </p>
            </Link>
            <Link
              href="/blog/aliexpress-vs-amazon-where-to-buy"
              className={styles.blogCard}
            >
              <h3>AliExpress vs Amazon: Where Should You Buy in 2026?</h3>
              <p>A complete comparison to help you shop smarter.</p>
            </Link>
            <Link
              href="/blog/gaming-setup-under-50-dollars"
              className={styles.blogCard}
            >
              <h3>Complete Gaming Setup Under $50</h3>
              <p>Build a surprisingly good gaming setup on a budget.</p>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
