import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
      </Head>
      <main style={{maxWidth:600,margin:"40px auto",padding:24}}>
        <h1>Privacy Policy</h1>
        <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our website.</p>
        <h2>Personal Information We Collect</h2>
        <p>We automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the site, and information about how you interact with the site.</p>
        <h2>How Do We Use Your Personal Information?</h2>
        <p>We use the information to improve and optimize our site, to analyze traffic, and to understand how users interact with our content. We may use third-party analytics and advertising services (such as Google Analytics and affiliate networks) that collect, monitor, and analyze this data.</p>
        <h2>Sharing Your Personal Information</h2>
        <p>We do not sell your personal information. We may share your information with third parties to help us use your personal information, as described above. For example, we use Google Analytics to help us understand how our customers use the site. You can read more about how Google uses your Personal Information here: <a href="https://www.google.com/intl/en/policies/privacy/" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.</p>
        <h2>Affiliate Disclosure</h2>
        <p>This site contains affiliate links. If you click on an affiliate link and make a purchase, we may receive a commission at no extra cost to you. Affiliate partners may use cookies to track your activity for commission purposes.</p>
        <h2>Your Rights</h2>
        <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us.</p>
        <h2>Changes</h2>
        <p>We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.</p>
        <h2>Contact Us</h2>
        <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us via the contact form.</p>
      </main>
    </>
  );
}
