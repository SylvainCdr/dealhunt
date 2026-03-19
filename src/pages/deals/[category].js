// pages/deals/[category].js — SEO-optimized category pages (SSR)
import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/header/header.jsx";
import Footer from "../components/footer/footer.jsx";
import DealGrid from "../components/dealGrid/dealGrid.jsx";
import styles from "./deals.module.css";

const CATEGORY_META = {
  tech: {
    title: "Best Tech Deals",
    desc: "Top tech gadgets, phone accessories, and electronics at unbeatable prices.",
  },
  gaming: {
    title: "Best Gaming Deals",
    desc: "Budget gaming accessories, mice, keyboards, and gear.",
  },
  home: {
    title: "Best Home & Kitchen Deals",
    desc: "Kitchen gadgets, home organization, and decor finds.",
  },
  beauty: {
    title: "Best Beauty Deals",
    desc: "Skincare tools, beauty gadgets, and hair accessories.",
  },
  fashion: {
    title: "Best Fashion Deals",
    desc: "Jewelry, sunglasses, and accessories for men & women.",
  },
  sports: {
    title: "Best Sports & Fitness Deals",
    desc: "Fitness equipment, yoga gear, and workout accessories.",
  },
  outdoors: {
    title: "Best Outdoor Deals",
    desc: "Camping gear, cycling accessories, and outdoor gadgets.",
  },
  auto: {
    title: "Best Car & Auto Deals",
    desc: "Car accessories, gadgets, and tools for your vehicle.",
  },
  pets: {
    title: "Best Pet Deals",
    desc: "Pet supplies, dog toys, and accessories for your furry friends.",
  },
  toys: {
    title: "Best Toys & Kids Deals",
    desc: "Educational toys, baby products, and kids' gifts.",
  },
};

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("popular");

  const fetchDeals = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        sort,
        page: String(page),
        limit: "24",
      });
      const res = await fetch(`/api/affiliate/deals?${params}`);
      const data = await res.json();
      setDeals(data.deals || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setDeals([]);
    }
    setLoading(false);
  }, [category, sort, page]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const meta = CATEGORY_META[category] || {
    title: `Best ${category} Deals`,
    desc: `Find the best ${category} deals and discounts.`,
  };

  return (
    <>
      <Head>
        <title>{meta.title} — DealHunt 2026</title>
        <meta name="description" content={meta.desc} />
        <link
          rel="canonical"
          href={`https://dealhuntify.com/deals/${category}`}
        />
      </Head>

      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>{meta.title}</h1>
          <p className={styles.heroSub}>{meta.desc}</p>
        </section>

        <section className={styles.section}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            {["popular", "newest", "price_asc", "price_desc", "discount"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSort(s);
                    setPage(1);
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border:
                      sort === s ? "2px solid #667eea" : "1px solid #e2e8f0",
                    background: sort === s ? "#667eea" : "#fff",
                    color: sort === s ? "#fff" : "#4a5568",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {s === "popular"
                    ? "Popular"
                    : s === "newest"
                      ? "Newest"
                      : s === "price_asc"
                        ? "Price ↑"
                        : s === "price_desc"
                          ? "Price ↓"
                          : "Best Deals"}
                </button>
              ),
            )}
          </div>

          <DealGrid
            deals={deals}
            title={`${meta.title} ${total > 0 ? `(${total})` : ""}`}
            loading={loading}
          />
        </section>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Previous
            </button>
            <span className={styles.pageInfo}>
              Page {page} / {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
