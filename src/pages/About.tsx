import { Link } from 'react-router-dom';
import { Bot, Globe2, ShieldCheck, Package, Workflow, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function About() {
  const { lang } = useLanguage();
  const bn = lang === 'bn';

  const copy = {
    title: bn ? 'SalesDaddy সম্পর্কে' : 'About SalesDaddy',
    subtitle: bn
      ? 'বাংলাদেশি ব্যবসার জন্য দ্বিভাষিক এআই সেলস এজেন্ট — মেসেঞ্জার, হোয়াটসঅ্যাপ, ইনস্টাগ্রাম ও আপনার ওয়েবসাইটে।'
      : 'Bilingual AI sales agents for commerce teams — on Messenger, WhatsApp, Instagram and your own website.',
    missionTitle: bn ? 'আমাদের লক্ষ্য' : 'Our mission',
    mission: bn
      ? 'প্রতিটি ব্যবসা যেন ২৪/৭ বাংলা ও ইংরেজিতে গ্রাহকের প্রশ্নের উত্তর দিতে পারে, লিড ধরে রাখতে পারে এবং কথোপকথন থেকেই অর্ডার নিতে পারে — কোনো ডেভেলপার ছাড়াই।'
      : 'Let every business answer customers 24/7 in Bangla and English, capture the lead, and close the order right inside the conversation — with no developer work.',
    valuesTitle: bn ? 'যেভাবে কাজ করে' : 'What we build',
    ctaTitle: bn ? 'আজই আপনার এজেন্ট চালু করুন' : 'Launch your agent today',
    ctaBody: bn
      ? 'একটি ওয়ার্কস্পেস তৈরি করুন, চ্যানেল যুক্ত করুন এবং কয়েক মিনিটেই লাইভ যান।'
      : 'Create a workspace, connect your channels, and go live in minutes.',
    getStarted: bn ? 'শুরু করুন' : 'Get started',
    pricing: bn ? 'প্রাইসিং দেখুন' : 'See pricing',
  };

  const values = [
    {
      icon: Globe2,
      title: bn ? 'সত্যিকারের দ্বিভাষিক' : 'Truly bilingual',
      body: bn
        ? 'বাংলা, ইংরেজি ও বাংলিশ — গ্রাহক যেভাবে লেখেন, এজেন্ট সেভাবেই উত্তর দেয়।'
        : 'Bangla, English and Banglish — the agent replies the way your customer writes.',
    },
    {
      icon: Bot,
      title: bn ? 'ভয়েস ও চ্যাট এজেন্ট' : 'Voice and chat agents',
      body: bn
        ? 'একই ব্রেইন, একই প্রশিক্ষণ ডেটা — চ্যাট ও কলের জন্য।'
        : 'One brain and one training set powering both chat threads and phone calls.',
    },
    {
      icon: Package,
      title: bn ? 'স্টক ও অর্ডার' : 'Stock and orders',
      body: bn
        ? 'আপনার ক্যাটালগ সিঙ্ক হয়, স্টক দেখে উত্তর দেয় এবং অর্ডার সরাসরি আপনার সাইটে পাঠায়।'
        : 'Your catalog syncs in, answers respect live stock, and orders push straight to your site.',
    },
    {
      icon: Workflow,
      title: bn ? 'প্লাগ-অ্যান্ড-প্লে API' : 'Plug-and-play API',
      body: bn
        ? 'প্রতিটি ব্যবসার নিজস্ব API কী ও ওয়েবহুক — কোড লেখা ছাড়াই ইন্টিগ্রেশন।'
        : 'Every workspace gets its own API key and webhooks — integrate without writing a backend.',
    },
    {
      icon: ShieldCheck,
      title: bn ? 'নিরাপদ ও আলাদা ডেটা' : 'Isolated, secure data',
      body: bn
        ? 'প্রতিটি ওয়ার্কস্পেসের ডেটা রো-লেভেল সিকিউরিটি দিয়ে আলাদা রাখা হয়।'
        : 'Every workspace is isolated with row-level security and scoped credentials.',
    },
    {
      icon: Headphones,
      title: bn ? 'লিড থেকে বিক্রি' : 'Leads to revenue',
      body: bn
        ? 'প্রতিটি কথোপকথন স্বয়ংক্রিয়ভাবে শ্রেণিবদ্ধ হয় এবং সেলস বোর্ডে যায়।'
        : 'Every conversation is auto-classified and routed onto your sales board.',
    },
  ];

  return (
    <>
      <SEOHead title={copy.title} description={copy.subtitle} />
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36">
        <div className="pointer-events-none absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{copy.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{copy.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card/60 p-8 md:p-12">
            <h2 className="text-2xl font-semibold tracking-tight">{copy.missionTitle}</h2>
            <p className="mt-4 max-w-3xl text-muted-foreground">{copy.mission}</p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">{copy.valuesTitle}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card/60 p-6">
                <v.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-medium">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/40 bg-card p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{copy.ctaTitle}</h2>
            <p className="mt-3 text-muted-foreground">{copy.ctaBody}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/app/onboarding">{copy.getStarted}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">{copy.pricing}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
