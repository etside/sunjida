import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, User } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { designerInfo } from '@/data/designer';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Shop', path: '/shop' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

/**
 * Responsive header with elegant styling
 * Glass effect on scroll, mobile hamburger menu
 */
export function Header() {
  const location = useLocation();
  const { isScrolled } = useScrollPosition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isHomepage = location.pathname === '/';
  const showSolidBg = isScrolled || !isHomepage;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        showSolidBg
          ? 'glass border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-lg sm:text-xl font-medium tracking-wide text-foreground hover:text-primary transition-colors"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gradient"
            >
              {designerInfo.name.split(' ')[0]}
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Link
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === link.path
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                  )}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Admin Link (Desktop) */}
            <Link
              to="/auth"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
              title="Admin"
            >
              <User className="w-5 h-5 text-muted-foreground" />
            </Link>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="p-6 border-b border-border">
                      <span className="text-xl font-medium text-gradient">
                        {designerInfo.name}
                      </span>
                    </div>
                    
                    {/* Mobile Nav Links */}
                    <nav className="flex-1 p-6 space-y-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center px-4 py-3 rounded-xl text-lg font-medium transition-colors",
                            location.pathname === link.path
                              ? 'text-primary bg-primary/10'
                              : 'text-foreground hover:bg-accent'
                          )}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </nav>
                    
                    {/* Mobile Footer */}
                    <div className="p-6 border-t border-border space-y-4">
                      <Link
                        to="/auth"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent text-foreground font-medium"
                      >
                        <User className="w-5 h-5" />
                        Admin Login
                      </Link>
                      <p className="text-sm text-muted-foreground text-center">
                        {designerInfo.email}
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
