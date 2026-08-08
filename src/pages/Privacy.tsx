import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';

const META_APP_ID = '28270453972551940';

export default function Privacy() {
  const { lang } = useLanguage();
  const bn = lang === 'bn';

  return (
    <>
      <SEOHead
        title={bn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
        description={bn
          ? 'SalesDaddy গোপনীয়তা নীতি — মেটা মেসেঞ্জার API সম্মতি'
          : 'SalesDaddy Privacy Policy — Meta Messenger API compliance'}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-2">
            {bn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
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
                  ? `SalesDaddy ("আমরা", "আমাদের") আপনার গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা নীতি ব্যাখ্যা করে কীভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ এবং প্রকাশ করি। Meta Messenger Platform API ব্যবহারকারীদের জন্য এই নীতি বিশেষভাবে প্রযোজ্য। আমাদের Meta App ID: ${META_APP_ID}`
                  : `SalesDaddy ("we", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and disclose your personal information. This policy is particularly relevant for users of our Meta Messenger Platform API integration. Our Meta App ID: ${META_APP_ID}`}
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '২. আমরা যে তথ্য সংগ্রহ করি' : '2. Information We Collect'}
              </h2>
              <p className="mb-3">
                {bn ? 'আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:' : 'We collect the following information:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{bn ? 'পরিচয় তথ্য' : 'Identity Data'}</strong> — {bn
                    ? 'নাম, ইমেইল ঠিকানা, ফোন নম্বর এবং Meta/Facebook প্রোফাইল তথ্য।'
                    : 'Name, email address, phone number, and Meta/Facebook profile information.'}
                </li>
                <li>
                  <strong>{bn ? 'যোগাযোগ তথ্য' : 'Contact Data'}</strong> — {bn
                    ? 'ঠিকানা, শহর, পোস্টকোড, দেশ এবং শিপিং তথ্য।'
                    : 'Address, city, postcode, country, and shipping information.'}
                </li>
                <li>
                  <strong>{bn ? 'আর্থিক তথ্য' : 'Financial Data'}</strong> — {bn
                    ? 'অর্ডার ইতিহাস, পেমেন্ট পদ্ধতি এবং লেনদেন তথ্য।'
                    : 'Order history, payment method, and transaction data.'}
                </li>
                <li>
                  <strong>{bn ? 'যোগাযোগ তথ্য' : 'Communication Data'}</strong> — {bn
                    ? 'SalesDaddy এজেন্টের সাথে আপনার কথোপকথন, বার্তা এবং প্রতিক্রিয়া।'
                    : 'Your conversations, messages, and responses with the SalesDaddy agent.'}
                </li>
                <li>
                  <strong>{bn ? 'টেকনিক্যাল তথ্য' : 'Technical Data'}</strong> — {bn
                    ? 'IP ঠিকানা, ব্রাউজার ধরন, ডিভাইস তথ্য এবং ব্যবহারের মেটা-ডেটা।'
                    : 'IP address, browser type, device information, and usage metadata.'}
                </li>
              </ul>
            </section>

            {/* 3. How We Use Information */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৩. আমরা তথ্য কীভাবে ব্যবহার করি' : '3. How We Use Information'}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{bn ? 'আপনার অর্ডার প্রক্রিয়াকরণ এবং ডেলিভারি পরিচালনা করা' : 'Process and manage your orders and deliveries'}</li>
                <li>{bn ? 'কাস্টমার সাপোর্ট এবং সেবা প্রদান করা' : 'Provide customer support and service'}</li>
                <li>{bn ? 'আমাদের এআই-চালিত চ্যাট এবং ভয়েস এজেন্ট পরিচালনা করা' : 'Operate our AI-powered chat and voice agents'}</li>
                <li>{bn ? 'সেবা উন্নত করা এবং নতুন বৈশিষ্ট্য তৈরি করা' : 'Improve services and develop new features'}</li>
                <li>{bn ? 'নিরাপত্তা, জালিয়াতি প্রতিরোধ এবং আইনি বাধাবদ্ধতা মেনে চলা' : 'Ensure security, prevent fraud, and comply with legal obligations'}</li>
                <li>{bn ? 'আপনার সাথে যোগাযোগ করা (সেবা আপডেট, অর্ডার স্ট্যাটাস ইত্যাদি)' : 'Communicate with you (service updates, order status, etc.)'}</li>
              </ul>
            </section>

            {/* 4. Messenger Platform Data */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৪. মেসেঞ্জার প্ল্যাটফর্ম ডেটা' : '4. Messenger Platform Data'}
              </h2>
              <p className="mb-3">
                {bn
                  ? 'Meta Messenger Platform API ব্যবহার করার ফলে, আমরা Meta-এর নীতি অনুযায়ী নিম্নলিখিত তথ্য অ্যাক্সেস করতে পারি:'
                  : 'As a result of using the Meta Messenger Platform API, we may access the following data in accordance with Meta\'s policies:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{bn ? 'পাবলিক প্রোফাইল তথ্য (নাম, প্রোফাইল ছবি)' : 'Public profile information (name, profile picture)'}</li>
                <li>{bn ? 'পেজ-টু-ইউজার কথোপকথন বার্তা' : 'Page-to-user conversation messages'}</li>
                <li>{bn ? 'ওয়েবহুক ইভেন্ট (মেসেজ পাঠানো/গ্রহণ, পোস্টব্যাক)' : 'Webhook events (message send/receive, postback)'}</li>
              </ul>
              <p className="mt-3">
                {bn
                  ? 'আমরা Meta-এর প্ল্যাটফর্ম নীতি এবং ডেটা ব্যবহার সীমাবদ্ধতা মেনে চলি। আমরা Messenger ডেটা কোনো তৃতীয় পক্ষে বিক্রি করি না।'
                  : 'We comply with Meta\'s Platform Terms and data use limitations. We do not sell Messenger data to any third party.'}
              </p>
            </section>

            {/* 5. Data Retention */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৫. ডেটা সংরক্ষণ' : '5. Data Retention'}
              </h2>
              <p>
                {bn
                  ? 'আমরা আপনার ব্যক্তিগত তথ্য সেই পর্যন্ত সংরক্ষণ করি যতক্ষণ পর্যন্ত এটি আমাদের সেবা প্রদানের জন্য প্রয়োজন, অথবা আইনি বাধাবদ্ধতা অনুযায়ী প্রয়োজন। সাধারণত, আমরা অর্ডার ডেটা ৫ বছর এবং কথোপকথন ডেটা ২ বছর সংরক্ষণ করি। আপনি যেকোনো সময় ডেটা অপসারণ অনুরোধ করতে পারেন।'
                  : 'We retain your personal information for as long as necessary to provide our services, or as required by legal obligations. Generally, we retain order data for 5 years and conversation data for 2 years. You may request data deletion at any time.'}
              </p>
            </section>

            {/* 6. Data Security */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৬. ডেটা নিরাপত্তা' : '6. Data Security'}
              </h2>
              <p>
                {bn
                  ? 'আমরা আপনার ব্যক্তিগত তথ্য রক্ষা করতে উদ্যোগ-মানদণ্ড প্রযুক্তি এবং প্রক্রিয়া ব্যবহার করি। এর মধ্যে রয়েছে: ডেটা এনক্রিপশন (TLS/SSL), অ্যাক্সেস কন্ট্রোল, নিয়মিত নিরাপত্অডিট এবং নিরাপদ ডেটা স্টোরেজ।'
                  : 'We use industry-standard technologies and processes to protect your personal data. These include: data encryption (TLS/SSL), access controls, regular security audits, and secure data storage.'}
              </p>
            </section>

            {/* 7. Your Rights */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৭. আপনার অধিকার' : '7. Your Rights'}
              </h2>
              <p className="mb-3">
                {bn ? 'আপনার নিম্নলিখিত অধিকার রয়েছে:' : 'You have the following rights:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{bn ? 'আপনার ব্যক্তিগত তথ্য অ্যাক্সেস করার অধিকার' : 'Right to access your personal data'}</li>
                <li>{bn ? 'ভুল তথ্য সংশোধন করার অধিকার' : 'Right to rectify incorrect data'}</li>
                <li>{bn ? 'আপনার ব্যক্তিগত তথ্য অপসারণ করার অধিকার' : 'Right to delete your personal data'}</li>
                <li>{bn ? 'ডেটা প্রক্রিয়াকরণ সীমাবদ্ধ করার অধিকার' : 'Right to restrict data processing'}</li>
                <li>{bn ? 'ডেটা পোর্টেবিলিটির অধিকার' : 'Right to data portability'}</li>
                <li>{bn ? 'প্রক্রিয়াকরণে আপত্তি করার অধিকার' : 'Right to object to processing'}</li>
              </ul>
            </section>

            {/* 8. Cookies */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৮. কুকিজ' : '8. Cookies'}
              </h2>
              <p>
                {bn
                  ? 'আমরা সেশন পরিচালনা, নিরাপত্তা এবং পারফরম্যান্স ট্র্যাকিংয়ের জন্য কুকিজ এবং সমতুল্য প্রযুক্তি ব্যবহার করি। আপনি আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন।'
                  : 'We use cookies and similar technologies for session management, security, and performance tracking. You can control cookies through your browser settings.'}
              </p>
            </section>

            {/* 9. Changes to Policy */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৯. নীতিতে পরিবর্তন' : '9. Changes to This Policy'}
              </h2>
              <p>
                {bn
                  ? 'আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে আমরা আপনাকে ইমেইল বা মেসেঞ্জার বার্তার মাধ্যমে অবগত করব।'
                  : 'We may update this Privacy Policy from time to time. In case of significant changes, we will notify you via email or Messenger message.'}
              </p>
            </section>

            {/* 10. Contact */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '১০. যোগাযোগ' : '10. Contact'}
              </h2>
              <p>
                {bn
                  ? 'এই গোপনীয়তা নীতি সম্পর্কে প্রশ্ন থাকলে, যোগাযোগ করুন:'
                  : 'If you have questions about this Privacy Policy, contact us:'}
              </p>
              <p className="mt-2">
                Email: <a href="mailto:support@salesdaddy.io" className="text-primary underline">support@salesdaddy.io</a>
              </p>
              <p>
                Meta App ID: {META_APP_ID}
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
