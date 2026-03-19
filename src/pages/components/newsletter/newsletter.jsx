import { useState } from "react";
import styles from "./newsletter.module.css";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "", "loading", "success", "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <span className={styles.successIcon}>✓</span>
          <p>You're in! We'll send you the best deals every week.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h3 className={styles.title}>📬 Get the Best Deals in Your Inbox</h3>
        <p className={styles.subtitle}>
          Weekly roundup of the hottest deals — no spam, unsubscribe anytime.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <button
            type="submit"
            className={styles.button}
            disabled={status === "loading"}
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
        {status === "error" && (
          <p className={styles.error}>
            Something went wrong. Please try again.
          </p>
        )}
        <p className={styles.privacy}>
          We respect your privacy. No spam, ever.
        </p>
      </div>
    </div>
  );
}
