import { Instagram, Linkedin } from 'lucide-react';
import { designerInfo } from '@/data/designer';

/**
 * Minimal footer component with social links and copyright
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground font-light tracking-wide">
            © {currentYear} {designerInfo.name}. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {designerInfo.socialLinks.fiverr && (
              <a
                href={designerInfo.socialLinks.fiverr}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fiverr"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.004 15.588a.995.995 0 1 0 .002-1.99.995.995 0 0 0-.002 1.99zm-.996-3.705h-.85c-.546 0-.84.41-.84 1.092v2.466h-1.61v-3.558h-.684c-.547 0-.84.41-.84 1.092v2.466h-1.61v-4.874h1.61v.74c.264-.574.626-.74 1.163-.74h1.972v.74c.264-.574.625-.74 1.162-.74h.527v1.316z"/>
                </svg>
              </a>
            )}
            {designerInfo.socialLinks.instagram && (
              <a
                href={designerInfo.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
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
                className="text-muted-foreground hover:text-foreground transition-colors"
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
                className="text-muted-foreground hover:text-foreground transition-colors"
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
        </div>
      </div>
    </footer>
  );
}
