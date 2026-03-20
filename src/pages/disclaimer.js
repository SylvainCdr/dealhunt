import Head from "next/head";

export default function Disclaimer() {
  return (
    <>
      <Head>
        <title>Disclaimer</title>
      </Head>
      <main style={{maxWidth:600,margin:"40px auto",padding:24}}>
        <h1>Disclaimer</h1>
        <p><strong>Affiliate Disclosure:</strong> This website contains affiliate links. If you click on a link and make a purchase, we may receive a commission at no extra cost to you. This helps support the site and allows us to continue to provide content. Our editorial content is not influenced by advertisers or affiliate partnerships.</p>
        <h2>Information Accuracy</h2>
        <p>We strive to keep all information on this site up to date and accurate, but we cannot guarantee the completeness, reliability, or accuracy of any information, deals, or prices displayed. Prices and availability may change at any time without notice.</p>
        <h2>External Links</h2>
        <p>This website may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
        <h2>Liability</h2>
        <p>We are not liable for any losses or damages in connection with the use of our website or reliance on any information provided. Use the information and offers at your own risk.</p>
        <h2>Contact</h2>
        <p>If you have any questions about this disclaimer, please contact us via the contact form.</p>
      </main>
    </>
  );
}
