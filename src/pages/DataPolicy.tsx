import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';

const META_APP_ID = '28270453972551940';

export default function DataPolicy() {
  const { lang } = useLanguage();
  const bn = lang === 'bn';

  return (
    <>
      <SEOHead
        title={bn ? 'ডেটা নীতি' : 'Data Policy'}
        description={bn
          ? 'SalesDaddy ডেটা অপসারণ ও ডেটা নীতি — মেটা মেসেঞ্জার API সম্মতি'
          : 'SalesDaddy data removal and data policy — Meta Messenger API compliance'}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-2">
            {bn ? 'ডেটা নীতি' : 'Data Policy'}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {bn ? 'সর্বশেষ আপডেট: ২০২৬ সালের ৮ আগস্ট' : 'Last updated: August 8, 2026'}
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '১. ভূমিকা' : '1. Introduction'}
              </h2>
              <p>
                {bn
                  ? `SalesDaddy ("আমরা", "আমাদের") আপনার ব্যক্তিগত ডেটা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। এই ডেটা নীতি ব্যাখ্যা করে কীভাবে আমরা আপনার ডেটা সংগ্রহ, ব্যবহার এবং অপসারণ করি। এই নীতি Meta Platforms, Inc. এর Messenger Platform API ব্যবহারকারীদের জন্য প্রযোজ্য। আমাদের Meta App ID: ${META_APP_ID}`
                  : `SalesDaddy ("we", "us") is committed to protecting your personal data. This Data Policy explains how we collect, use, and remove your data. This policy applies to users of our Messenger Platform API integration. Our Meta App ID: ${META_APP_ID}`}
              </p>
            </section>

            {/* 2. Data We Collect */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '২. আমরা যে ডেটা সংগ্রহ করি' : '2. Data We Collect'}
              </h2>
              <p className="mb-3">
                {bn
                  ? 'আমরা নিম্নলিখিত ব্যক্তিগত ডেটা সংগ্রহ করতে পারি:'
                  : 'We may collect the following personal data:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{bn ? 'প্রোফাইল তথ্য' : 'Profile Information'}</strong> — {bn
                    ? 'আপনার Meta/Facebook প্রোফাইল থেকে নাম, প্রোফাইল ছবি এবং পাবলিক তথ্য।'
                    : 'Name, profile picture, and public information from your Meta/Facebook profile.'}
                </li>
                <li>
                  <strong>{bn ? 'বার্তা বিষয়বস্তু' : 'Message Content'}</strong> — {bn
                    ? 'আপনি এজেন্টের সাথে পাঠানো বার্তা, অর্ডার, প্রশ্ন এবং কথোপকথন।'
                    : 'Messages you send to the agent, including orders, questions, and conversations.'}
                </li>
                <li>
                  <strong>{bn ? 'অর্ডার তথ্য' : 'Order Information'}</strong> — {bn
                    ? 'পণ্যের নাম, পরিমাণ, মূল্য, শিপিং ঠিকানা এবং পেমেন্ট পদ্ধতি।'
                    : 'Product name, quantity, price, shipping address, and payment method.'}
                </li>
                <li>
                  <strong>{bn ? 'ইন্টারঅ্যাকশন ডেটা' : 'Interaction Data'}</strong> — {bn
                    ? 'সেশন তথ্য, টাইমস্ট্যাম্প, এবং সেবা ব্যবহারের মেটা-ডেটা।'
                    : 'Session information, timestamps, and metadata about service usage.'}
                </li>
              </ul>
            </section>

            {/* 3. How We Use Data */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৩. আমরা ডেটা কীভাবে ব্যবহার করি' : '3. How We Use Data'}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{bn ? 'আপনার অর্ডার প্রক্রিয়াকরণ এবং ডেলিভারি' : 'Process and deliver your orders'}</li>
                <li>{bn ? 'কাস্টমার সাপোর্ট প্রদান করা' : 'Provide customer support'}</li>
                <li>{bn ? 'আমাদের এআই এজেন্টকে আপনার প্রশ্নের উত্তর দিতে সাহায্য করা' : 'Enable our AI agent to answer your questions'}</li>
                <li>{bn ? 'সেবা উন্নত করা এবং ব্যবহার প্যাটার্ন বিশ্লেষণ করা' : 'Improve the service and analyze usage patterns'}</li>
                <li>{bn ? 'আইনি বাধাবদ্ধতা মেনে চলা' : 'Comply with legal obligations'}</li>
              </ul>
            </section>

            {/* 4. Data Deletion */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৪. ডেটা অপসারণ' : '4. Data Deletion'}
              </h2>
              <p className="mb-3">
                {bn
                  ? 'আপনি যেকোনো সময় আপনার ডেটা অপসারণ করতে পারেন। নিচের পদ্ধতিগুলো ব্যবহার করুন:'
                  : 'You can request deletion of your data at any time. Use one of the following methods:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{bn ? 'ইমেইল অনুরোধ' : 'Email Request'}</strong> — {bn
                    ? 'support@salesdaddy.io এ ইমেইল করুন, বিষয় "ডেটা অপসারণ অনুরোধ" লিখুন। আমরা ৩০ দিনের মধ্যে আপনার অনুরোধ প্রক্রিয়াকরণ করব।'
                    : 'Email support@salesdaddy.io with subject "Data Deletion Request". We will process your request within 30 days.'}
                </li>
                <li>
                  <strong>{bn ? 'ইন-অ্যাপ অনুরোধ' : 'In-App Request'}</strong> — {bn
                    ? 'SalesDaddy অ্যাপে আপনার অ্যাকাউন্ট সেটিংস থেকে "আমার ডেটা মুছুন" বাটনে ক্লিক করুন।'
                    : 'Click "Delete My Data" from your account settings in the SalesDaddy app.'}
                </li>
                <li>
                  <strong>{bn ? 'মেসেঞ্জার বার্তা' : 'Messenger Message'}</strong> — {bn
                    ? 'SalesDaddy বটকে "DELETE MY DATA" বার্তা পাঠান।'
                    : 'Send "DELETE MY DATA" message to the SalesDaddy bot.'}
                </li>
              </ul>
              <p className="mt-3">
                {bn
                  ? 'ডেটা অপসারণের পর, আমরা ৩০ দিনের মধ্যে আপনার ব্যক্তিগত ডেটা স্থায়ীভাবে মুছে ফেলব। কিছু তথ্য আইনি বাধাবদ্ধতার কারণে সংরক্ষিত থাকতে পারে।'
                  : 'After deletion, we will permanently remove your personal data within 30 days. Some information may be retained for legal compliance purposes.'}
              </p>
            </section>

            {/* 5. Data Deletion Callback */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৫. ডেটা অপসারণ কলব্যাক' : '5. Data Deletion Callback'}
              </h2>
              <p className="mb-3">
                {bn
                  ? 'Meta-এর ডেটা ডিলিটন কলব্যাক রিকোয়েস্ট প্রক্রিয়াকরণের জন্য, আমরা নিম্নলিখিত এন্ডপয়েন্ট প্রদান করি:'
                  : 'For Meta\'s data deletion callback request processing, we provide the following endpoint:'}
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-xs">
                <p className="mb-1">Callback URL:</p>
                <p className="font-semibold">https://salesdaddy.io/api/meta/data-deletion-callback</p>
                <p className="mt-3 mb-1">Status Check URL:</p>
                <p className="font-semibold">https://salesdaddy.io/api/meta/data-deletion-status</p>
              </div>
              <p className="mt-3">
                {bn
                  ? 'Meta স্বয়ংক্রিয়ভাবে ডেটা অপসারণ কনফার্মেশন এবং স্ট্যাটাস চেক জেনারেশনের জন্য এই URLs ব্যবহার করে।'
                  : 'Meta uses these URLs to automatically generate data deletion confirmation and status checks.'}
              </p>
            </section>

            {/* 6. Data Sharing */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৬. ডেটা শেয়ারিং' : '6. Data Sharing'}
              </h2>
              <p className="mb-3">
                {bn
                  ? 'আমরা আপনার ব্যক্তিগত ডেটা তৃতীয় পক্ষে বিক্রি করি না। আমরা নিম্নলিখিত ক্ষেত্রে ডেটা শেয়ার করতে পারি:'
                  : 'We do not sell your personal data to third parties. We may share data in the following cases:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{bn ? 'Meta Platforms, Inc. — Messenger API সেবা প্রদানের জন্য' : 'Meta Platforms, Inc. — To provide the Messenger API service'}</li>
                <li>{bn ? 'পেমেন্ট প্রসেসর — অর্ডার প্রক্রিয়াকরণের জন্য' : 'Payment processors — To process orders'}</li>
                <li>{bn ? 'শিপিং পার্টনার — ডেলিভারির জন্য' : 'Shipping partners — For delivery'}</li>
                <li>{bn ? 'আইনি বাধাবদ্ধতা অনুযায়ী আইন প্রয়োগকারী সংস্থা' : 'Law enforcement when legally required'}</li>
              </ul>
            </section>

            {/* 7. Contact */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৭. যোগাযোগ' : '7. Contact'}
              </h2>
              <p>
                {bn
                  ? 'ডেটা নীতি সম্পর্কে প্রশ্ন থাকলে, যোগাযোগ করুন:'
                  : 'If you have questions about this Data Policy, contact us:'}
              </p>
              <p className="mt-2">
                Email: <a href="mailto:support@salesdaddy.io" className="text-primary underline">support@salesdaddy.io</a>
              </p>
              <p>
                App ID: {META_APP_ID}
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
