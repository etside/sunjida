import { motion } from 'framer-motion';
import { Instagram, Linkedin, Star, Clock, MapPin, Award } from 'lucide-react';
import { designerInfo } from '@/data/designer';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/seo/SEOHead';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

/**
 * About page for Sunjida Akter
 * Professional bio, skills, and stats
 */
export default function About() {
  return (
    <>
      <SEOHead
        title="About"
        description={`Learn about ${designerInfo.name}, ${designerInfo.tagline}. Professional graphic designer from Bangladesh specializing in brand identity and visual design.`}
        image={designerInfo.portraitImage}
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-24 md:py-32 px-6 lg:px-8 border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0.8, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide mb-4">
                About Me
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
                {designerInfo.tagline}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Portrait and Biography - Split Layout */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Portrait Image */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0.8, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted">
                  <img
                    src={designerInfo.portraitImage}
                    alt={designerInfo.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                
                {/* Social Links */}
                <div className="flex items-center gap-4">
                  {designerInfo.socialLinks.fiverr && (
                    <a
                      href={designerInfo.socialLinks.fiverr}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                      aria-label="Fiverr"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.092v2.466h-1.61v-3.558h-.684c-.547 0-.84.41-.84 1.092v2.466h-1.61v-4.874h1.61v.74c.264-.574.626-.74 1.163-.74h1.972v.74c.264-.574.625-.74 1.162-.74h.527v1.316zm-6.786 1.501h-3.359c.088.546.43.858 1.006.858.43 0 .732-.175.908-.526h1.445c-.264 1.004-1.16 1.638-2.353 1.638-1.479 0-2.575-1.053-2.575-2.509 0-1.443 1.096-2.497 2.575-2.497 1.467 0 2.473 1.004 2.473 2.485 0 .175-.012.351-.036.551h-.084zm-1.484-1.003c-.088-.498-.37-.79-.917-.79-.576 0-.87.305-.957.79h1.874z"/>
                      </svg>
                    </a>
                  )}
                  {designerInfo.socialLinks.instagram && (
                    <a
                      href={designerInfo.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="size-5" />
                    </a>
                  )}
                  {designerInfo.socialLinks.linkedin && (
                    <a
                      href={designerInfo.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="size-5" />
                    </a>
                  )}
                  {designerInfo.socialLinks.behance && (
                    <a
                      href={designerInfo.socialLinks.behance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                      aria-label="Behance"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 8h6a3 3 0 0 1 0 6H3V8z" />
                        <path d="M3 14h7a3 3 0 0 1 0 6H3v-6z" />
                        <path d="M14 7h7" />
                        <path d="M17 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                      </svg>
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Biography and Info */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0.8, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {/* Name and Tagline */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl md:text-5xl font-light tracking-wide">
                      {designerInfo.name}
                    </h2>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm">
                      <Star className="w-3 h-3 fill-current" />
                      {designerInfo.rating}
                    </span>
                  </div>
                  <p className="text-xl text-muted-foreground font-light tracking-wide">
                    {designerInfo.tagline}
                  </p>
                </div>

                <Separator />

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{designerInfo.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Response Time</p>
                      <p className="font-medium">{designerInfo.responseTime}</p>
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <div className="space-y-4">
                  {designerInfo.biography.split('\n\n').map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-base md:text-lg font-light leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {designerInfo.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <p className="text-4xl md:text-5xl font-light text-primary">
                    {designerInfo.stats.happyClients}+
                  </p>
                  <p className="text-muted-foreground font-light">Happy Clients</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl md:text-5xl font-light text-primary">
                    {designerInfo.stats.projectsCompleted}+
                  </p>
                  <p className="text-muted-foreground font-light">Projects Completed</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl md:text-5xl font-light text-primary">
                    {designerInfo.stats.yearsExperience}+
                  </p>
                  <p className="text-muted-foreground font-light">Years Experience</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl md:text-5xl font-light text-primary flex items-center justify-center gap-2">
                    <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                    {designerInfo.rating}
                  </p>
                  <p className="text-muted-foreground font-light">Fiverr Rating</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Approach Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center space-y-8">
                <h2 className="text-3xl md:text-4xl font-light tracking-wide">
                  My Approach
                </h2>
                <div className="space-y-4 text-lg font-light leading-relaxed text-muted-foreground">
                  {designerInfo.approach.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
