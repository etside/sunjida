import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function Pricing() {
  const { t, lang } = useLanguage();

  const plans = [
    {
      nameKey: 'pricing.starter',
      price: '৳0',
      popular: false,
      features: {
        en: ['200 chat conversations / month', '60 voice minutes', '1 agent, 1 language', 'Community support'],
        bn: ['মাসে ২০০ চ্যাট কথোপকথন', '৬০ ভয়েস মিনিট', '১টি এজেন্ট, ১টি ভাষা', 'কমিউনিটি সাপোর্ট'],
      },
    },
    {
      nameKey: 'pricing.growth',
      price: '৳9,900',
      popular: true,
      features: {
        en: [
          'Unlimited chat conversations',
          '1,500 voice minutes',
          'Bangla + English agents',
          'Inventory & order access',
          'Webhooks and REST API',
        ],
        bn: [
          'আনলিমিটেড চ্যাট কথোপকথন',
          '১,৫০০ ভয়েস মিনিট',
          'বাংলা + ইংরেজি এজেন্ট',
          'ইনভেন্টরি ও অর্ডার অ্যাক্সেস',
          'ওয়েবহুক ও REST API',
        ],
      },
    },
    {
      nameKey: 'pricing.scale',
      price: t('pricing.custom'),
      popular: false,
      features: {
        en: ['Volume voice pricing', 'Dedicated numbers & SIP', 'Custom integrations', 'SLA and onboarding'],
        bn: ['ভলিউম ভয়েস প্রাইসিং', 'ডেডিকেটেড নম্বর ও SIP', 'কাস্টম ইন্টিগ্রেশন', 'এসএলএ ও অনবোর্ডিং'],
      },
    },
  ];

  return (
    <>
      <SEOHead title={t('nav.pricing')} description={t('pricing.subtitle')} />
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{t('pricing.title')}</h1>
            <p className="mt-4 text-muted-foreground">{t('pricing.subtitle')}</p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.nameKey}
                className={`relative flex flex-col rounded-3xl border p-8 ${
                  plan.popular ? 'border-primary/50 bg-card shadow-xl' : 'border-border bg-card/60'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {t('pricing.popular')}
                  </span>
                )}
                <h2 className="text-lg font-semibold">{t(plan.nameKey)}</h2>
                <p className="mt-4 text-3xl font-semibold tracking-tight">
                  {plan.price}
                  {plan.price.startsWith('৳') && plan.price !== '৳0' && (
                    <span className="text-sm font-normal text-muted-foreground">{t('pricing.month')}</span>
                  )}
                </p>
                <ul className="mt-7 space-y-3 flex-1">
                  {plan.features[lang].map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.popular ? 'default' : 'outline'}
                  className="mt-8 w-full rounded-full"
                >
                  <Link to="/auth">{t('pricing.cta')}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
