/** SalesDaddy company + contact details used across the marketing site. */
export const company = {
  name: 'SalesDaddy',
  email: 'hello@salesdaddy.ai',
  sales: 'sales@salesdaddy.ai',
  support: 'support@salesdaddy.ai',
  phone: '+880 1700-000000',
  whatsapp: 'https://wa.me/8801700000000',
  messenger: 'https://m.me/salesdaddy',
  location: {
    en: 'Dhaka, Bangladesh — remote-first',
    bn: 'ঢাকা, বাংলাদেশ — রিমোট-ফার্স্ট',
  },
  hours: {
    en: 'Sat–Thu, 10:00–19:00 (GMT+6) · AI agent replies 24/7',
    bn: 'শনি–বৃহঃ, সকাল ১০টা–সন্ধ্যা ৭টা (GMT+6) · এআই এজেন্ট ২৪/৭',
  },
  responseTime: {
    en: 'within 1 business day',
    bn: '১ কর্মদিবসের মধ্যে',
  },
} as const;

export const inquiryTypes = [
  { value: 'chat_agent', en: 'Chat agent', bn: 'চ্যাট এজেন্ট' },
  { value: 'voice_agent', en: 'Voice agent', bn: 'ভয়েস এজেন্ট' },
  { value: 'ecommerce', en: 'E-commerce & inventory sync', bn: 'ই-কমার্স ও ইনভেন্টরি সিঙ্ক' },
  { value: 'integration', en: 'API / webhook integration', bn: 'API / ওয়েবহুক ইন্টিগ্রেশন' },
  { value: 'support', en: 'Support', bn: 'সাপোর্ট' },
] as const;
