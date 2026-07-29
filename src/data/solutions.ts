import { Mic, MessagesSquare, Boxes, Webhook, LucideIcon } from 'lucide-react';
import type { Lang } from '@/i18n/LanguageProvider';

export interface Solution {
  slug: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  bullets: Record<Lang, string[]>;
  useCases: Record<Lang, string[]>;
}

export const solutions: Solution[] = [
  {
    slug: 'voice-agent',
    icon: Mic,
    titleKey: 'voice.title',
    descKey: 'voice.desc',
    bullets: {
      en: [
        'Natural Bangla and English speech with local accents',
        'Inbound and outbound calling with call recording',
        'Order confirmation, COD verification and delivery follow-up',
        'Instant human handoff with full context',
        'Barge-in support so customers can interrupt naturally',
      ],
      bn: [
        'স্থানীয় উচ্চারণে স্বাভাবিক বাংলা ও ইংরেজি স্পিচ',
        'ইনবাউন্ড ও আউটবাউন্ড কল, কল রেকর্ডিংসহ',
        'অর্ডার কনফার্মেশন, ক্যাশ-অন-ডেলিভারি যাচাই ও ফলোআপ',
        'পূর্ণ প্রেক্ষাপটসহ তাৎক্ষণিক মানব হ্যান্ডওভার',
        'কাস্টমার মাঝপথে কথা বললেও এজেন্ট বুঝে নেয়',
      ],
    },
    useCases: {
      en: ['Order confirmation calls', 'Missed-call callbacks', 'Delivery reminders', 'After-sales support'],
      bn: ['অর্ডার কনফার্মেশন কল', 'মিসড কল ফিরতি কল', 'ডেলিভারি রিমাইন্ডার', 'বিক্রয়োত্তর সেবা'],
    },
  },
  {
    slug: 'chat-agent',
    icon: MessagesSquare,
    titleKey: 'chat.title',
    descKey: 'chat.desc',
    bullets: {
      en: [
        'Website widget, Messenger and WhatsApp in one agent',
        'Understands Bangla, English and mixed Banglish typing',
        'Product recommendations pulled from your live catalog',
        'Cart building and checkout links inside the chat',
        'Rich cards for products, orders and delivery status',
      ],
      bn: [
        'ওয়েবসাইট উইজেট, মেসেঞ্জার ও হোয়াটসঅ্যাপ — এক এজেন্টে',
        'বাংলা, ইংরেজি ও মেশানো বাংলিশ টাইপিং বোঝে',
        'লাইভ ক্যাটালগ থেকে পণ্যের সাজেশন',
        'চ্যাটের ভেতরেই কার্ট ও চেকআউট লিংক',
        'পণ্য, অর্ডার ও ডেলিভারির জন্য রিচ কার্ড',
      ],
    },
    useCases: {
      en: ['Pre-purchase questions', 'Size and stock checks', 'Order tracking', 'Return requests'],
      bn: ['কেনার আগের প্রশ্ন', 'সাইজ ও স্টক যাচাই', 'অর্ডার ট্র্যাকিং', 'রিটার্ন অনুরোধ'],
    },
  },
  {
    slug: 'commerce',
    icon: Boxes,
    titleKey: 'commerce.title',
    descKey: 'commerce.desc',
    bullets: {
      en: [
        'Read and write stock levels per variant and warehouse',
        'Price, discount and campaign awareness in every reply',
        'Reserve inventory the moment an agent closes a sale',
        'Low-stock and restock alerts pushed to your team',
        'Works with your existing store tables or a CSV sync',
      ],
      bn: [
        'ভ্যারিয়েন্ট ও গুদাম অনুযায়ী স্টক পড়া ও আপডেট',
        'প্রতিটি উত্তরে দাম, ডিসকাউন্ট ও ক্যাম্পেইনের হিসাব',
        'বিক্রি নিশ্চিত হলেই ইনভেন্টরি রিজার্ভ',
        'লো-স্টক ও রিস্টক অ্যালার্ট টিমের কাছে',
        'বিদ্যমান স্টোর টেবিল বা সিএসভি সিংকে কাজ করে',
      ],
    },
    useCases: {
      en: ['Live availability answers', 'Automatic reservation', 'Restock planning', 'Multi-warehouse routing'],
      bn: ['লাইভ স্টকের উত্তর', 'স্বয়ংক্রিয় রিজার্ভেশন', 'রিস্টক পরিকল্পনা', 'মাল্টি-ওয়্যারহাউস রাউটিং'],
    },
  },
  {
    slug: 'webhooks',
    icon: Webhook,
    titleKey: 'webhooks.title',
    descKey: 'webhooks.desc',
    bullets: {
      en: [
        'Signed webhooks with retries and delivery logs',
        'Events for calls, chats, orders, stock and sentiment',
        'REST API to create agents, campaigns and knowledge',
        'Scoped API keys with per-agent permissions',
        'Sandbox environment for safe testing',
      ],
      bn: [
        'রিট্রাই ও ডেলিভারি লগসহ সাইনড ওয়েবহুক',
        'কল, চ্যাট, অর্ডার, স্টক ও সেন্টিমেন্ট ইভেন্ট',
        'এজেন্ট, ক্যাম্পেইন ও নলেজ তৈরির REST API',
        'এজেন্টভিত্তিক পারমিশনসহ স্কোপড এপিআই কী',
        'নিরাপদ পরীক্ষার জন্য স্যান্ডবক্স এনভায়রনমেন্ট',
      ],
    },
    useCases: {
      en: ['ERP sync', 'Custom dashboards', 'CRM enrichment', 'Accounting automation'],
      bn: ['ইআরপি সিংক', 'কাস্টম ড্যাশবোর্ড', 'সিআরএম সমৃদ্ধকরণ', 'হিসাব স্বয়ংক্রিয়করণ'],
    },
  },
];

export const getSolution = (slug?: string) => solutions.find((s) => s.slug === slug);
