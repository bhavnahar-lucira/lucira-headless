/**
 * FAQSchema Component
 * 
 * Generates JSON-LD structured data for FAQ pages to improve SEO.
 * 
 * @param {Object[]} faqs - Array of FAQ objects
 * @param {string} faqs[].question - The question text
 * @param {string} faqs[].answer - The answer text (can include HTML)
 */
export default function FAQSchema({ faqs }) {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  // Clean HTML from answers for the schema if necessary, 
  // though schema.org accepts some HTML tags like <p>, <b>, <i>, <a>, <ul>, <li>.
  // We'll keep it as is since it's common practice.
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/<[^>]*>?/gm, ''), // Stripping HTML for cleaner text-only schema
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
