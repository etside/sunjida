import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Lang = 'en' | 'bn';

type Dict = Record<string, string>;

const en: Dict = {
  'nav.solutions': 'Solutions',
  'nav.voice': 'Voice Agent',
  'nav.chat': 'Chat Agent',
  'nav.commerce': 'Commerce & Inventory',
  'nav.webhooks': 'Webhooks & API',
  'nav.pricing': 'Pricing',
  'nav.docs': 'Docs',
  'nav.contact': 'Contact',
  'nav.signin': 'Sign in',
  'nav.start': 'Get started',

  'hero.badge': 'Bengali & English AI sales agents',
  'hero.title': 'AI agents that sell, support and restock',
  'hero.subtitle':
    'SalesDaddy gives your business a voice agent, a chat agent and a live commerce brain — fluent in Bangla and English, connected to your stock, orders and webhooks.',
  'hero.cta': 'Start building free',
  'hero.cta2': 'Talk to an agent',
  'hero.note': 'No card required · Bangla-first speech · 24/7 uptime',

  'trust.title': 'Powering conversations for growing teams',

  'solutions.title': 'One platform. Four building blocks.',
  'solutions.subtitle': 'Mix and match what your business needs today, scale to the rest tomorrow.',
  'solutions.explore': 'Explore',

  'voice.title': 'Voice Agent',
  'voice.desc':
    'Natural Bangla and English phone agents that answer calls, confirm orders, chase COD deliveries and hand off to humans instantly.',
  'chat.title': 'Chat Agent',
  'chat.desc':
    'Website, Messenger and WhatsApp chat that answers product questions, recommends items and closes the sale inside the conversation.',
  'commerce.title': 'Commerce & Inventory',
  'commerce.desc':
    'Live access to stock levels, variants, pricing and order status so your agents never promise what you cannot ship.',
  'webhooks.title': 'Webhooks & API',
  'webhooks.desc':
    'Stream every call, chat, order and stock event to your systems in real time, or trigger agent actions from your own backend.',

  'features.title': 'Built for Bangladeshi commerce',
  'features.1.title': 'Bangla-first understanding',
  'features.1.desc': 'Trained on real Bangla speech, mixed Banglish typing, and local address and payment vocabulary.',
  'features.2.title': 'Realtime latency',
  'features.2.desc': 'Sub-second responses so a voice call feels like a conversation, not a menu tree.',
  'features.3.title': 'Stock-aware answers',
  'features.3.desc': 'Agents read your inventory before they speak, so availability and price are always accurate.',
  'features.4.title': 'Human handoff',
  'features.4.desc': 'Escalate to your team with the full transcript, customer profile and cart already attached.',
  'features.5.title': 'Every event, everywhere',
  'features.5.desc': 'Signed webhooks for orders, low stock, missed calls, refunds and sentiment flags.',
  'features.6.title': 'Secure by default',
  'features.6.desc': 'Scoped API keys, per-agent permissions and full audit logs on every action taken.',

  'how.title': 'Live in three steps',
  'how.1.title': 'Connect your store',
  'how.1.desc': 'Point SalesDaddy at your catalog, stock and order tables — or push them in over the API.',
  'how.2.title': 'Shape your agent',
  'how.2.desc': 'Pick a voice, choose Bangla, English or both, and write the rules your brand should follow.',
  'how.3.title': 'Go live and listen',
  'how.3.desc': 'Publish to phone, web and chat apps, then watch transcripts, conversions and stock events roll in.',

  'pricing.title': 'Pricing that scales with conversations',
  'pricing.subtitle': 'Start free. Pay only when your agents are working.',
  'pricing.month': '/month',
  'pricing.cta': 'Choose plan',
  'pricing.starter': 'Starter',
  'pricing.growth': 'Growth',
  'pricing.scale': 'Enterprise',
  'pricing.popular': 'Most popular',
  'pricing.custom': 'Custom',

  'cta.title': 'Give your shop a daddy that never sleeps',
  'cta.subtitle': 'Deploy your first Bangla voice agent in an afternoon.',
  'cta.button': 'Get started free',

  'footer.product': 'Product',
  'footer.company': 'Company',
  'footer.resources': 'Resources',
  'footer.tagline': 'AI voice, chat and commerce agents for Bangla and English speaking businesses.',
  'footer.rights': 'All rights reserved.',
  'footer.about': 'About',
  'footer.careers': 'Careers',
  'footer.blog': 'Blog',
  'footer.status': 'Status',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',

  'page.usecases': 'What it handles',
  'page.capabilities': 'Capabilities',
  'page.back': 'All solutions',
};

