import { motion } from 'framer-motion';
import { designerInfo } from '@/data/designer';
import { getFeaturedProjects } from '@/data/projects';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SEOHead } from '@/components/seo/SEOHead';
import { Services } from '@/components/sections/Services';
import { Testimonials } from '@/components/sections/Testimonials';
import { ArrowRight, Star, ShoppingBag, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Homepage for Sunjida Akter - Graphic Designer & Sharee Entrepreneur
 * Elegant design with rose gold/burgundy theme
 */
export default function Home() {
  const featuredProjects = getFeaturedProjects();

  return (
    <>
      <SEOHead 
        title="Sunjida Akter - Graphic Designer & Sharee Entrepreneur"
        description="Transform your brand with stunning visual identities. Explore our curated collection of traditional Bangladeshi sarees. Design services & Sharee shop."
      />
      
      <div className="min-h-screen">
        {/* Hero Section - Elegant split design */}
        <section className="relative min-h-screen w-full overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/50 to-accent/30" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 -left-20 w-72 h-72 bg-rose/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-12">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
              {/* Left: Text Content */}
              <motion.div
                className="space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>{designerInfo.rating} Rating • {designerInfo.level}</span>
                </motion.div>

                {/* Main headline */}
                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <span className="block">Hello, I'm</span>
                  <span className="block text-gradient font-medium">{designerInfo.name}</span>
                </motion.h1>
                
                <motion.p
                  className="text-lg sm:text-xl md:text-2xl font-light text-muted-foreground max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {designerInfo.tagline}
                </motion.p>

                <motion.p
                  className="text-base md:text-lg font-light text-muted-foreground/80 max-w-lg mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {designerInfo.heroIntroduction}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Link
                    to="/portfolio"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover-lift font-medium"
                  >
                    <Palette className="w-5 h-5" />
                    View Portfolio
                  </Link>
                  <Link
                    to="/shop"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary/20 bg-background/50 rounded-xl hover:bg-accent transition-all font-medium"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Sharee
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right: Portrait Image */}
              <motion.div
                className="relative order-1 lg:order-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <div className="relative aspect-[3/4] sm:aspect-[4/5] max-w-md mx-auto lg:max-w-none">
                  {/* Decorative frame */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-rose/10 to-gold/20 rounded-3xl blur-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl" />
                  
                  <img
                    src={designerInfo.portraitImage}
                    alt={designerInfo.name}
                    className="relative w-full h-full object-cover rounded-2xl shadow-2xl"
                  />
                  
                  {/* Floating stats card */}
                  <motion.div
                    className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{designerInfo.stats.happyClients}+</p>
                        <p className="text-xs text-muted-foreground">Clients</p>
                      </div>
                      <div className="w-px h-10 bg-border" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{designerInfo.stats.projectsCompleted}+</p>
                        <p className="text-xs text-muted-foreground">Projects</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <ScrollIndicator />
          </motion.div>
        </section>

        {/* Services Section */}
        <Services />

        {/* Featured Work Section */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
                    Featured <span className="text-gradient font-medium">Work</span>
                  </h2>
                  <p className="text-lg text-muted-foreground font-light max-w-xl">
                    A selection of brand identity and design projects
                  </p>
                </div>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 text-base font-medium text-primary hover:text-primary/80 transition-colors group"
                >
                  View All Projects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {featuredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProjectCard
                    project={project}
                    aspectRatio="landscape"
                    showCategory={true}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sharee Promo Section */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary via-accent/30 to-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
              <ScrollReveal>
                <div className="space-y-6">
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    Sharee Collection
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
                    Traditional <span className="text-gradient font-medium">Elegance</span>
                  </h2>
                  <p className="text-lg text-muted-foreground font-light">
                    Discover our curated collection of authentic Bangladeshi sarees. From timeless Jamdani to luxurious Silk, each piece is handpicked for quality and craftsmanship.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['Jamdani', 'Silk', 'Cotton', 'Katan', 'Muslin'].map((type) => (
                      <span key={type} className="px-4 py-2 rounded-full bg-background/80 text-sm font-medium">
                        {type}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover-lift font-medium"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Explore Collection
                  </Link>
                </div>
              </ScrollReveal>
              
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={designerInfo.portraitImage2}
                    alt="Sunjida in traditional attire"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
                Let's Create Something <span className="font-medium">Beautiful</span>
              </h2>
              <p className="text-lg font-light opacity-90 max-w-2xl mx-auto">
                Ready to transform your brand or find the perfect saree? I'd love to work with you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-foreground text-primary rounded-xl hover:bg-primary-foreground/90 transition-colors font-medium"
                >
                  Start a Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={designerInfo.socialLinks.fiverr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary-foreground/30 rounded-xl hover:bg-primary-foreground/10 transition-colors font-medium"
                >
                  Hire on Fiverr
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
