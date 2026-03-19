// pages/admin/index.js — Admin dashboard for managing deals
// Protected by ADMIN_SECRET (entered in the UI)
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import styles from "./admin.module.css";

const CATEGORIES = [
  "tech",
  "gaming",
  "home",
  "beauty",
  "fashion",
  "sports",
  "outdoors",
  "auto",
  "pets",
  "toys",
];

const SOURCES = ["manual", "amazon", "aliexpress", "ebay", "awin"];

const emptyForm = {
  title: "",
  image: "",
  price: "",
  originalPrice: "",
  affiliateUrl: "",
  category: "tech",
  source: "manual",
  description: "",
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [deals, setDeals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({
    category: "",
    source: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);

  // Add / Edit form
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Stats
  const [stats, setStats] = useState(null);

  const headers = {
    "Content-Type": "application/json",
    "x-admin-secret": secret,
  };

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filter.category) params.set("category", filter.category);
    if (filter.source) params.set("source", filter.source);

    try {
      const res = await fetch(`/api/affiliate/deals?${params}`);
      const data = await res.json();
      let filtered = data.deals || [];
      if (filter.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter((d) => d.title.toLowerCase().includes(q));
      }
      setDeals(filtered);
      setTotal(data.total || 0);
    } catch {
      setDeals([]);
    }
    setLoading(false);
  }, [page, filter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/affiliate/stats");
      setStats(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchDeals();
      fetchStats();
    }
  }, [authenticated, fetchDeals, fetchStats]);

  const login = () => {
    if (secret.trim()) setAuthenticated(true);
  };

  // Create or update deal
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const body = {
      title: form.title,
      image: form.image,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      affiliateUrl: form.affiliateUrl,
      category: form.category,
      source: form.source,
      description: form.description,
    };

    try {
      let res;
      if (editingId) {
        // Update existing deal
        res = await fetch("/api/admin/deals", {
          method: "PUT",
          headers,
          body: JSON.stringify({ dealId: editingId, ...body }),
        });
      } else {
        // Create new
        res = await fetch("/api/affiliate/featured", {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        setMessage(editingId ? "Deal updated!" : "Deal created!");
        setForm({ ...emptyForm });
        setEditingId(null);
        setFormOpen(false);
        fetchDeals();
        fetchStats();
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error}`);
      }
    } catch {
      setMessage("Network error");
    }
    setSaving(false);
  };

  // Delete deal
  const handleDelete = async (id) => {
    if (!confirm("Delete this deal?")) return;
    try {
      await fetch("/api/admin/deals", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ dealId: id }),
      });
      fetchDeals();
      fetchStats();
    } catch {
      /* ignore */
    }
  };

  // Toggle featured
  const toggleFeatured = async (id, current) => {
    await fetch("/api/affiliate/featured", {
      method: "POST",
      headers,
      body: JSON.stringify({ dealId: id, featured: !current }),
    });
    fetchDeals();
  };

  // Toggle active
  const toggleActive = async (id, current) => {
    await fetch("/api/admin/deals", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ dealId: id, active: !current }),
    });
    fetchDeals();
  };

  // Edit
  const startEdit = (deal) => {
    setForm({
      title: deal.title,
      image: deal.image || "",
      price: String(deal.price),
      originalPrice: deal.originalPrice ? String(deal.originalPrice) : "",
      affiliateUrl: deal.affiliateUrl,
      category: deal.category || "tech",
      source: deal.source || "manual",
      description: deal.description || "",
    });
    setEditingId(deal._id);
    setFormOpen(true);
  };

  // Login screen
  if (!authenticated) {
    return (
      <>
        <Head>
          <title>Admin — DealHunt</title>
        </Head>
        <div className={styles.loginWrap}>
          <div className={styles.loginBox}>
            <h1>🔒 Admin</h1>
            <input
              type="password"
              placeholder="Admin secret..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className={styles.input}
            />
            <button onClick={login} className={styles.btnPrimary}>
              Enter
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin — DealHunt</title>
      </Head>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>🔥 DealHunt Admin</h2>

          {stats && (
            <div className={styles.statsBox}>
              <div className={styles.stat}>
                <span>{stats.totalDeals}</span>
                <small>Total Deals</small>
              </div>
              <div className={styles.stat}>
                <span>{stats.totalClicks || 0}</span>
                <small>Clicks</small>
              </div>
            </div>
          )}

          <nav className={styles.sidebarNav}>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setForm({ ...emptyForm });
                setEditingId(null);
                setFormOpen(true);
              }}
            >
              + Add Deal
            </button>
            <a
              href="/deals"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sidebarLink}
            >
              View Site →
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <main className={styles.main}>
          {/* Message */}
          {message && <div className={styles.message}>{message}</div>}

          {/* Add/Edit Form */}
          {formOpen && (
            <div className={styles.formOverlay}>
              <form className={styles.formCard} onSubmit={handleSubmit}>
                <div className={styles.formHeader}>
                  <h3>{editingId ? "Edit Deal" : "Add New Deal"}</h3>
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={() => {
                      setFormOpen(false);
                      setEditingId(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldFull}>
                    <label>Title *</label>
                    <input
                      className={styles.input}
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Price ($) *</label>
                    <input
                      className={styles.input}
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Original Price ($)</label>
                    <input
                      className={styles.input}
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.originalPrice}
                      onChange={(e) =>
                        setForm({ ...form, originalPrice: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Category</label>
                    <select
                      className={styles.select}
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>Source</label>
                    <select
                      className={styles.select}
                      value={form.source}
                      onChange={(e) =>
                        setForm({ ...form, source: e.target.value })
                      }
                    >
                      {SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldFull}>
                    <label>Affiliate URL *</label>
                    <input
                      className={styles.input}
                      type="url"
                      value={form.affiliateUrl}
                      onChange={(e) =>
                        setForm({ ...form, affiliateUrl: e.target.value })
                      }
                      required
                      placeholder="https://..."
                    />
                  </div>

                  <div className={styles.fieldFull}>
                    <label>Image URL</label>
                    <input
                      className={styles.input}
                      type="url"
                      value={form.image}
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.value })
                      }
                      placeholder="https://..."
                    />
                    {form.image && (
                      <img src={form.image} alt="" className={styles.preview} />
                    )}
                  </div>

                  <div className={styles.fieldFull}>
                    <label>Description</label>
                    <textarea
                      className={styles.textarea}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      setFormOpen(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Deal"
                        : "Create Deal"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters bar */}
          <div className={styles.toolbar}>
            <input
              className={styles.searchInput}
              placeholder="Search deals..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
            <select
              className={styles.select}
              value={filter.category}
              onChange={(e) => {
                setFilter({ ...filter, category: e.target.value });
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={filter.source}
              onChange={(e) => {
                setFilter({ ...filter, source: e.target.value });
                setPage(1);
              }}
            >
              <option value="">All Sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Deals table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Source</th>
                  <th>Category</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      Loading...
                    </td>
                  </tr>
                ) : deals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      No deals found
                    </td>
                  </tr>
                ) : (
                  deals.map((deal) => (
                    <tr
                      key={deal._id}
                      className={!deal.active ? styles.rowInactive : ""}
                    >
                      <td>
                        {deal.image && (
                          <img
                            src={deal.image}
                            alt=""
                            className={styles.thumb}
                          />
                        )}
                      </td>
                      <td className={styles.titleCell}>{deal.title}</td>
                      <td>
                        <strong>${deal.price?.toFixed(2)}</strong>
                        {deal.originalPrice &&
                          deal.originalPrice > deal.price && (
                            <>
                              <br />
                              <s className={styles.muted}>
                                ${deal.originalPrice.toFixed(2)}
                              </s>
                            </>
                          )}
                        {deal.discount > 0 && (
                          <span className={styles.discountBadge}>
                            -{deal.discount}%
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${styles.sourceBadge} ${styles["source_" + deal.source]}`}
                        >
                          {deal.source}
                        </span>
                      </td>
                      <td>{deal.category}</td>
                      <td>{deal.clicks || 0}</td>
                      <td>
                        <div className={styles.statusBtns}>
                          <button
                            className={`${styles.statusBtn} ${deal.featured ? styles.statusActive : ""}`}
                            onClick={() =>
                              toggleFeatured(deal._id, deal.featured)
                            }
                            title="Toggle featured"
                          >
                            ★
                          </button>
                          <button
                            className={`${styles.statusBtn} ${deal.active ? styles.statusActive : styles.statusOff}`}
                            onClick={() => toggleActive(deal._id, deal.active)}
                            title="Toggle active"
                          >
                            {deal.active ? "●" : "○"}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.editBtn}
                            onClick={() => startEdit(deal)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(deal._id)}
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className={styles.pageBtn}
            >
              ← Prev
            </button>
            <span>
              Page {page} ({total} deals)
            </span>
            <button
              disabled={deals.length < 20}
              onClick={() => setPage(page + 1)}
              className={styles.pageBtn}
            >
              Next →
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
