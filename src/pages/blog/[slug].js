// pages/blog/[slug].js — Individual blog article (SSG for SEO)
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/header/header.jsx";
import Footer from "../../components/footer/footer.jsx";
import { getArticleBySlug, getAllSlugs } from "../../data/articles.js";
import styles from "./blog.module.css";

export async function getStaticPaths() {
  const slugs = getAllSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { notFound: true };
  return { props: { article } };
}

// Simple markdown-like renderer (no extra deps)
function renderContent(content) {
  const lines = content.trim().split("\n");
  const html = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2)}</h1>`;
      if (/^\d+\.\s/.test(trimmed))
        return `<li>${trimmed.replace(/^\d+\.\s/, "")}</li>`;
      if (trimmed.startsWith("- ")) return `<li>${trimmed.slice(2)}</li>`;
      return `<p>${trimmed}</p>`;
    })
    .join("\n")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  return html;
}

export default function BlogArticle({ article }) {
  return (
    <>
      <Head>
        <title>{article.title} | DealHunt</title>
        <meta name="description" content={article.description} />
        <meta name="keywords" content={article.keywords} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:image" content={article.image} />
        <meta property="og:type" content="article" />
        <link
          rel="canonical"
          href={`https://dealhuntify.com/blog/${article.slug}`}
        />

        {/* Structured data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.description,
              image: article.image,
              datePublished: article.date,
              author: {
                "@type": "Organization",
                name: "DealHunt",
              },
            }),
          }}
        />
      </Head>

      <Header />

      <main className={styles.main}>
        <article className={styles.article}>
          <div className={styles.articleHeader}>
            <span className={styles.articleCategory}>{article.category}</span>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            <p className={styles.articleMeta}>{article.date}</p>
          </div>

          <img
            src={article.image}
            alt={article.title}
            className={styles.articleImage}
          />

          <div
            className={styles.articleBody}
            dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
          />

          {/* CTA to deals */}
          <div className={styles.articleCta}>
            <h3>Ready to shop?</h3>
            <p>
              Browse all {article.category} deals with prices updated daily.
            </p>
            <Link
              href={`/deals?category=${article.category}`}
              className={styles.articleCtaBtn}
            >
              View {article.category} Deals →
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
