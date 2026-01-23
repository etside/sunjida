import { motion } from 'framer-motion';
import { Instagram, Facebook, Star, Clock, MapPin, Award, Sparkles } from 'lucide-react';
import { designerInfo } from '@/data/designer';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/seo/SEOHead';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Link } from 'react-router-dom';

/**
 * About page with professional bio, skills, and stats
 * Elegant rose gold theme with responsive design
 */
export default function About() {
  return (
    <>
      <SEOHead
        title="About"
        description={`Learn about ${designerInfo.name}, ${designerInfo.tagline}. Professional graphic designer and Sharee entrepreneur from Bangladesh.`}
        image={designerInfo.portraitImage}
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/50 to-background">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Get to Know Me
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mt-4">
                About <span className="text-gradient font-medium">Me</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light mt-4 max-w-2xl mx-auto">
                {designerInfo.tagline}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Portrait and Biography */}
        <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
              {/* Portrait Images */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-rose/10 to-gold/20 rounded-3xl blur-xl" />
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={designerInfo.portraitImage}
                      alt={designerInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="flex items-center justify-center gap-3">
                  {designerInfo.socialLinks.fiverr && (
                    <a
                      href={designerInfo.socialLinks.fiverr}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#1DBF73] hover:border-[#1DBF73] transition-colors"
                      aria-label="Fiverr"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.092v2.466h-1.61v-3.558h-.684c-.547 0-.84.41-.84 1.092v2.466h-1.61v-4.874h1.61v.74c.264-.574.626-.74 1.163-.74h1.972v.74c.264-.574.625-.74 1.162-.74h.527v1.316z"/>
                      </svg>
                    </a>
                  )}
                  {designerInfo.socialLinks.instagram && (
                    <a
                      href={designerInfo.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {designerInfo.socialLinks.facebook && (
                    <a
                      href={designerInfo.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Biography and Info */}
              <motion.div
                className="space-y-6 md:space-y-8"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Name and Rating */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl sm:text-4xl font-light tracking-tight">
                      {designerInfo.name}
                    </h2>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 text-gold text-sm font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      {designerInfo.rating}
                    </span>
                  </div>
                  <p className="text-lg text-muted-foreground font-light">
                    {designerInfo.tagline}
                  </p>
                </div>

                <Separator />

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium text-sm">{designerInfo.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Response</p>
                      <p className="font-medium text-sm">{designerInfo.responseTime}</p>
                    </div>
                  </div>
                </div>

                {/* Biography */}
                <div className="space-y-4">
                  {designerInfo.biography.split('\n\n').map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-muted-foreground font-light leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {designerInfo.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-light"
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
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary via-accent/30 to-secondary">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
                <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-light text-primary">
                    {designerInfo.stats.happyClients}+
                  </p>
                  <p className="text-muted-foreground font-light mt-2 text-sm">Happy Clients</p>
                </div>
                <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-light text-primary">
                    {designerInfo.stats.projectsCompleted}+
                  </p>
                  <p className="text-muted-foreground font-light mt-2 text-sm">Projects Done</p>
                </div>
                <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-light text-primary">
                    {designerInfo.stats.yearsExperience}+
                  </p>
                  <p className="text-muted-foreground font-light mt-2 text-sm">Years Experience</p>
                </div>
                <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-gold text-gold" />
                    <p className="text-3xl sm:text-4xl md:text-5xl font-light text-primary">
                      {designerInfo.rating}
                    </p>
                  </div>
                  <p className="text-muted-foreground font-light mt-2 text-sm">Fiverr Rating</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Approach Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center space-y-8">
                <Award className="w-12 h-12 text-primary mx-auto" />
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight">
                  My <span className="text-gradient font-medium">Approach</span>
                </h2>
                <div className="space-y-4 text-lg font-light leading-relaxed text-muted-foreground">
                  {designerInfo.approach.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover-lift font-medium"
                >
                  Let's Work Together
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
