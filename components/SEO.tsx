import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'product';
  price?: number;
  availability?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image, 
  type = 'website',
  price,
  availability 
}) => {
  const siteTitle = "Lumina Florals";
  const fullTitle = `${title} | ${siteTitle}`;

  useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update Open Graph Tags
    const updateMeta = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMeta('og:title', fullTitle);
    updateMeta('og:description', description);
    if (image) updateMeta('og:image', image);
    updateMeta('og:type', type);

    // Inject JSON-LD
    let script = document.querySelector('#json-ld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }

    const structuredData = type === 'product' ? {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": title,
      "image": image ? [image] : [],
      "description": description,
      "brand": {
        "@type": "Brand",
        "name": "Lumina Florals"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "USD",
        "price": price,
        "availability": availability ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    } : {
      "@context": "https://schema.org",
      "@type": "Florist",
      "name": "Lumina Florals",
      "image": "https://images.unsplash.com/photo-1507290439931-a861b5a38200",
      "telephone": "+1-212-555-0123",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Blossom Avenue",
        "addressLocality": "New York",
        "addressRegion": "NY",
        "postalCode": "10012",
        "addressCountry": "US"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    };

    script.textContent = JSON.stringify(structuredData);

  }, [fullTitle, description, image, type, price, availability]);

  return null;
};