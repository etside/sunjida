import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '@/types';
import { ProjectCard } from './ProjectCard';

interface PortfolioGridProps {
  projects: Project[];
}

/**
 * Responsive portfolio grid with smooth animations
 * 3 columns on desktop, 2 on tablet, 1 on mobile
 */
export function PortfolioGrid({ projects }: PortfolioGridProps) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
    >
      <AnimatePresence mode="popLayout">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.05,
              layout: { duration: 0.4 }
            }}
          >
            <ProjectCard
              project={project}
              aspectRatio="landscape"
              showCategory={true}
              index={index}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
