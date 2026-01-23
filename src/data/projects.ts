import type { Project } from '@/types';

// Import portfolio images
import nitolaBrand from '@/assets/portfolio/nitola-brand.png';
import waptaBrand from '@/assets/portfolio/wapta-brand.png';
import hatiDriving from '@/assets/portfolio/hati-driving.png';
import cofferishDay from '@/assets/portfolio/cofferish-day.png';
import instagramKit from '@/assets/portfolio/instagram-kit.png';
import beautySalon from '@/assets/portfolio/beauty-salon.png';
import stationaryMockup from '@/assets/portfolio/stationary-mockup.jpg';

export type ProjectCategory = 'logo-design' | 'brand-identity' | 'social-media' | 'presentation';

export const projects: Project[] = [
  {
    id: '1',
    title: 'NITOLA Brand Identity',
    category: 'brand-identity',
    year: '2024',
    slug: 'nitola-brand',
    coverImage: nitolaBrand,
    description: 'Complete brand identity design for NITOLA, featuring a vibrant coral color palette with elegant typography. The design captures modern sophistication while maintaining approachability.',
    client: 'NITOLA',
    location: 'International',
    images: [
      {
        id: '1-1',
        src: nitolaBrand,
        alt: 'NITOLA brand identity showcase',
        aspectRatio: 'landscape'
      }
    ]
  },
  {
    id: '2',
    title: 'W/apta Corporate Identity',
    category: 'brand-identity',
    year: '2024',
    slug: 'wapta-brand',
    coverImage: waptaBrand,
    description: 'Professional corporate identity for W/apta, utilizing a sophisticated blue color scheme that conveys trust, reliability, and modern business values.',
    client: 'W/apta',
    location: 'International',
    images: [
      {
        id: '2-1',
        src: waptaBrand,
        alt: 'W/apta corporate identity design',
        aspectRatio: 'landscape'
      }
    ]
  },
  {
    id: '3',
    title: 'HATI Driving Academy',
    category: 'logo-design',
    year: '2024',
    slug: 'hati-driving',
    coverImage: hatiDriving,
    description: 'Bold and energetic brand identity for HATI Driving Academy. The neon green on black creates a dynamic, modern look that stands out and appeals to young drivers.',
    client: 'HATI Driving Academy',
    location: 'Bangladesh',
    images: [
      {
        id: '3-1',
        src: hatiDriving,
        alt: 'HATI Driving Academy logo and branding',
        aspectRatio: 'landscape'
      }
    ]
  },
  {
    id: '4',
    title: 'Cofferish Day Coffee Brand',
    category: 'brand-identity',
    year: '2024',
    slug: 'cofferish-day',
    coverImage: cofferishDay,
    description: 'Warm and inviting brand identity for Cofferish Day coffee shop. The teal and copper color combination creates a cozy, premium feel perfect for a specialty coffee brand.',
    client: 'Cofferish Day',
    location: 'International',
    images: [
      {
        id: '4-1',
        src: cofferishDay,
        alt: 'Cofferish Day coffee brand identity',
        aspectRatio: 'landscape'
      }
    ]
  },
  {
    id: '5',
    title: 'Instagram Branding Kit',
    category: 'social-media',
    year: '2024',
    slug: 'instagram-kit',
    coverImage: instagramKit,
    description: 'Comprehensive Instagram branding kit designed for beauty and lifestyle brands. Includes post templates, story highlights, and cohesive visual elements.',
    client: 'Various Clients',
    location: 'International',
    images: [
      {
        id: '5-1',
        src: instagramKit,
        alt: 'Instagram branding kit templates',
        aspectRatio: 'landscape'
      }
    ]
  },
  {
    id: '6',
    title: 'Beauty Salon Social Media',
    category: 'social-media',
    year: '2024',
    slug: 'beauty-salon',
    coverImage: beautySalon,
    description: 'Elegant social media design package for beauty salons. Features sophisticated pink and neutral tones with modern typography for a premium aesthetic.',
    client: 'Beauty Salon',
    location: 'International',
    images: [
      {
        id: '6-1',
        src: beautySalon,
        alt: 'Beauty salon social media design',
        aspectRatio: 'landscape'
      }
    ]
  },
  {
    id: '7',
    title: 'Corporate Stationery Design',
    category: 'brand-identity',
    year: '2024',
    slug: 'corporate-stationery',
    coverImage: stationaryMockup,
    description: 'Professional corporate stationery set including business cards, letterheads, envelopes, and brand collateral. Clean and modern design that elevates brand presence.',
    client: 'Corporate Client',
    location: 'International',
    images: [
      {
        id: '7-1',
        src: stationaryMockup,
        alt: 'Corporate stationery mockup',
        aspectRatio: 'landscape'
      }
    ]
  }
];

// Helper function to get project by slug
export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find(project => project.slug === slug);
};

// Helper function to get projects by category
export const getProjectsByCategory = (category: string): Project[] => {
  if (category === 'all') return projects;
  return projects.filter(project => project.category === category);
};

// Helper function to get featured projects (first 4)
export const getFeaturedProjects = (): Project[] => {
  return projects.slice(0, 4);
};

// Helper function to get next/previous project
export const getAdjacentProjects = (currentSlug: string): { prev: Project | null; next: Project | null } => {
  const currentIndex = projects.findIndex(p => p.slug === currentSlug);
  
  return {
    prev: currentIndex > 0 ? projects[currentIndex - 1] : null,
    next: currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null
  };
};

// Portfolio categories for filtering
export const portfolioCategories = [
  { id: 'all', label: 'All Work' },
  { id: 'logo-design', label: 'Logo Design' },
  { id: 'brand-identity', label: 'Brand Identity' },
  { id: 'social-media', label: 'Social Media' },
  { id: 'presentation', label: 'Presentation' }
];
