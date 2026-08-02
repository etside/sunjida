import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, MessageCircle, Phone, LifeBuoy } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';
import { company } from '@/data/company';

export default function Contact() {
  const { lang } = useLanguage();
  const bn = lang === 'bn';

  const title = bn ? 'যোগাযোগ করুন' : 'Contact SalesDaddy';
  const description = bn
    ? 'SalesDaddy টিমের সাথে কথা বলুন — চ্যাট এজেন্ট, ভয়েস এজেন্ট, ইনভেন্টরি সিঙ্ক ও ইন্টিগ্রেশন নিয়ে।'
    : 'Talk to the SalesDaddy team about chat agents, voice agents, inventory sync and integrations.';

  const rows = [
    {
      icon: Mail,
      label: bn ? 'সেলস' : 'Sales',
      value: company.sales,
      href: `mailto:${company.sales}`,
    },
    {
      icon: LifeBuoy,
      label: bn ? 'সাপোর্ট' : 'Support',
      value: company.support,
      href: `mailto:${company.support}`,
    },
    {
      icon: Phone,
      label: bn ? 'ফোন / হোয়াটসঅ্যাপ' : 'Phone / WhatsApp',
      value: company.phone,
      href: company.whatsapp,
    },
    {
      icon: Clock,
      label: bn ? 'সময়' : 'Hours',
      value: bn ? company.hours.bn : company.hours.en,
    },
    {
      icon: MapPin,
      label: bn ? 'অবস্থান' : 'Location',
      value: bn ? company.location.bn : company.location.en,
    },
  ];

  return (
    <>
      <SEOHead title={title} description={description} />

      <div className="min-h-screen">
        <section className="pt-28 md:pt-36 pb-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                {bn ? 'যোগাযোগ' : "Let's talk"}
              </span>
              <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
            </motion.div>
          </div>
        </section>

        <section className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid gap-8 lg:gap-14 md:grid-cols-2">
            <motion.div
              className="space-y-5 order-2 md:order-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-primary" aria-hidden="true" />
                  {bn ? 'বার্তা পাঠান' : 'Send a message'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {bn
                    ? `আমরা ${company.responseTime.bn} উত্তর দিই।`
                    : `We reply ${company.responseTime.en}.`}
                </p>
              </div>
              <div className="p-6 sm:p-8 bg-card rounded-2xl border border-border">
                <ContactForm />
              </div>
            </motion.div>

            <motion.div
              className="space-y-6 order-1 md:order-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {bn ? 'সরাসরি যোগাযোগ' : 'Reach us directly'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {bn
                    ? 'যেকোনো চ্যানেলে লিখুন — আমাদের নিজস্ব এজেন্টই প্রথমে উত্তর দেবে।'
                    : 'Message us on any channel — our own agent answers first, 24/7.'}
                </p>
              </div>

              <div className="p-6 sm:p-8 bg-secondary/30 rounded-2xl space-y-5">
                {rows.map((row, i) => (
                  <div key={row.label}>
                    {i > 0 && <Separator className="mb-5" />}
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <row.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">{row.label}</p>
                        {row.href ? (
                          <a
                            href={row.href}
                            className="text-base hover:text-primary transition-colors break-all"
                          >
                            {row.value}
                          </a>
                        ) : (
                          <p className="text-base">{row.value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5">
                <p className="font-medium">
                  {bn ? 'এখনই এজেন্টের সাথে কথা বলুন' : 'Try the agent right now'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {bn
                    ? 'নিচের ডানদিকের চ্যাট বাটনে ক্লিক করুন — বাংলা বা ইংরেজিতে প্রশ্ন করুন।'
                    : 'Open the chat button in the bottom-right corner and ask in Bangla or English.'}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="h-16" />
      </div>
    </>
  );
}
