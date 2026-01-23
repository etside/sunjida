import { useState } from 'react';
import { projects, portfolioCategories } from '@/data/projects';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

/**
 * Portfolio page with category filtering
 * Elegant grid layout with responsive design
 */
export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <>
      <SEOHead 
        title="Portfolio"
        description="Browse my complete design portfolio featuring logo design, brand identity, social media kits, and visual design projects."
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/50 to-background">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                My Work
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mt-4">
                <span className="text-gradient font-medium">Portfolio</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light mt-4 max-w-2xl mx-auto">
                A curated collection of brand identity and visual design projects
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 border-b border-border sticky top-16 md:top-20 bg-background/95 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
              <Filter className="w-4 h-4 text-muted-foreground mr-1 flex-shrink-0" />
              {portfolioCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <PortfolioGrid projects={filteredProjects} />
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-16 md:h-24" />
      </div>
    </>
  );
}
