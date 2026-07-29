import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';
import { getSolution, solutions } from '@/data/solutions';

export default function SolutionPage() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const solution = getSolution(slug);

  if (!solution) return <Navigate to="/" replace />;

  const Icon = solution.icon;
  const others = solutions.filter((s) => s.slug !== solution.slug);

  return (
    <>
      <SEOHead title={t(solution.titleKey)} description={t(solution.descKey)} />

      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-[520px] rounded-full bg-primary/20 blur-[130px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> {t('page.back')}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 max-w-3xl"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-6" />
            </span>
            <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">{t(solution.titleKey)}</h1>
            <p className="mt-5 text-lg text-muted-foreground">{t(solution.descKey)}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/auth">{t('hero.cta')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <Link to="/contact">{t('hero.cta2')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t('page.capabilities')}</h2>
            <ul className="mt-6 space-y-4">
              {solution.bullets[lang].map((b) => (
                <li key={b} className="flex gap-3 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t('page.usecases')}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {solution.useCases[lang].map((u) => (
                <div key={u} className="rounded-2xl border border-border bg-card p-5 text-sm font-medium">
                  {u}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">{t('solutions.title')}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((s) => (
              <Link
                key={s.slug}
                to={`/solutions/${s.slug}`}
                className="group rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary/40"
              >
                <s.icon className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold">{t(s.titleKey)}</h3>
                <span className="mt-4 inline-flex items-center text-sm text-primary">
                  {t('solutions.explore')}
                  <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
