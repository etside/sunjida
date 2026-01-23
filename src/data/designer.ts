/**
 * Designer information for Sunjida Akter's portfolio
 */

import sunjidaPortrait1 from '@/assets/sunjida-portrait-1.jpg';
import sunjidaPortrait2 from '@/assets/sunjida-portrait-2.jpg';
import sunjidaPortrait3 from '@/assets/sunjida-portrait-3.jpg';
import sunjidaPortrait4 from '@/assets/sunjida-portrait-4.jpg';

export interface DesignerInfo {
  name: string;
  tagline: string;
  heroIntroduction: string;
  biography: string;
  approach: string;
  skills: string[];
  services: string[];
  location: string;
  email: string;
  responseTime: string;
  availability: string;
  rating: number;
  reviewCount: number;
  level: string;
  socialLinks: {
    fiverr?: string;
    instagram?: string;
    linkedin?: string;
    behance?: string;
    facebook?: string;
  };
  portraitImage: string;
  portraitImage2: string;
  portraitImage3: string;
  portraitImage4: string;
  stats: {
    happyClients: number;
    projectsCompleted: number;
    yearsExperience: number;
  };
}

export const designerInfo: DesignerInfo = {
  name: 'Sunjida Akter',
  tagline: 'Graphic Designer & Sharee Entrepreneur',
  heroIntroduction: 'Crafting stunning visual identities and curating the finest traditional Bangladeshi sarees.',
  biography: `I'm Sunjida Akter, a passionate graphic designer and entrepreneur from Bangladesh. I specialize in creating impactful brand identities, logos, and visual designs that help businesses stand out. Beyond design, I run a curated Sharee collection, bringing the timeless elegance of traditional Bangladeshi sarees to modern fashion enthusiasts.

With a 4.6-star rating on Fiverr and a growing community of satisfied clients worldwide, I'm dedicated to delivering exceptional quality in everything I do. Whether it's designing your brand or helping you find the perfect saree, my goal is to exceed your expectations.`,
  approach: `My design philosophy centers on understanding your unique story and translating it into visuals that resonate. I believe great design is both beautiful and functional—it should capture attention while communicating your message clearly.

For my Sharee business, I personally curate each piece, ensuring quality craftsmanship and authentic Bangladeshi heritage. Every saree tells a story of tradition meeting contemporary style.`,
  skills: [
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Logo Design',
    'Brand Identity',
    'Visual Design',
    'Typography',
    'Social Media Design',
    'Fashion Curation'
  ],
  services: [
    'Logo Design',
    'Brand Style Guides',
    'Visual Identity',
    'Social Media Kits',
    'Presentation Design',
    'Sharee Collection'
  ],
  location: 'Bangladesh',
  email: 'sunjida8986@gmail.com',
  responseTime: '1 hour',
  availability: 'Available for new projects!',
  rating: 4.6,
  reviewCount: 50,
  level: 'Level 1 Seller',
  socialLinks: {
    fiverr: 'https://www.fiverr.com/sunjidagraphic',
    instagram: 'https://instagram.com/sunjidagraphic',
    facebook: 'https://facebook.com/sunjidaakter',
  },
  portraitImage: sunjidaPortrait3,
  portraitImage2: sunjidaPortrait4,
  portraitImage3: sunjidaPortrait1,
  portraitImage4: sunjidaPortrait2,
  stats: {
    happyClients: 50,
    projectsCompleted: 75,
    yearsExperience: 3
  }
};

export interface Testimonial {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  rating: number;
  review: string;
  projectType: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'etemnac',
    country: 'Netherlands',
    countryCode: 'NL',
    rating: 5,
    review: 'Working with Sunjida Akter was an absolute pleasure! Her work not only exceeded expectations but showed incredible attention to detail and creativity. Highly recommend!',
    projectType: 'Brand Identity'
  },
  {
    id: '2',
    name: 'hda1205',
    country: 'United States',
    countryCode: 'US',
    rating: 5,
    review: 'Exemplary work with attention to detail. The brand style guide was comprehensive and professional. Will definitely work with again!',
    projectType: 'Brand Style Guide'
  },
  {
    id: '3',
    name: 'alshawi90',
    country: 'United States',
    countryCode: 'US',
    rating: 5,
    review: 'She went above and beyond and deliver excellent quality with budget friendly and on time. Communication was great throughout the project.',
    projectType: 'Logo Design'
  },
  {
    id: '4',
    name: 'creative_minds',
    country: 'United Kingdom',
    countryCode: 'GB',
    rating: 5,
    review: 'Outstanding creativity and professionalism. The social media kit perfectly captured our brand essence. Fast turnaround and excellent communication.',
    projectType: 'Social Media Kit'
  },
  {
    id: '5',
    name: 'startup_guru',
    country: 'Canada',
    countryCode: 'CA',
    rating: 5,
    review: 'Sunjida delivered a stunning visual identity for our startup. Her understanding of brand psychology is impressive. Exceeded all expectations!',
    projectType: 'Visual Identity'
  }
];

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export const services: Service[] = [
  {
    id: '1',
    title: 'Logo Design',
    description: 'Custom, memorable logos that capture your brand essence and stand out in the market.',
    icon: 'Palette',
    features: ['Multiple concepts', 'Unlimited revisions', 'All file formats', 'Brand variations']
  },
  {
    id: '2',
    title: 'Brand Style Guides',
    description: 'Comprehensive brand guidelines ensuring consistency across all touchpoints.',
    icon: 'BookOpen',
    features: ['Color palette', 'Typography system', 'Logo usage rules', 'Brand voice']
  },
  {
    id: '3',
    title: 'Visual Identity',
    description: 'Complete visual systems that tell your brand story cohesively.',
    icon: 'Layers',
    features: ['Logo design', 'Business cards', 'Letterheads', 'Brand collateral']
  },
  {
    id: '4',
    title: 'Social Media Kits',
    description: 'Engaging social media templates and graphics for consistent online presence.',
    icon: 'Share2',
    features: ['Post templates', 'Story designs', 'Profile graphics', 'Highlight covers']
  },
  {
    id: '5',
    title: 'Presentation Design',
    description: 'Professional presentations and pitch decks that impress and convert.',
    icon: 'Presentation',
    features: ['Custom layouts', 'Infographics', 'Data visualization', 'Animations']
  },
  {
    id: '6',
    title: 'Sharee Collection',
    description: 'Curated traditional Bangladeshi sarees for the modern fashion enthusiast.',
    icon: 'Sparkles',
    features: ['Handpicked pieces', 'Quality assured', 'Authentic craftsmanship', 'Doorstep delivery']
  }
];
