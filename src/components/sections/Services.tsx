import { motion } from 'framer-motion';
import { services } from '@/data/designer';
import { Palette, BookOpen, Layers, Share2, Presentation, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  BookOpen,
  Layers,
  Share2,
  Presentation,
  Sparkles
};

/**
 * Services section with elegant card design
 * Fully responsive grid layout
 */
export function Services() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12 md:mb-16 space-y-4">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              What I Offer
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
              My <span className="text-gradient font-medium">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Comprehensive design solutions and curated fashion to elevate your brand and style
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Palette;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group h-full p-6 sm:p-8 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover-lift">
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/80 transition-all">
                      <IconComponent className="w-7 h-7 text-primary" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-medium tracking-wide">
                      {service.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground font-light leading-relaxed text-sm sm:text-base">
                      {service.description}
                    </p>
                    
                    {/* Features */}
                    <ul className="pt-4 space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
