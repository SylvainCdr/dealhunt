// pages/blog/index.js — Blog listing page (SEO hub)
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/header/header.jsx";
import Footer from "../../components/footer/footer.jsx";
import { getAllArticles } from "../../data/articles.js";
import styles from "./blog.module.css";

export async function getStaticProps() {
  const articles = getAllArticles();
  return { props: { articles } };
}

export default function BlogIndex({ articles }) {
  return (
    <>
      <Head>
        <title>DealHunt Blog — Best Deals Tips & Buying Guides</title>
        <meta
          name="description"
          content="Expert buying guides, product reviews, and deal-finding tips. Learn how to find the best deals on AliExpress, Amazon and more."
        />
      </Head>

      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>Buying Guides & Deal Tips</h1>
          <p>Expert picks, product reviews, and money-saving strategies</p>
        </section>

        <section className={styles.grid}>
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className={styles.card}
            >
              <div className={styles.cardImage}>
                <img src={article.image} alt={article.title} loading="lazy" />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardCategory}>{article.category}</span>
                <h2 className={styles.cardTitle}>{article.title}</h2>
                <p className={styles.cardDesc}>{article.description}</p>
                <span className={styles.cardDate}>{article.date}</span>
              </div>
            </Link>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
