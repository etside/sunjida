import { motion } from 'framer-motion';
import { designerInfo } from '@/data/designer';
import { getFeaturedProjects } from '@/data/projects';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SEOHead } from '@/components/seo/SEOHead';
import { Services } from '@/components/sections/Services';
import { Testimonials } from '@/components/sections/Testimonials';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Homepage for Sunjida Akter - Graphic Designer Portfolio
 * Elegant design with hero, services, portfolio preview, and testimonials
 */
export default function Home() {
  const featuredProjects = getFeaturedProjects();

  return (
    <>
      <SEOHead 
        title="Sunjida Akter - Graphic Designer & Brand Specialist"
        description="Transform your brand with stunning visual identities, logos, and design solutions. Professional graphic designer from Bangladesh specializing in brand identity and visual design."
      />
      
      <div className="min-h-screen">
        {/* Hero Section - Full viewport with elegant design */}
        <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-6">
            <motion.div
              className="text-center space-y-8 max-w-4xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm"
              >
                <Star className="w-4 h-4 fill-current" />
                <span>{designerInfo.rating} Rating • {designerInfo.level}</span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                {designerInfo.name}
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl font-light tracking-wide text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                {designerInfo.tagline}
              </motion.p>

              <motion.p
                className="text-base md:text-lg font-light leading-relaxed text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                {designerInfo.heroIntroduction}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium tracking-wide"
                >
                  View My Work
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-border rounded-lg hover:bg-accent transition-colors font-medium tracking-wide"
                >
                  Get in Touch
                </Link>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <ScrollIndicator />
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <Services />

        {/* Featured Work Section */}
        <section className="py-24 md:py-32 px-6 lg:px-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-light tracking-wide">
                    Featured Work
                  </h2>
                  <p className="text-lg text-muted-foreground font-light max-w-xl">
                    A selection of my recent brand identity and design projects
                  </p>
                </div>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 text-base font-light tracking-wide text-foreground hover:text-muted-foreground transition-colors group"
                >
                  View All Projects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-light tracking-wide">
                Let's Create Something Amazing
              </h2>
              <p className="text-lg font-light opacity-90 max-w-2xl mx-auto">
                Ready to elevate your brand? I'd love to hear about your project and discuss how we can work together.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary-foreground text-primary rounded-lg hover:bg-primary-foreground/90 transition-colors font-medium tracking-wide"
                >
                  Start a Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="https://www.fiverr.com/sunjidagraphic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground/30 rounded-lg hover:bg-primary-foreground/10 transition-colors font-medium tracking-wide"
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