const bn: Dict = {
  'nav.solutions': 'সমাধান',
  'nav.voice': 'ভয়েস এজেন্ট',
  'nav.chat': 'চ্যাট এজেন্ট',
  'nav.commerce': 'কমার্স ও ইনভেন্টরি',
  'nav.webhooks': 'ওয়েবহুক ও এপিআই',
  'nav.pricing': 'মূল্য',
  'nav.docs': 'ডকুমেন্টেশন',
  'nav.contact': 'যোগাযোগ',
  'nav.signin': 'সাইন ইন',
  'nav.start': 'শুরু করুন',

  'hero.badge': 'বাংলা ও ইংরেজি এআই সেলস এজেন্ট',
  'hero.title': 'এআই এজেন্ট যা বিক্রি করে, সাপোর্ট দেয় ও স্টক সামলায়',
  'hero.subtitle':
    'SalesDaddy আপনার ব্যবসার জন্য ভয়েস এজেন্ট, চ্যাট এজেন্ট ও লাইভ কমার্স ব্রেন তৈরি করে — বাংলা ও ইংরেজিতে সাবলীল, আপনার স্টক, অর্ডার ও ওয়েবহুকের সাথে যুক্ত।',
  'hero.cta': 'ফ্রি শুরু করুন',
  'hero.cta2': 'এজেন্টের সাথে কথা বলুন',
  'hero.note': 'কার্ড লাগবে না · বাংলা-প্রথম স্পিচ · ২৪/৭ সচল',

  'trust.title': 'বেড়ে ওঠা টিমগুলোর কথোপকথন চালাচ্ছে',

  'solutions.title': 'একটি প্ল্যাটফর্ম। চারটি ব্লক।',
  'solutions.subtitle': 'আজ যা দরকার তা নিন, কাল বাকিটা যোগ করুন।',
  'solutions.explore': 'দেখুন',

  'voice.title': 'ভয়েস এজেন্ট',
  'voice.desc':
    'স্বাভাবিক বাংলা ও ইংরেজি ফোন এজেন্ট — কল ধরে, অর্ডার কনফার্ম করে, ক্যাশ-অন-ডেলিভারি ফলোআপ করে এবং প্রয়োজনে মানুষকে হ্যান্ডওভার করে।',
  'chat.title': 'চ্যাট এজেন্ট',
  'chat.desc':
    'ওয়েবসাইট, মেসেঞ্জার ও হোয়াটসঅ্যাপ চ্যাট — পণ্যের প্রশ্নের উত্তর দেয়, সাজেশন দেয় এবং কথোপকথনের ভেতরেই বিক্রি সম্পন্ন করে।',
  'commerce.title': 'কমার্স ও ইনভেন্টরি',
  'commerce.desc':
    'স্টক, ভ্যারিয়েন্ট, দাম ও অর্ডার স্ট্যাটাসে লাইভ অ্যাক্সেস — যা নেই তা এজেন্ট কখনো প্রতিশ্রুতি দেবে না।',
  'webhooks.title': 'ওয়েবহুক ও এপিআই',
  'webhooks.desc':
    'প্রতিটি কল, চ্যাট, অর্ডার ও স্টক ইভেন্ট রিয়েল টাইমে আপনার সিস্টেমে পাঠান, অথবা নিজের ব্যাকএন্ড থেকে এজেন্টকে চালান।',

  'features.title': 'বাংলাদেশি কমার্সের জন্য তৈরি',
  'features.1.title': 'বাংলা-প্রথম বোঝাপড়া',
  'features.1.desc': 'বাস্তব বাংলা কথা, বাংলিশ টাইপিং এবং স্থানীয় ঠিকানা ও পেমেন্ট শব্দভাণ্ডারে প্রশিক্ষিত।',
  'features.2.title': 'রিয়েলটাইম লেটেন্সি',
  'features.2.desc': 'এক সেকেন্ডের কম উত্তর — কল মনে হয় সত্যিকারের কথোপকথন, মেনু নয়।',
  'features.3.title': 'স্টক-সচেতন উত্তর',
  'features.3.desc': 'কথা বলার আগেই এজেন্ট আপনার ইনভেন্টরি পড়ে নেয়, তাই দাম ও স্টক সবসময় সঠিক।',
  'features.4.title': 'মানুষে হ্যান্ডওভার',
  'features.4.desc': 'পুরো ট্রান্সক্রিপ্ট, কাস্টমার প্রোফাইল ও কার্টসহ আপনার টিমে পাঠিয়ে দিন।',
  'features.5.title': 'সব ইভেন্ট, সব জায়গায়',
  'features.5.desc': 'অর্ডার, লো-স্টক, মিসড কল, রিফান্ড ও সেন্টিমেন্টের জন্য সাইনড ওয়েবহুক।',
  'features.6.title': 'ডিফল্টে নিরাপদ',
  'features.6.desc': 'স্কোপড এপিআই কী, এজেন্টভিত্তিক পারমিশন এবং প্রতিটি কাজের অডিট লগ।',

  'how.title': 'তিন ধাপে লাইভ',
  'how.1.title': 'দোকান যুক্ত করুন',
  'how.1.desc': 'ক্যাটালগ, স্টক ও অর্ডার SalesDaddy-তে যুক্ত করুন — অথবা এপিআই দিয়ে পাঠান।',
  'how.2.title': 'এজেন্ট সাজান',
  'how.2.desc': 'ভয়েস বাছুন, বাংলা/ইংরেজি বা দুটোই নির্বাচন করুন, আর ব্র্যান্ডের নিয়ম লিখে দিন।',
  'how.3.title': 'লাইভ করুন ও শুনুন',
  'how.3.desc': 'ফোন, ওয়েব ও চ্যাট অ্যাপে চালু করুন, তারপর ট্রান্সক্রিপ্ট ও কনভার্সন দেখুন।',

  'pricing.title': 'কথোপকথন অনুযায়ী মূল্য',
  'pricing.subtitle': 'ফ্রি শুরু করুন। এজেন্ট কাজ করলেই কেবল খরচ।',
  'pricing.month': '/মাস',
  'pricing.cta': 'প্ল্যান নিন',
  'pricing.starter': 'স্টার্টার',
  'pricing.growth': 'গ্রোথ',
  'pricing.scale': 'এন্টারপ্রাইজ',
  'pricing.popular': 'সবচেয়ে জনপ্রিয়',
  'pricing.custom': 'কাস্টম',

  'cta.title': 'আপনার দোকানের জন্য এমন ড্যাডি যে কখনো ঘুমায় না',
  'cta.subtitle': 'এক বিকেলেই প্রথম বাংলা ভয়েস এজেন্ট চালু করুন।',
  'cta.button': 'ফ্রি শুরু করুন',

  'footer.product': 'প্রোডাক্ট',
  'footer.company': 'কোম্পানি',
  'footer.resources': 'রিসোর্স',
  'footer.tagline': 'বাংলা ও ইংরেজিভাষী ব্যবসার জন্য এআই ভয়েস, চ্যাট ও কমার্স এজেন্ট।',
  'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।',
  'footer.about': 'আমাদের সম্পর্কে',
  'footer.careers': 'ক্যারিয়ার',
  'footer.blog': 'ব্লগ',
  'footer.status': 'স্ট্যাটাস',
  'footer.privacy': 'প্রাইভেসি',
  'footer.terms': 'শর্তাবলী',

  'page.usecases': 'যা সামলায়',
  'page.capabilities': 'সক্ষমতা',
  'page.back': 'সব সমাধান',
};

const dictionaries: Record<Lang, Dict> = { en, bn };

export const languages: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
];

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem('salesdaddy-lang');
    return stored === 'bn' || stored === 'en' ? stored : 'en';
  });

  useEffect(() => {
    window.localStorage.setItem('salesdaddy-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);
  const t = (key: string) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
