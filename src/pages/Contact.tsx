import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, ExternalLink, MessageCircle } from 'lucide-react';
import { designerInfo } from '@/data/designer';
import { ContactForm } from '@/components/forms/ContactForm';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/seo/SEOHead';

/**
 * Contact page with elegant form and contact information
 * Fully responsive design with rose gold theme
 */
export default function Contact() {
  return (
    <>
      <SEOHead
        title="Contact"
        description={`Get in touch with ${designerInfo.name} for design inquiries, collaborations, and project bookings. ${designerInfo.availability}`}
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
                Let's Connect
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mt-4">
                Get in <span className="text-gradient font-medium">Touch</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light mt-4 max-w-2xl mx-auto">
                Ready to start a project or just want to say hello? I'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
              {/* Contact Form */}
              <motion.div
                className="space-y-6 order-2 md:order-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-light tracking-tight flex items-center gap-3">
                    <MessageCircle className="w-7 h-7 text-primary" />
                    Send a Message
                  </h2>
                  <p className="text-muted-foreground font-light">
                    Fill out the form below and I'll get back to you within {designerInfo.responseTime}.
                  </p>
                </div>

                <div className="p-6 sm:p-8 bg-card rounded-2xl border border-border">
                  <ContactForm />
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                className="space-y-8 order-1 md:order-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-light tracking-tight">
                    Contact <span className="text-gradient font-medium">Info</span>
                  </h2>
                  <p className="text-muted-foreground font-light">
                    Prefer to reach out directly? Here's how you can contact me.
                  </p>
                </div>

                <div className="p-6 sm:p-8 bg-secondary/30 rounded-2xl space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <a
                        href={`mailto:${designerInfo.email}`}
                        className="text-base md:text-lg font-light hover:text-primary transition-colors break-all"
                      >
                        {designerInfo.email}
                      </a>
                    </div>
                  </div>

                  <Separator />

                  {/* Response Time */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Response Time
                      </p>
                      <p className="text-base md:text-lg font-light">
                        Within {designerInfo.responseTime}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Location
                      </p>
                      <p className="text-base md:text-lg font-light">
                        {designerInfo.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fiverr CTA */}
                <div className="p-6 sm:p-8 bg-[#1DBF73]/10 rounded-2xl border border-[#1DBF73]/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1DBF73]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#1DBF73]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.092v2.466h-1.61v-3.558h-.684c-.547 0-.84.41-.84 1.092v2.466h-1.61v-4.874h1.61v.74c.264-.574.626-.74 1.163-.74h1.972v.74c.264-.574.625-.74 1.162-.74h.527v1.316z"/>
                      </svg>
                    </div>
                    <div className="space-y-2 flex-1">
                      <p className="font-medium text-foreground">
                        Hire on Fiverr
                      </p>
                      <p className="text-sm text-muted-foreground font-light">
                        View my services and order directly with secure payment.
                      </p>
                      <a
                        href={designerInfo.socialLinks.fiverr}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#1DBF73] font-medium hover:underline"
                      >
                        View Profile
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Availability Badge */}
                <div className="text-center p-4 bg-primary/10 rounded-xl">
                  <p className="text-sm font-medium text-primary">
                    ✨ {designerInfo.availability}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bottom spacing */}
        <div className="h-16" />
      </div>
    </>
  );
}
