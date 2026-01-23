import { Instagram, Facebook, ExternalLink } from 'lucide-react';
import { designerInfo } from '@/data/designer';
import { Link } from 'react-router-dom';

/**
 * Elegant footer with social links, navigation, and copyright
 * Fully responsive design
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-medium text-gradient">
              {designerInfo.name}
            </Link>
            <p className="text-muted-foreground font-light text-sm max-w-xs">
              {designerInfo.tagline}. Creating visual identities and curating traditional elegance.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {designerInfo.socialLinks.fiverr && (
                <a
                  href={designerInfo.socialLinks.fiverr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  aria-label="Fiverr"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.092v2.466h-1.61v-3.558h-.684c-.547 0-.84.41-.84 1.092v2.466h-1.61v-4.874h1.61v.74c.264-.574.626-.74 1.163-.74h1.972v.74c.264-.574.625-.74 1.162-.74h.527v1.316z"/>
                  </svg>
                </a>
              )}
              {designerInfo.socialLinks.instagram && (
                <a
                  href={designerInfo.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {designerInfo.socialLinks.facebook && (
                <a
                  href={designerInfo.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-light"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Get in Touch</h4>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground font-light">
                <span className="text-foreground">Email:</span>{' '}
                <a href={`mailto:${designerInfo.email}`} className="hover:text-primary transition-colors">
                  {designerInfo.email}
                </a>
              </p>
              <p className="text-muted-foreground font-light">
                <span className="text-foreground">Location:</span> {designerInfo.location}
              </p>
              <p className="text-muted-foreground font-light">
                <span className="text-foreground">Response:</span> Within {designerInfo.responseTime}
              </p>
            </div>
            <a
              href={designerInfo.socialLinks.fiverr}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1DBF73] hover:underline"
            >
              Hire on Fiverr
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-light text-center sm:text-left">
            © {currentYear} {designerInfo.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Design & Sharee Business
          </p>
        </div>
      </div>
    </footer>
  );
}
