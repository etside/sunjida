/**
 * Core TypeScript interfaces for Sunjida Akter Portfolio
 * Updated for graphic design portfolio
 */

export type ProjectCategory = 'logo-design' | 'brand-identity' | 'social-media' | 'presentation';

export type AspectRatio = 'portrait' | 'landscape' | 'square';

export interface ProjectImage {
  id: string;
  src: string;
  alt: string;
  aspectRatio: AspectRatio;
  caption?: string;
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory | string;
  year: string;
  coverImage: string;
  images: ProjectImage[];
  description: string;
  client?: string;
  location?: string;
  slug: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  projectType: 'logo-design' | 'brand-identity' | 'social-media' | 'other';
  message: string;
  timestamp: Date;
}
