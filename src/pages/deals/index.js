// pages/deals/index.js — Main deals page (Option 3: Hybrid)
// Shows: featured deals (manual curation) + auto deals with filters

import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/header/header.jsx";
import DealGrid from "../../components/dealGrid/dealGrid.jsx";
import Filters from "../../components/filters/filters.jsx";
import styles from "./deals.module.css";

export default function DealsPage() {
  const router = useRouter();

  const [deals, setDeals] = useState([]);
  const [featuredDeals, setFeaturedDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Read filters from URL on mount
  useEffect(() => {
    const q = router.query;
    if (q.category) setCategory(q.category);
    if (q.source) setSource(q.source);
    if (q.sort) setSort(q.sort);
    if (q.page) setPage(parseInt(q.page));
    if (q.featured === "true") setSource(""); // reset source filter when viewing featured
  }, [router.query]);

  // Fetch featured deals (manual curation)
  useEffect(() => {
    fetch("/api/affiliate/featured")
      .then((r) => r.json())
      .then((data) => setFeaturedDeals(data.deals || []))
      .catch(() => {});
  }, []);

  // Fetch deals with filters
  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (source) params.set("source", source);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "20");

    // Also featured-only mode
    if (router.query.featured === "true") {
      params.set("featured", "true");
    }

    try {
      const res = await fetch(`/api/affiliate/deals?${params}`);
      const data = await res.json();
      setDeals(data.deals || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCategories(data.categories || []);
    } catch {
      setDeals([]);
    }
    setLoading(false);
  }, [category, source, sort, page, router.query.featured]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Update URL when filters change
  const updateFilter = (key, value) => {
    const query = { ...router.query };
    if (value) {
      query[key] = value;
    } else {
      delete query[key];
    }
    if (key !== "page") {
      query.page = "1";
      setPage(1);
    }
    router.replace({ pathname: "/deals", query }, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>DealHunt — Best Online Deals & Discounts</title>
        <meta
          name="description"
          content="Find the best deals and discounts from AliExpress, Amazon and more. Automatically updated every day."
        />
      </Head>

      <Header />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>🔥 Today&apos;s Best Deals</h1>
          <p className={styles.heroSub}>
            AliExpress, Amazon & more — updated automatically every day
          </p>
        </section>

        {/* Featured section (manual curation) */}
        {featuredDeals.length > 0 && !router.query.featured && (
          <section className={styles.section}>
            <DealGrid deals={featuredDeals} title="★ Our Picks" />
          </section>
        )}

        {/* Filters */}
        <section className={styles.section}>
          <Filters
            categories={categories}
            selectedCategory={category}
            onCategoryChange={(v) => {
              setCategory(v);
              updateFilter("category", v);
            }}
            selectedSource={source}
            onSourceChange={(v) => {
              setSource(v);
              updateFilter("source", v);
            }}
            sort={sort}
            onSortChange={(v) => {
              setSort(v);
              updateFilter("sort", v);
            }}
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              updateFilter("page", String(p));
            }}
          />
        </section>

        {/* All deals grid */}
        <section className={styles.section}>
          <DealGrid
            deals={deals}
            title={`All Deals ${total > 0 ? `(${total})` : ""}`}
            loading={loading}
          />
        </section>

        {/* Bottom pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => {
                setPage(page - 1);
                updateFilter("page", String(page - 1));
              }}
            >
              ← Previous
            </button>
            <span className={styles.pageInfo}>
              Page {page} / {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => {
                setPage(page + 1);
                updateFilter("page", String(page + 1));
              }}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </>
  );
}
