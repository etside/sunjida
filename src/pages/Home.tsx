import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap, Languages, Boxes, Users, Radio, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';
import { solutions } from '@/data/solutions';

const featureIcons = [Languages, Zap, Boxes, Users, Radio, ShieldCheck];

export default function Home() {
  const { t, lang } = useLanguage();

  const steps = [1, 2, 3];

  return (
    <>
      <SEOHead
        title="SalesDaddy — Bangla & English AI Voice and Chat Agents"
        description="AI voice agents for order calls and COD verification. Chat agents for Messenger, WhatsApp and website. Live inventory sync and webhooks. Built for Bangladeshi commerce."
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <span className="text-sm leading-none">🇧🇩</span>
            {t('hero.badge')}
            <span className="text-sm leading-none">🇬🇧</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-7 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08]"
          >
            {t('hero.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="rounded-full px-7 w-full sm:w-auto">
              <Link to="/auth">
                {t('hero.cta')} <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7 w-full sm:w-auto">
              <Link to="/contact">{t('hero.cta2')}</Link>
            </Button>
          </motion.div>

          <p className="mt-5 text-xs text-muted-foreground">{t('hero.note')}</p>

          {/* Waveform visual */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-16 rounded-3xl border border-border bg-card/60 p-6 sm:p-10 backdrop-blur"
          >
            <div className="flex items-end justify-center gap-1.5 h-28">
              {Array.from({ length: 48 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 rounded-full bg-primary/70"
                  animate={{ height: [8, 18 + ((i * 37) % 80), 8] }}
                  transition={{
                    duration: 1.6 + (i % 5) * 0.18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: (i % 12) * 0.07,
                  }}
                />
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              {lang === 'bn'
                ? '“আপা, নীল শাড়িটা কি স্টকে আছে?” — এজেন্ট স্টক দেখে উত্তর দেয়, তারপর অর্ডার নেয়।'
                : '“Is the blue saree still in stock?” — the agent checks inventory, answers, and takes the order.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('solutions.title')}</h2>
            <p className="mt-3 text-muted-foreground">{t('solutions.subtitle')}</p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {solutions.map((s, i) => (
              <motion.div
                key={s.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link
                  to={`/solutions/${s.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-card p-7 transition-all hover:border-primary/40 hover:shadow-xl"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{t(s.titleKey)}</h3>
                  <p className="mt-2.5 text-sm text-muted-foreground flex-1">{t(s.descKey)}</p>
                  <span className="mt-6 inline-flex items-center text-sm font-medium text-primary">
                    {t('solutions.explore')}
                    <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-xl">{t('features.title')}</h2>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featureIcons.map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
              >
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold">{t(`features.${i + 1}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`features.${i + 1}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('how.title')}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((n, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-3xl border border-border bg-card p-7"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-primary/40 text-sm font-semibold text-primary">
                  {n}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{t(`how.${n}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`how.${n}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-10 md:p-16 text-center">
            <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-72 w-[560px] rounded-full bg-primary/20 blur-[120px]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('cta.title')}</h2>
              <p className="mt-4 text-muted-foreground">{t('cta.subtitle')}</p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <Button asChild size="lg" className="rounded-full px-7">
                  <Link to="/auth">{t('cta.button')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                  <Link to="/pricing">{t('nav.pricing')}</Link>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {[t('features.1.title'), t('features.3.title'), t('features.6.title')].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
