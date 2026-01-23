import { useState } from 'react';
import { projects, portfolioCategories } from '@/data/projects';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';

/**
 * Portfolio page with category filtering
 * Displays Sunjida's design projects
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
        <section className="relative py-24 md:py-32 px-6 lg:px-8 border-b border-border">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide mb-4">
                Portfolio
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto">
                A curated collection of brand identity and visual design projects
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-8 px-6 lg:px-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {portfolioCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-light tracking-wide transition-all ${
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
        <section className="py-12 md:py-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <PortfolioGrid projects={filteredProjects} />
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>
    </>
  );
}
