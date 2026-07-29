import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

/**
 * SEO component for managing page meta tags
 * Handles title, description, and Open Graph tags
 */
export function SEOHead({ 
  title, 
  description, 
  image = 'https://images.unsplash.com/photo-1662333085102-f6ae3be21c91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  type = 'website'
}: SEOHeadProps) {
  const location = useLocation();
  
  const fullTitle = title
    ? `${title.includes('SalesDaddy') ? title : `${title} | SalesDaddy`}`
    : 'SalesDaddy — AI Voice & Chat Agents for Bangla and English Commerce';

  const defaultDescription =
    'AI voice agents, chat agents, live inventory access and webhooks for Bangla and English speaking businesses.';
  const fullDescription = description || defaultDescription;

  
  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
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

    // Standard meta tags
    updateMetaTag('description', fullDescription);
    
    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', fullDescription, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'SalesDaddy', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', image);

    // Additional SEO tags
    updateMetaTag('author', 'SalesDaddy');
    updateMetaTag('keywords', 'AI voice agent, chat agent, Bangla AI, Bangladesh ecommerce automation, inventory API, webhooks');
  }, [fullTitle, fullDescription, fullUrl, image, type]);

  return null;
}
