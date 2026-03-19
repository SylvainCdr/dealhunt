import styles from "./filters.module.css";

export default function Filters({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedSource,
  onSourceChange,
  sort,
  onSortChange,
  page,
  totalPages,
  onPageChange,
}) {
  const sources = [
    { key: "", label: "All", className: styles.sourceBtnAll },
    {
      key: "aliexpress",
      label: "AliExpress",
      className: styles.sourceBtnAliexpress,
    },
    { key: "amazon", label: "Amazon", className: styles.sourceBtnAmazon },
    { key: "ebay", label: "eBay", className: styles.sourceBtnEbay },
    { key: "awin", label: "Awin", className: styles.sourceBtnAwin },
    { key: "manual", label: "Picks", className: styles.sourceBtnManual },
  ];

  return (
    <div>
      {/* Category filters */}
      {categories && categories.length > 0 && (
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${!selectedCategory ? styles.filterBtnActive : ""}`}
            onClick={() => onCategoryChange("")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${selectedCategory === cat ? styles.filterBtnActive : ""}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Source + Sort row */}
      <div className={styles.sortRow}>
        <div className={styles.sourceFilters}>
          {sources.map((s) => (
            <button
              key={s.key}
              className={`${styles.sourceBtn} ${s.className} ${
                selectedSource !== s.key ? styles.sourceBtnInactive : ""
              }`}
              onClick={() => onSourceChange(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="discount">Best Deals</option>
        </select>
      </div>

      {/* Pagination (bottom, rendered separately) */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} / {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
