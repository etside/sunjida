import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageProvider';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  schema?: Record<string, unknown>[];
}

export function SEOHead({
  title,
  description,
  image = '/og-image.svg',
  type = 'website',
  schema,
}: SEOHeadProps) {
  const location = useLocation();
  const { lang } = useLanguage();

  const fullTitle = title
    ? `${title.includes('SalesDaddy') ? title : `${title} | SalesDaddy`}`
    : 'SalesDaddy — AI Voice & Chat Agents for Bangla and English Commerce';

  const defaultDescription =
    'AI voice agents, chat agents, live inventory and webhooks for Bangla and English commerce. Automate order calls, chat support, stock alerts and CRM sync.';
  const fullDescription = description || defaultDescription;

  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}${location.pathname}`;
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  // Build hreflang alternate URLs
  const currentPath = location.pathname;
  const enPath = lang === 'bn' ? currentPath.replace(/^\/bn/, '') || '/' : currentPath;
  const bnPath = lang === 'bn' ? currentPath : `/bn${currentPath}`;
  const enUrl = `${baseUrl}${enPath}`;
  const bnUrl = `${baseUrl}${bnPath}`;

  useEffect(() => {
    document.documentElement.lang = lang || 'en';
    document.title = fullTitle;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    updateMetaTag('description', fullDescription);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', fullDescription, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:image', fullImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:site_name', 'SalesDaddy', true);

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', fullImage);

    updateMetaTag('author', 'SalesDaddy');
    updateMetaTag('keywords', 'AI voice agent, chat agent, Bangla AI, Bangladesh ecommerce automation, inventory API, webhooks');

    // Remove old hreflang links
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());

    // Add hreflang alternate links
    const addLink = (hreflang: string, href: string) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      document.head.appendChild(link);
    };
    addLink('en', enUrl);
    addLink('bn', bnUrl);
    addLink('x-default', enUrl);

    // Remove old structured data
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    // Add structured data schemas
    if (schema && schema.length > 0) {
      schema.forEach(s => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(s);
        document.head.appendChild(script);
      });
    }
  }, [fullTitle, fullDescription, fullUrl, fullImage, type, lang, enUrl, bnUrl, schema]);

  return null;
}
