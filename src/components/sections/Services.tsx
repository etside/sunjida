import { motion } from 'framer-motion';
import { services } from '@/data/designer';
import { Palette, BookOpen, Layers, Share2, Presentation, FileText } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  BookOpen,
  Layers,
  Share2,
  Presentation,
  FileText
};

/**
 * Services section showcasing Sunjida's design offerings
 * Elegant card layout with hover animations
 */
export function Services() {
  return (
    <section className="py-24 md:py-32 px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-light tracking-wide">
              Services
            </h2>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Comprehensive design solutions tailored to elevate your brand
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                <div className="group h-full p-8 bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-medium tracking-wide">
                      {service.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground font-light leading-relaxed">
                      {service.description}
                    </p>
                    
                    {/* Features */}
                    <ul className="pt-4 space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
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
