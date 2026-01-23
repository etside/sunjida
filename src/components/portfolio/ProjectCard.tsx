import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  showCategory?: boolean;
  index?: number;
}

/**
 * Elegant project card with hover effects
 * Rose gold theme with responsive design
 */
export function ProjectCard({ 
  project, 
  aspectRatio, 
  showCategory = true,
  index = 0 
}: ProjectCardProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const ratio = aspectRatio || 'landscape';
  
  const aspectRatioClasses = {
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    square: 'aspect-square'
  };

  return (
    <Link
      to={`/project/${project.slug}`}
      className="group block relative overflow-hidden rounded-2xl hover-lift"
    >
      {/* Image Container */}
      <div className={cn('relative overflow-hidden bg-muted rounded-2xl', aspectRatioClasses[ratio])}>
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        <img
          src={project.coverImage}
          alt={project.title}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-all duration-700',
            isLoaded ? 'opacity-100' : 'opacity-0',
            'group-hover:scale-105'
          )}
          loading={index < 6 ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 space-y-2">
            <h3 className="text-white text-lg sm:text-xl md:text-2xl font-medium tracking-wide">
              {project.title}
            </h3>
            {showCategory && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 font-light">
                <span className="capitalize">{project.category.replace('-', ' ')}</span>
                <span>•</span>
                <span>{project.year}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
