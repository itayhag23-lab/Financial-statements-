import React from 'react';

// Renders a JSON-LD structured-data block. It prerenders into the page markup
// (react-dom/server), and search engines read JSON-LD anywhere in the document,
// so this powers rich results (FAQ, SoftwareApplication) on template/tool pages.
export default function JsonLd({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Builds an FAQPage schema from [{q, a}] pairs.
export const faqSchema = (faqs = []) =>
  faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

// Breadcrumb schema from [{name, url}] items (absolute URLs).
export const breadcrumbSchema = (items = []) =>
  items.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: it.name,
          item: it.url,
        })),
      }
    : null;
