import { motion } from 'framer-motion';
import { testimonials } from '@/data/designer';
import { Star, Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

/**
 * Testimonials section with client reviews
 * Elegant card carousel layout
 */
export function Testimonials() {
  return (
    <section className="py-24 md:py-32 px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-light tracking-wide">
              Client Reviews
            </h2>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              What my clients say about working together
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-8 bg-card rounded-lg border border-border hover:border-primary/20 transition-all duration-300 relative">
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
                
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-muted-foreground font-light leading-relaxed italic">
                    "{testimonial.review}"
                  </p>
                  
                  {/* Client Info */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          @{testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-lg">{getFlagEmoji(testimonial.countryCode)}</span>
                          {testimonial.country}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                        {testimonial.projectType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fiverr CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.fiverr.com/sunjidagraphic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DBF73] text-white rounded-lg hover:bg-[#1aa864] transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.092v2.466h-1.61v-3.558h-.684c-.547 0-.84.41-.84 1.092v2.466h-1.61v-4.874h1.61v.74c.264-.574.626-.74 1.163-.74h1.972v.74c.264-.574.625-.74 1.162-.74h.527v1.316zm-6.786 1.501h-3.359c.088.546.43.858 1.006.858.43 0 .732-.175.908-.526h1.445c-.264 1.004-1.16 1.638-2.353 1.638-1.479 0-2.575-1.053-2.575-2.509 0-1.443 1.096-2.497 2.575-2.497 1.467 0 2.473 1.004 2.473 2.485 0 .175-.012.351-.036.551h-.084zm-1.484-1.003c-.088-.498-.37-.79-.917-.79-.576 0-.87.305-.957.79h1.874zM8.06 15.44h-1.6v-4.874h1.6v4.874zm-.8-5.494a.925.925 0 0 1-.928-.925c0-.512.416-.928.928-.928s.928.416.928.928-.416.925-.928.925zM4.93 15.44H2.55v-1.316h.928v-2.255H2.55v-1.303h2.38v3.558h.928v1.316h-.928zm-3.43-3.13v3.13H0v-4.874h1.61v.74c.263-.574.625-.74 1.162-.74h.527v1.316h-.85c-.547 0-.84.41-.84 1.092v.336h-.11z"/>
            </svg>
            View More Reviews on Fiverr
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
