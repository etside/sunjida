import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';

const snippet = `curl -X POST https://api.salesdaddy.ai/v1/agents \\
  -H "Authorization: Bearer $SALESDADDY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Support Agent",
    "type": "voice",
    "languages": ["bn", "en"],
    "tools": ["inventory.lookup", "orders.create"],
    "webhook_url": "https://yourdomain.com/hooks/salesdaddy"
  }'`;

const eventList = [
  'call.completed',
  'chat.message.created',
  'order.created',
  'inventory.low_stock',
  'inventory.updated',
  'handoff.requested',
];

export default function Docs() {
  const { t, lang } = useLanguage();

  return (
    <>
      <SEOHead title={t('nav.docs')} description="SalesDaddy API, webhooks and agent documentation." />
      <section className="relative pt-28 pb-20 md:pt-36">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{t('nav.docs')}</h1>
          <p className="mt-4 text-muted-foreground">
            {lang === 'bn'
              ? 'একটি এপিআই কী দিয়ে এজেন্ট তৈরি করুন, ইনভেন্টরি যুক্ত করুন এবং ওয়েবহুক গ্রহণ করুন।'
              : 'Create agents, connect inventory and receive webhooks with a single API key.'}
          </p>

          <h2 className="mt-14 text-xl font-semibold">
            {lang === 'bn' ? 'এজেন্ট তৈরি করুন' : 'Create an agent'}
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
            <code>{snippet}</code>
          </pre>

          <h2 className="mt-12 text-xl font-semibold">
            {lang === 'bn' ? 'ওয়েবহুক ইভেন্ট' : 'Webhook events'}
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {eventList.map((e) => (
              <li
                key={e}
                className="rounded-xl border border-border bg-card px-4 py-3 font-mono text-xs text-muted-foreground"
              >
                {e}
              </li>
            ))}
          </ul>

          <p className="mt-12 text-sm text-muted-foreground">
            {lang === 'bn'
              ? 'বিস্তারিত রেফারেন্স শীঘ্রই আসছে। প্রাথমিক অ্যাক্সেসের জন্য আমাদের সাথে যোগাযোগ করুন।'
              : 'Full reference is coming soon. Contact us for early access.'}
          </p>
        </div>
      </section>
    </>
  );
}
