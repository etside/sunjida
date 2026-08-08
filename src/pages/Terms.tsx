import { SEOHead } from '@/components/seo/SEOHead';
import { useLanguage } from '@/i18n/LanguageProvider';

const META_APP_ID = '28270453972551940';

export default function Terms() {
  const { lang } = useLanguage();
  const bn = lang === 'bn';

  return (
    <>
      <SEOHead
        title={bn ? 'সেবার শর্তাবলী' : 'Terms of Service'}
        description={bn
          ? 'SalesDaddy সেবার শর্তাবলী — মেটা মেসেঞ্জার API সম্মতি'
          : 'SalesDaddy Terms of Service — Meta Messenger API compliance'}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-2">
            {bn ? 'সেবার শর্তাবলী' : 'Terms of Service'}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {bn ? 'সর্বশেষ আপডেট: ২০২৬ সালের ৮ আগস্ট' : 'Last updated: August 8, 2026'}
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
            {/* 1. Acceptance */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '১. শর্তাবলী গ্রহণ' : '1. Acceptance of Terms'}
              </h2>
              <p>
                {bn
                  ? `SalesDaddy ("সেবা") ব্যবহার করে আপনি এই সেবার শর্তাবলী ("শর্তাবলী") মেনে নিচ্ছেন। যদি আপনি এই শর্তাবলী মেনে নিতে না চান, তাহলে সেবা ব্যবহার করবেন না। এই সেবা Meta Messenger Platform API এর মাধ্যমে প্রদান করা হয়। আমাদের Meta App ID: ${META_APP_ID}`
                  : `By using SalesDaddy (the "Service"), you agree to these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. This Service is provided through the Meta Messenger Platform API. Our Meta App ID: ${META_APP_ID}`}
              </p>
            </section>

            {/* 2. Service Description */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '২. সেবার বিবরণ' : '2. Service Description'}
              </h2>
              <p className="mb-3">
                {bn
                  ? 'SalesDaddy একটি এআই-চালিত সেবা যা নিম্নলিখিত বৈশিষ্ট্য প্রদান করে:'
                  : 'SalesDaddy is an AI-powered service that provides the following features:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{bn ? 'মেসেঞ্জার, হোয়াটসঅ্যাপ এবং ইনস্টাগ্রামে এআই চ্যাট এজেন্ট' : 'AI chat agents on Messenger, WhatsApp, and Instagram'}</li>
                <li>{bn ? 'ভয়েস কল এজেন্ট' : 'Voice call agents'}</li>
                <li>{bn ? 'অর্ডার প্রক্রিয়াকরণ এবং কাস্টমার সাপোর্ট' : 'Order processing and customer support'}</li>
                <li>{bn ? 'ইনভেন্টরি পরিচালনা এবং ওয়েবহুক ইন্টিগ্রেশন' : 'Inventory management and webhook integration'}</li>
                <li>{bn ? 'বহুভাষিক (বাংলা ও ইংরেজি) সমর্থন' : 'Multilingual (Bangla and English) support'}</li>
              </ul>
            </section>

            {/* 3. User Responsibilities */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৩. ব্যবহারকারীর দায়িত্ব' : '3. User Responsibilities'}
              </h2>
              <p className="mb-3">
                {bn ? 'আপনি সম্মত হচ্ছেন যে:' : 'You agree that you will:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{bn ? 'সেবা শুধুমাত্র আইনসম্মত উদ্দেশ্যে ব্যবহার করবেন' : 'Use the Service only for lawful purposes'}</li>
                <li>{bn ? 'Meta-এর প্ল্যাটফর্ম নীতি এবং কমিউনিটি স্ট্যান্ডার্ড মেনে চলবেন' : 'Comply with Meta\'s Platform Terms and Community Standards'}</li>
                <li>{bn ? 'অন্য ব্যবহারকারীর অধিকার লঙ্ঘন করবেন না' : 'Not violate the rights of other users'}</li>
                <li>{bn ? 'সেবাকে ক্ষতিগ্রস্ত করার চেষ্টা করবেন না' : 'Not attempt to harm the Service'}</li>
                <li>{bn ? 'স্প্যাম, মিথ্যা তথ্য বা ক্ষতিকর বিষয়বস্তু প্রেরণ করবেন না' : 'Not send spam, false information, or harmful content'}</li>
                <li>{bn ? 'আপনার অ্যাকাউন্ট নিরাপত্তা বজায় রাখবেন' : 'Maintain the security of your account'}</li>
              </ul>
            </section>

            {/* 4. Meta Messenger Platform */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৪. মেসেঞ্জার প্ল্যাটফর্ম' : '4. Messenger Platform'}
              </h2>
              <p className="mb-3">
                {bn
                  ? 'এই সেবা Meta Messenger Platform API ব্যবহার করে। মেসেঞ্জার ব্যবহার করার জন্য, আপনি Meta-এর নিজস্ব শর্তাবলী এবং গোপনীয়তা নীতিও মেনে চলতে সম্মত হচ্ছেন:'
                  : 'This Service uses the Meta Messenger Platform API. By using Messenger, you also agree to Meta\'s own Terms and Privacy Policy:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><a href="https://www.facebook.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">Meta Terms of Service</a></li>
                <li><a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Meta Privacy Policy</a></li>
                <li><a href="https://developers.facebook.com/docs/messenger-platform/policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Messenger Platform Policy</a></li>
              </ul>
              <p className="mt-3">
                {bn
                  ? 'আমরা Meta-এর প্ল্যাটফর্ম নীতি মেনে চলি এবং আপনার Messenger ডেটা শুধুমাত্র সেবা প্রদানের জন্য ব্যবহার করি।'
                  : 'We comply with Meta\'s Platform Terms and use your Messenger data solely to provide the Service.'}
              </p>
            </section>

            {/* 5. Orders and Payments */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৫. অর্ডার এবং পেমেন্ট' : '5. Orders and Payments'}
              </h2>
              <p className="mb-3">
                {bn
                  ? 'সেবার মাধ্যমে করা অর্ডার সম্পর্কে:'
                  : 'Regarding orders placed through the Service:'}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{bn ? 'অর্ডার কনফার্মেশন ইমেইল বা মেসেঞ্জার বার্তার মাধ্যমে পাঠানো হবে' : 'Order confirmations will be sent via email or Messenger message'}</li>
                <li>{bn ? 'পেমেন্ট নিরাপদ পেমেন্ট গেটওয়ের মাধ্যমে প্রক্রিয়াকরণ করা হবে' : 'Payments will be processed through secure payment gateways'}</li>
                <li>{bn ? 'মূল্য পরিবর্তনের অধিকার সংরক্ষিত' : 'Prices are subject to change without notice'}</li>
                <li>{bn ? 'অর্ডার বাতিল এবং রিফান্ড নীতি পণ্যের ধরনের উপর নির্ভর করে' : 'Cancellation and refund policies depend on the product type'}</li>
              </ul>
            </section>

            {/* 6. Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৬. বৌদ্ধিক সম্পত্তি' : '6. Intellectual Property'}
              </h2>
              <p>
                {bn
                  ? 'সেবার সমস্ত বৌদ্ধিক সম্পত্তির অধিকার SalesDaddy-এর সাথে সংরক্ষিত। আপনি সেবা ব্যবহার করে কোনো বৌদ্ধিক সম্পত্তির অধিকার অর্জন করেন না। আপনার ব্যবসায়িক বিষয়বস্তুর মালিকানা আপনারই থাকে।'
                  : 'All intellectual property rights in the Service are reserved by SalesDaddy. Your use of the Service does not grant you any intellectual property rights. You retain ownership of your business content.'}
              </p>
            </section>

            {/* 7. Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৭. দায়বদ্ধতার সীমাবদ্ধতা' : '7. Limitation of Liability'}
              </h2>
              <p>
                {bn
                  ? 'যতটা আইন অনুযায়ী সম্ভব, SalesDaddy সেবার ব্যবহার থেকে উদ্ভূত কোনো পরোক্ষ, আনুষঙ্গিক, বিশেষ, শাস্তিমূলক বা দণ্ডমূলক ক্ষতির জন্য দায়বদ্ধ নয়। সেবা "যেমন আছে" এবং "যেমন পাওয়া যায়" ভিত্তিতে প্রদান করা হয়।'
                  : 'To the fullest extent permitted by law, SalesDaddy shall not be liable for any indirect, incidental, special, punitive, or consequential damages arising from the use of the Service. The Service is provided "as is" and "as available".'}
              </p>
            </section>

            {/* 8. Termination */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৮. সেবা বন্ধ' : '8. Termination'}
              </h2>
              <p>
                {bn
                  ? 'আমরা যেকোনো সময়, যেকোনো কারণে, আপনার অ্যাকাউন্ট বা সেবার অ্যাক্সেস বন্ধ করার অধিকার সংরক্ষণ করি। আপনিও যেকোনো সময় আপনার অ্যাকাউন্ট বন্ধ করতে পারেন।'
                  : 'We reserve the right to terminate your account or access to the Service at any time, for any reason. You may also close your account at any time.'}
              </p>
            </section>

            {/* 9. Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '৯. শর্তাবলীতে পরিবর্তন' : '9. Changes to Terms'}
              </h2>
              <p>
                {bn
                  ? 'আমরা সময়ে সময়ে এই শর্তাবলী আপডেট করতে পারি। উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে আমরা আপনাকে ইমেইল বা মেসেঞ্জার বার্তার মাধ্যমে অবগত করব। পরিবর্তনের পর সেবা ব্যবহার করে আপনি নতুন শর্তাবলী মেনে নিচ্ছেন।'
                  : 'We may update these Terms from time to time. We will notify you of significant changes via email or Messenger message. By continuing to use the Service after changes, you accept the new Terms.'}
              </p>
            </section>

            {/* 10. Governing Law */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '১০. প্রযোজ্য আইন' : '10. Governing Law'}
              </h2>
              <p>
                {bn
                  ? 'এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত এবং ব্যাখ্যা করা হবে। যেকোনো বিরোধ বাংলাদেশের আদালতে সমাধান করা হবে।'
                  : 'These Terms shall be governed by and construed in accordance with the laws of Bangladesh. Any disputes shall be resolved in the courts of Bangladesh.'}
              </p>
            </section>

            {/* 11. Contact */}
            <section>
              <h2 className="text-xl font-semibold mt-8 mb-3">
                {bn ? '১১. যোগাযোগ' : '11. Contact'}
              </h2>
              <p>
                {bn
                  ? 'এই শর্তাবলী সম্পর্কে প্রশ্ন থাকলে, যোগাযোগ করুন:'
                  : 'If you have questions about these Terms, contact us:'}
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
