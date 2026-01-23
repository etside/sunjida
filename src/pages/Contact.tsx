import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { designerInfo } from '@/data/designer';
import { ContactForm } from '@/components/forms/ContactForm';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/seo/SEOHead';

/**
 * Contact page with form and contact information
 * Features validated contact form and availability status
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
        <section className="py-24 md:py-32 px-6 lg:px-8 border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0.8, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide mb-4">
                Get in Touch
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
                Let's discuss your next project
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Form */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0.8, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-light tracking-wide">
                    Send a Message
                  </h2>
                  <p className="text-muted-foreground font-light">
                    Fill out the form below and I'll get back to you within {designerInfo.responseTime}. {designerInfo.availability}
                  </p>
                </div>

                <ContactForm />
              </motion.div>

              {/* Contact Information */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0.8, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-light tracking-wide">
                    Contact Information
                  </h2>
                  <p className="text-muted-foreground font-light">
                    Prefer to reach out directly? Here's how you can contact me.
                  </p>
                </div>

                <Separator />

                {/* Contact Details */}
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent">
                      <Mail className="size-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        Email
                      </p>
                      <a
                        href={`mailto:${designerInfo.email}`}
                        className="text-base md:text-lg font-light hover:text-muted-foreground transition-colors"
                      >
                        {designerInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent">
                      <Clock className="size-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        Response Time
                      </p>
                      <p className="text-base md:text-lg font-light">
                        Within {designerInfo.responseTime}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent">
                      <MapPin className="size-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        Location
                      </p>
                      <p className="text-base md:text-lg font-light">
                        {designerInfo.location}
                      </p>
                    </div>
                  </div>

                  {/* Fiverr */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#1DBF73]/10">
                      <svg className="size-5 text-[#1DBF73]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.092v2.466h-1.61v-3.558h-.684c-.547 0-.84.41-.84 1.092v2.466h-1.61v-4.874h1.61v.74c.264-.574.626-.74 1.163-.74h1.972v.74c.264-.574.625-.74 1.162-.74h.527v1.316z"/>
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-light tracking-wide text-muted-foreground">
                        Hire on Fiverr
                      </p>
                      <a
                        href={designerInfo.socialLinks.fiverr}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-base md:text-lg font-light text-[#1DBF73] hover:text-[#1aa864] transition-colors"
                      >
                        View Profile
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>
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
