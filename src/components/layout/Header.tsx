import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useLanguage } from '@/i18n/LanguageProvider';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from '@/components/brand/Logo';
import { solutions } from '@/data/solutions';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const { isScrolled } = useScrollPosition();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const links = [
    { key: 'nav.pricing', path: '/pricing' },
    { key: 'nav.docs', path: '/docs' },
    { key: 'nav.contact', path: '/contact' },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isScrolled ? 'glass border-b border-border' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg transition-colors">
                {t('nav.solutions')}
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="w-80 rounded-2xl border border-border bg-popover p-2 shadow-xl">
                  {solutions.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/solutions/${s.slug}`}
                      className="flex items-start gap-3 rounded-xl p-3 hover:bg-accent transition-colors"
                    >
                      <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <s.icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-foreground">{t(s.titleKey)}</span>
                        <span className="block text-xs text-muted-foreground line-clamp-2">{t(s.descKey)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  location.pathname === l.path
                    ? 'text-foreground'
                    : 'text-foreground/70 hover:text-foreground'
                )}
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">{t('nav.signin')}</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex rounded-full px-5">
              <Link to="/auth">{t('nav.start')}</Link>
            </Button>

            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-border">
                      <Logo />
                    </div>
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                      <p className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">
                        {t('nav.solutions')}
                      </p>
                      {solutions.map((s) => (
                        <Link
                          key={s.slug}
                          to={`/solutions/${s.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium hover:bg-accent transition-colors"
                        >
                          <s.icon className="size-4 text-primary" />
                          {t(s.titleKey)}
                        </Link>
                      ))}
                      <div className="h-px bg-border my-3" />
                      {links.map((l) => (
                        <Link
                          key={l.path}
                          to={l.path}
                          onClick={() => setOpen(false)}
                          className="block px-3 py-3 rounded-xl text-base font-medium hover:bg-accent transition-colors"
                        >
                          {t(l.key)}
                        </Link>
                      ))}
                    </nav>
                    <div className="p-4 border-t border-border space-y-2">
                      <Button asChild variant="outline" className="w-full rounded-full">
                        <Link to="/auth" onClick={() => setOpen(false)}>{t('nav.signin')}</Link>
                      </Button>
                      <Button asChild className="w-full rounded-full">
                        <Link to="/auth" onClick={() => setOpen(false)}>{t('nav.start')}</Link>
                      </Button>
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
