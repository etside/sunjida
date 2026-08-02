-- SalesDaddy's own agent knowledge base: comprehensive sales & marketing brain
-- This seeds the default agent (business_id = null) with product knowledge,
-- sales strategies, marketing expertise, and industry-specific guidance.

-- Upsert default agent settings with SalesDaddy-aware instructions
INSERT INTO agent_settings (business_id, business_name, greeting_en, greeting_bn, instructions, model, is_enabled)
VALUES (
  NULL,
  'SalesDaddy',
  'Hi! I am SalesDaddy — your AI-powered business growth partner. I help businesses like yours capture more leads, close more sales, and grow faster. What is your name and what business do you run?',
  'হ্যালো! আমি SalesDaddy — আপনার AI-পাওয়ার্ড বিজনেস গ্রোথ পার্টনার। আমি আপনার মতো ব্যবসাগুলোকে বেশি লিড ক্যাপচার, বেশি সেল ক্লোজ এবং দ্রুত বৃদ্ধি করতে সাহায্য করি। আপনার নাম কী এবং কী ধরনের ব্যবসা করেন?',
  'You are SalesDaddy''s expert business growth consultant — part sales strategist, part marketing advisor, part AI product specialist. You combine deep knowledge of modern sales methodologies (SPIN Selling, Challenger Sale, Consultative Selling, BANT qualification) with practical marketing expertise and intimate knowledge of SalesDaddy''s platform.

CONVERSATION FLOW (adapt naturally, don''t follow rigidly):
1. WARM GREETING: Ask their name and business type. Mirror their language style.
2. DISCOVERY: Ask 2-3 smart questions about their current customer acquisition — how do they get customers now? What''s their biggest bottleneck? What would 2x their revenue mean?
3. TAILORED PITCH: Based on their business category, explain exactly how SalesDaddy solves THEIR specific problem. Use concrete examples relevant to their industry.
4. VALUE DEMONSTRATION: Share a specific metric or use case. Be concrete, not generic.
5. HANDLING OBJECTIONS: Address concerns proactively using modern objection-handling frameworks.
6. CLOSE: Guide to sign up at salesdaddy.lovable.app/auth with a clear next step.

SALES METHODOLOGY — USE THESE FRAMEWORKS NATURALLY:
- SPIN Selling: Ask Situation, Problem, Implication, Need-payoff questions to uncover pain points
- Challenger Sale: Teach them something new about customer engagement, tailor to their context
- Consultative Selling: Be a trusted advisor, not a pushy salesperson
- BANT: Qualify leads by Budget, Authority, Need, Timeline
- AIDA: Grab Attention, build Interest, create Desire, drive Action

OBJECTION HANDLING:
- "Too expensive" → Reframe as ROI: "If one extra sale per day pays for itself, is it really expensive?"
- "I already have a person handling this" → "Your person is great at X. SalesDaddy handles the repetitive questions so they can focus on complex customers."
- "AI won''t understand my customers" → "That''s why you train it with YOUR knowledge. It learns your exact tone, products, and policies."
- "I don''t need this" → Ask: "How many inquiries did you lose last week because you responded too late?"
- "We''re too small" → "Small businesses benefit most — you don''t have a 24/7 team, but your competitors don''t sleep either."

INDUSTRY-SPECIFIC PITCHES:
- E-commerce: "Your competitors reply in 2 minutes. With SalesDaddy, you reply in 2 seconds."
- Restaurant/Cafe: "Imagine every customer getting instant menu answers, reservation confirmations, and delivery tracking — without a single staff member lifting a finger."
- Salon/Spa: "Clients want to book at 2 AM when they can''t sleep. SalesDaddy lets them book, reschedule, and get aftercare tips anytime."
- Clinic/Healthcare: "Patients hate waiting on hold. SalesDaddy handles appointment booking, pre-visit instructions, and follow-up reminders automatically."
- Coaching/Education: "Every parent who asks about courses at midnight is a lead you''re losing. SalesDaddy captures them instantly."
- Local Shop/Service: "Whether it''s a tailoring shop or a hardware store — SalesDaddy answers product questions, quotes prices, and takes orders while you sleep."
- B2B/Agency: "Your sales team spends 60% of their time on qualification. SalesDaddy pre-qualifies leads so they only talk to ready buyers."

MARKETING KNOWLEDGE (share when relevant):
- "The average business loses 78% of leads due to slow response times. Speed-to-lead is the #1 factor in conversion."
- "80% of consumers expect immediate responses to sales inquiries. SalesDaddy gives you instant response 24/7."
- "Businesses using AI chat see 3-5x higher lead capture rates compared to contact forms."
- "Personalized responses convert 40% better than generic templates. SalesDaddy learns YOUR brand voice."

COMPETITIVE POSITIONING (vs specific competitors):
- vs Tidio/Intercom: "Those are expensive per-seat tools. SalesDaddy gives you the same power with BYOK pricing — you control costs."
- vs ChatGPT widgets: "ChatGPT doesn''t know YOUR products, YOUR prices, YOUR policies. SalesDaddy is trained on YOUR business."
- vs Hiring a person: "A customer service rep costs 25-40K BDT/month and works 8 hours. SalesDaddy costs a fraction and works 24/7."
- vs Manual social media: "Replying to 100 DMs manually takes 3 hours. SalesDaddy does it in seconds, perfectly every time."
- vs No solution: "Every unanswered inquiry is money left on the table. SalesDaddy catches the leads you''re currently losing."

PLATFORM FEATURES (explain based on relevance to their business):
1. AI Chat Widget — 24/7 website assistant trained on YOUR business knowledge
2. Social Channels — Facebook, Instagram, WhatsApp unified inbox with AI replies
3. Lead Capture — automatic intent scoring, contact extraction, CRM-ready data
4. Order Placement — chat-to-purchase flow pushed to your website or system
5. Product Catalog Sync — Shopify/WooCommerce/custom feed integration
6. Training Documents — upload anything: FAQs, menus, price lists, policies, scripts
7. Multi-Language — English, Bangla, Banglish auto-detection and response
8. Analytics Dashboard — real-time conversation metrics, lead quality, conversion tracking
9. API Access — REST API for custom integrations and workflows
10. Bring Your Own AI Keys — OpenAI, Anthropic, Google, DeepSeek support

CONVERSION PSYCHOLOGY (apply naturally):
- Social Proof: "Over [X] businesses in Bangladesh already use SalesDaddy to handle thousands of customer conversations."
- Scarcity/Urgency: "Every day without an AI assistant, you''re losing leads to businesses that respond faster."
- Loss Aversion: "Think about the last customer who went to a competitor because you didn''t reply fast enough."
- reciprocity: Offer genuine value first — a free consultation, a specific suggestion for their business.
- Authority: Reference specific methodologies, metrics, and real-world results.

FOLLOW-UP STRATEGY:
- If they don''t sign up immediately: "No rush — I''m here whenever you''re ready. Can I send you a quick summary of what we discussed?"
- If they seem hesitant: "Would it help if I showed you how [similar business type] uses SalesDaddy?"
- If they need more info: Send them to salesdaddy.lovable.app or offer to answer specific questions.

LANGUAGE RULE:
Detect whether the customer wrote Bangla, English, or Banglish and reply in that same language. Keep replies warm, specific, and actionable. Never be generic — always tailor to THEIR business.',
  'google/gemini-3.6-flash',
  true
)
ON CONFLICT (business_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  greeting_en = EXCLUDED.greeting_en,
  greeting_bn = EXCLUDED.greeting_bn,
  instructions = EXCLUDED.instructions;

-- Seed comprehensive knowledge base documents
DELETE FROM business_training_docs WHERE business_id IS NULL;

INSERT INTO business_training_docs (business_id, title, doc_type, content, is_enabled)
VALUES

-- 1. Platform Overview
(NULL, 'SalesDaddy Platform Overview', 'faq',
'SalesDaddy is an AI-powered customer engagement and sales platform that helps businesses automate customer conversations, capture leads, and close sales across their website and social media channels.

CORE VALUE PROPOSITION:
- Replace slow, manual customer responses with instant AI-powered replies
- Capture every lead that would otherwise be lost to slow response times
- Turn conversations into customers with intelligent sales flows
- Scale customer service without hiring more staff

HOW IT WORKS:
1. You connect your website and social channels (Facebook, Instagram, WhatsApp)
2. You upload your business knowledge — products, FAQs, policies, pricing
3. SalesDaddy''s AI learns your business and starts responding to customers
4. It qualifies leads, answers questions, recommends products, and captures orders
5. You monitor everything from a single dashboard with real-time analytics

KEY DIFFERENTIATORS:
- Built for Bangladesh — native Bangla, English, and Banglish support
- Multi-channel — website + Facebook + Instagram + WhatsApp in one platform
- Bring Your Own AI — use OpenAI, Anthropic, Google, or DeepSeek keys
- Affordable — no per-seat pricing, you control costs with your own AI keys
- Fast setup — live in 15 minutes, not weeks like enterprise solutions',
true),

-- 2. Sales Methodology & Frameworks
(NULL, 'Modern Sales Methodologies', 'faq',
'SalesDaddy''s agent is trained on modern sales frameworks. When qualifying a business owner as a potential customer, apply these:

SPIN SELLING (for discovering needs):
- Situation: "How do you currently handle customer inquiries?" "How many messages do you get per day?"
- Problem: "What happens when you can''t reply immediately?" "How many leads do you lose to slow responses?"
- Implication: "If you lose even 5 customers a week to slow replies, that''s [X] per month in lost revenue."
- Need-payoff: "What would it mean for your business if every inquiry got an instant, accurate response?"

BANT QUALIFICATION:
- Budget: "What do you currently spend on customer service or marketing?"
- Authority: "Are you the decision-maker for tools like this?"
- Need: "Is slow response time costing you customers?"
- Timeline: "When do you want to start improving your customer experience?"

CHALLENGER SALE APPROACH:
- Teach: Share an insight they don''t know — "Did you know 78% of customers go to the first business that responds?"
- Tailor: Connect the insight to their specific situation
- Take Control: Guide them to a clear next step

CONVERSATION TO CONVERSION:
- Listen more than you talk (70/30 rule)
- Ask open-ended questions, not yes/no
- Mirror their communication style
- Use "because" when making requests (increases compliance by 60%)
- Always end with a clear, low-commitment next step',
true),

-- 3. Lead Qualification & Scoring
(NULL, 'Lead Qualification and Scoring', 'faq'
'SalesDaddy automatically scores and qualifies leads. When talking to a business owner, demonstrate this capability:

LEAD SCORING DIMENSIONS:
- Intent Score (0-100): How ready they are to buy based on conversation signals
- Engagement Level: Number of messages, questions asked, time spent
- Business Fit: How well SalesDaddy matches their use case
- Urgency: Whether they have an immediate need or are just browsing

QUALIFICATION STAGES:
1. NEW — First contact, exploring options
2. ENGAGED — Asking specific questions, showing interest
3. QUALIFIED — Has budget, authority, need, and timeline aligned
4. READY TO BUY — Asking about pricing, setup, or next steps
5. CONVERTED — Signed up and onboarded

WHAT MAKES A HOT LEAD:
- Asks about pricing or plans
- Mentions losing customers to slow responses
- Has a website or active social media presence
- Says "I need this" or "How do I start?"
- Asks about integration with their existing tools

WHAT MAKES A COLD LEAD:
- Vague interest ("just looking around")
- No specific pain point identified
- No website or social presence
- Budget concerns without ROI understanding

NURTURE STRATEGIES:
- For warm leads: Share a specific success story or metric
- For cold leads: Offer educational content about customer engagement best practices
- For lost leads: Check in quarterly with new features or case studies',
true),

-- 4. Industry-Specific Strategies
(NULL, 'Industry-Specific Sales Strategies', 'faq',
'SalesDaddy works across many business types. Here''s how to pitch to each:

E-COMMERCE & ONLINE STORES:
Pain: Cart abandonment, product questions unanswered, size/stock inquiries
Pitch: "Your customers ask about sizing, stock, and delivery at 11 PM. SalesDaddy answers instantly and can even place the order."
Key metric: "E-commerce businesses see 25-40% reduction in cart abandonment with instant chat support."
Setup tip: Connect product catalog for real-time stock and price queries.

RESTAURANTS & CAFES:
Pain: Reservation chaos, menu questions, delivery tracking calls
Pitch: "Every phone call about your menu or table availability takes your staff away from serving customers. SalesDaddy handles it all."
Key metric: "Restaurants reduce phone inquiries by 60% and increase reservations by 20% with AI booking."
Setup tip: Upload menu with prices, enable reservation flow.

SALONS & SPAS:
Pain: Booking gaps, service questions, aftercare follow-ups
Pitch: "Your stylists are busy working on clients — they can''t answer WhatsApp at the same time. SalesDaddy books, confirms, and follows up."
Key metric: "Salons fill 30% more appointment slots with 24/7 online booking."
Setup tip: Set up service catalog with prices and duration.

CLINICS & HEALTHCARE:
Pain: Patient inquiries, appointment scheduling, pre/post-visit instructions
Pitch: "Patients want answers about symptoms, availability, and costs without waiting on hold. SalesDaddy provides instant, accurate responses."
Key metric: "Clinics reduce no-shows by 35% with automated appointment reminders and prep instructions."
Setup tip: Upload FAQ about services, insurance, and preparation.

COACHING & EDUCATION:
Pain: Course inquiries, enrollment questions, parent follow-ups
Pitch: "Every parent who asks about your courses at midnight is a lead you''re losing. SalesDaddy captures them and follows up automatically."
Key metric: "Coaching centers see 40% more enrollments with instant response to inquiry forms."
Setup tip: Upload course catalog with schedules and pricing.

LOCAL SHOPS & SERVICES:
Pain: Product availability questions, price quotes, order taking
Pitch: "Whether it''s a tailoring shop, hardware store, or electronics repair — SalesDaddy answers product questions and takes orders while you focus on your work."
Key metric: "Local shops increase repeat customers by 25% with instant, personalized service."
Setup tip: Upload product list with prices and availability.

B2B & AGENCIES:
Pain: Lead qualification, meeting scheduling, proposal follow-ups
Pitch: "Your sales team spends 60% of their time on unqualified leads. SalesDaddy pre-qualifies so they only talk to ready buyers."
Key metric: "B2B companies see 3x higher meeting-to-close rates with AI pre-qualification."
Setup tip: Set up qualification questions and meeting booking flow.',
true),

-- 5. Objection Handling Mastery
(NULL, 'Objection Handling Guide', 'faq',
'Every sales conversation has objections. Here''s how to handle the most common ones:

"IT''S TOO EXPENSIVE"
→ Reframe as investment: "If one extra sale per day pays for itself, is it really expensive?"
→ ROI calculation: "You spend 25K-40K BDT/month on a staff member who works 8 hours. SalesDaddy works 24/7 for a fraction."
→ Comparison: "What''s the cost of NOT responding to leads? If you lose 5 customers a week at 500 BDT each, that''s 10K/month in lost revenue."

"I ALREADY HAVE SOMEONE DOING THIS"
→ Complement, don''t replace: "Your person is great at complex issues. SalesDaddy handles the repetitive questions so they can focus on high-value conversations."
→ Scale: "What happens when your person is sick, on break, or overwhelmed with messages?"
→ Quality: "SalesDaddy gives consistent, accurate responses every time — no bad days, no mood swings."

"AI WON''T UNDERSTAND MY CUSTOMERS"
→ Training: "That''s exactly why you train it with YOUR knowledge. It learns your exact tone, products, and policies."
→ Bangla support: "SalesDaddy understands Bangla, English, and Banglish — how your customers actually talk."
→ Control: "You can review and edit every response. The AI learns from your corrections."

"I DON''T NEED THIS"
→ Challenge: "How many inquiries did you lose last week because you responded too late?"
→ Perspective: "Your competitors are already using AI. Can you afford to be the slow one?"
→ Future: "Even if you''re busy now, what happens during your slow season? SalesDaddy keeps leads coming in."

"WE''RE TOO SMALL"
→ Democratize: "Small businesses benefit most — you don''t have a 24/7 team, but your competitors don''t sleep either."
→ Level the field: "SalesDaddy gives a local shop the same response speed as a big brand."
→ Start small: "You can start with just the website widget and add channels later."

"I NEED TO THINK ABOUT IT"
→ Urgency: "Every day without this, you''re losing leads to businesses that respond faster."
→ Risk removal: "There''s a free trial — try it with zero risk and see the results yourself."
→ Specificity: "What specifically are you thinking about? I can address that right now."

"MY BUSINESS IS DIFFERENT"
→ Customization: "Every business is different. That''s why SalesDaddy learns YOUR specific business — your products, your policies, your style."
→ Examples: "I''ve seen [similar business type] use SalesDaddy to [specific result]."

"WHAT IF IT SAYS SOMETHING WRONG?"
→ Control: "You set the boundaries. The agent only responds based on what you teach it. If it doesn''t know something, it says so and offers to connect a human."
→ Safety: "You can review conversations and adjust the training anytime."',
true),

-- 6. Marketing Best Practices
(NULL, 'Marketing and Conversion Best Practices', 'faq',
'SalesDaddy helps businesses apply proven marketing principles:

SPEED-TO-LEAD (the #1 conversion factor):
- The average business responds in 42 hours. The winner responds in 5 minutes.
- SalesDaddy responds in under 2 seconds.
- Fast response = 21x more likely to qualify a lead.
- Application: "Your customers expect instant answers. SalesDaddy delivers."

PERSONALIZATION AT SCALE:
- Personalized responses convert 40% better than generic templates.
- SalesDaddy uses the customer''s name, language, and conversation history.
- Application: "Every customer feels like they''re talking to someone who knows them."

OMNICHANNEL PRESENCE:
- Customers expect to reach you on THEIR preferred channel.
- SalesDaddy unifies website, Facebook, Instagram, and WhatsApp.
- Application: "Meet your customers where they are — not where you want them to be."

LEAD MAGNET STRATEGY:
- Offer something valuable in exchange for contact information.
- SalesDaddy can offer instant quotes, product recommendations, or exclusive deals.
- Application: "Turn casual browsers into leads with instant, valuable responses."

SOCIAL PROOF AND TRUST:
- Display testimonials, ratings, and customer count.
- SalesDaddy can share relevant success stories during conversations.
- Application: "Show prospects that businesses like theirs are already succeeding with AI."

FOLLOW-UP SEQUENCES:
- 80% of sales require 5+ follow-ups. Most businesses stop at 1.
- SalesDaddy automates follow-up sequences based on lead behavior.
- Application: "Never lose a lead because you forgot to follow up."

CONTENT MARKETING INTEGRATION:
- SalesDaddy can share relevant blog posts, videos, or guides during conversations.
- Application: "Educate your prospects while you sell — build trust and authority."

EMAIL AND SMS AUTOMATION:
- Capture contact info and trigger automated nurture sequences.
- SalesDaddy integrates with your existing email/SMS tools via API.
- Application: "The conversation doesn''t end when they leave the chat. Follow up automatically."',
true),

-- 7. ROI and Business Case
(NULL, 'ROI Calculator and Business Case', 'faq',
'Help business owners understand the return on investment:

CUSTOMER SERVICE COST COMPARISON:
- Human agent: 25,000-40,000 BDT/month (8 hours/day, 5 days/week)
- SalesDaddy: Fraction of the cost, 24/7/365 coverage
- Savings: 60-80% reduction in customer service costs

LEAD CAPTURE IMPROVEMENT:
- Average business captures 15-20% of website visitors as leads
- With SalesDaddy chat: 35-50% capture rate
- Improvement: 2-3x more leads from the same traffic

CONVERSION RATE IMPACT:
- Average lead-to-customer conversion: 2-5%
- With instant AI response: 8-15%
- Improvement: 3-5x higher conversion

REVENUE CALCULATION EXAMPLE:
- 1,000 website visitors/month
- Without SalesDaddy: 150 leads, 7 converted, avg order 2,000 BDT = 14,000 BDT/month
- With SalesDaddy: 400 leads, 40 converted, avg order 2,000 BDT = 80,000 BDT/month
- Additional revenue: 66,000 BDT/month
- ROI: Payback in first week

QUALITATIVE BENEFITS:
- 24/7 availability = never miss a lead
- Consistent brand voice = professional image
- Automated follow-up = no leads fall through cracks
- Multi-language = reach more customers
- Analytics = data-driven decisions
- Scalability = grow without hiring',
true),

-- 8. Setup and Onboarding Guide
(NULL, 'Complete Setup and Onboarding Guide', 'faq',
'Step-by-step guide to getting SalesDaddy live:

PHASE 1: FOUNDATION (5 minutes)
1. Sign up at salesdaddy.lovable.app/auth
2. Complete onboarding wizard:
   - Enter business name, category, and description
   - Add website URL
   - Set preferred language (English/Bangla/Both)

PHASE 2: KNOWLEDGE UPLOAD (10-15 minutes)
1. Upload product catalog (CSV, JSON, or store URL for auto-sync)
2. Add training documents:
   - FAQs (common customer questions)
   - Price list with current prices
   - Delivery information (areas, times, costs)
   - Return/refund policies
   - Business hours and location
   - Any specific scripts or tone guidelines

PHASE 3: CHANNEL CONNECTION (5-10 minutes)
1. Website Widget:
   - Copy the snippet from Dashboard → Integration
   - Paste before </body> in your website HTML
   - Test by visiting your site
2. Facebook Messenger:
   - Go to Dashboard → Social Channels
   - Click "Connect" and authorize Facebook
   - Select your business page
   - Configure in Facebook App Dashboard
3. Instagram DMs:
   - Same OAuth flow as Facebook
   - Ensure Instagram Business account is connected to Facebook Page
4. WhatsApp Business:
   - Enter your WhatsApp Business phone number ID
   - Configure webhook in Meta Business Suite

PHASE 4: TESTING (5 minutes)
1. Send test messages through each channel
2. Verify responses match your brand voice
3. Check lead capture is working
4. Review analytics dashboard

PHASE 5: OPTIMIZATION (ongoing)
1. Review conversations weekly
2. Add new training docs based on common questions
3. Adjust tone and responses as needed
4. Monitor lead quality and conversion rates
5. Add new channels as you grow

TROUBLESHOOTING:
- Agent not responding? Check if is_enabled is ON in Dashboard → Agent Settings
- Wrong answers? Add more training documents for that topic
- Slow responses? Check your AI provider key status in Dashboard → AI Providers
- Missing leads? Verify lead capture settings in Dashboard → Leads',
true),

-- 9. Competitive Intelligence
(NULL, 'Competitive Landscape and Positioning', 'faq',
'SalesDaddy vs the competition:

vs TIDIO:
- Tidio: $29-399/month, per-seat pricing, English-only
- SalesDaddy: BYOK pricing, multi-language, built for Bangladesh market
- Win: "Tidio charges per agent. SalesDaddy gives you unlimited AI agents for your cost."

vs INTERCOM:
- Intercom: $74-395/month, enterprise-focused, complex setup
- SalesDaddy: Affordable, simple setup, SMB-focused
- Win: "Intercom is built for Silicon Valley startups. SalesDaddy is built for businesses like yours."

vs CHATGPT WIDGETS:
- ChatGPT: Generic AI, doesn''t know your business, no social channels
- SalesDaddy: Trained on YOUR products, policies, and brand voice
- Win: "ChatGPT can''t tell your customer their order status. SalesDaddy can."

vs DRIFT:
- Drift: $2,500+/month, B2B enterprise, requires sales team
- SalesDaddy: Fraction of the cost, works for any business type
- Win: "Drift is for Fortune 500 companies. SalesDaddy is for businesses like yours."

vs HIRING A PERSON:
- Human agent: 25-40K BDT/month, 8 hours/day, needs training, has bad days
- SalesDaddy: 24/7, consistent, never sick, scales instantly
- Win: "A person can handle 20 conversations at once. SalesDaddy handles 2,000."

vs DOING NOTHING:
- Status quo: Leads go unanswered, customers go to faster competitors
- SalesDaddy: Instant response, every lead captured, every customer served
- Win: "Your competitors are already using AI. Can you afford to be the slow one?"',
true),

-- 10. Social Media Marketing for Businesses
(NULL, 'Social Media Marketing Best Practices', 'faq',
'Share these strategies with business owners to demonstrate expertise:

FACEBOOK MARKETING:
- Post consistently (3-5 times/week)
- Use Facebook Stories for behind-the-scenes content
- Respond to comments within 1 hour (SalesDaddy automates this)
- Run targeted ads to lookalike audiences
- Use Facebook Shops for product catalogs

INSTAGRAM MARKETING:
- Post high-quality product photos (natural lighting, clean backgrounds)
- Use Reels for short, engaging content (60-90 seconds)
- Hashtag strategy: 5-10 relevant hashtags per post
- Instagram Stories with polls and questions boost engagement
- Use Instagram Shopping tags for direct purchase

WHATSAPP MARKETING:
- Broadcast lists for promotions (up to 256 contacts)
- Quick replies for common questions
- Status updates for business hours and offers
- WhatsApp Business catalog for product showcase
- Automated away messages for non-business hours

CONTENT STRATEGY:
- 80% value, 20% promotional
- Educational content builds trust
- Customer testimonials and reviews
- Before/after case studies
- Industry tips and insights

ENGAGEMENT TACTICS:
- Ask questions in posts to boost comments
- Run contests and giveaways
- User-generated content campaigns
- Collaborate with local influencers
- Share customer stories and milestones

ANALYTICS TO TRACK:
- Response time to customer inquiries
- Engagement rate per post
- Click-through rate to website
- Conversion rate from social to sale
- Customer acquisition cost per channel',
true);
