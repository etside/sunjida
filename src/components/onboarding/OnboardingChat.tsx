import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Step {
  id: string;
  question: string;
  type: 'text' | 'confirm';
  field?: string;
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 'identity',
    question:
      "Welcome! To secure your data, please verify the full name of your authorized signatory and your business registration number.",
    type: 'text',
    field: 'business_name',
  },
  {
    id: 'spreadsheet',
    question:
      "I see you might use spreadsheets for inventory. How often does your sales team accidentally sell out-of-stock items?",
    type: 'text',
    field: 'pain_point',
  },
  {
    id: 'dialect',
    question:
      "What local dialects or slang do your customers use that generic bots fail to understand?",
    type: 'text',
    field: 'sales_daddy_prompt',
  },
  {
    id: 'demo',
    question:
      "Let me prove the system works! I'll query your inventory. Can you share a sample product name or category from your catalog?",
    type: 'text',
    field: 'demo_query',
  },
  {
    id: 'ready',
    question:
      "All set! I've configured your AI agent with the cultural context and product knowledge you provided. Ready to go to your dashboard?",
    type: 'confirm',
  },
];

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

export function OnboardingChat({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: ONBOARDING_STEPS[0].question,
    },
  ]);
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setResponses((prev) => ({
      ...prev,
      [ONBOARDING_STEPS[currentStep].field || '']: input.trim(),
    }));
    setInput('');
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 1000));

    const nextStep = currentStep + 1;

    if (nextStep < ONBOARDING_STEPS.length) {
      const nextMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: ONBOARDING_STEPS[nextStep].question,
      };
      setMessages((prev) => [...prev, nextMsg]);
      setCurrentStep(nextStep);
    }

    setIsProcessing(false);
  };

  const handleComplete = async () => {
    // Save onboarding config to tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (profile?.tenant_id) {
      await supabase.from('tenants').update({
        sales_daddy_prompt: responses.sales_daddy_prompt || '',
        name: responses.business_name || 'My Business',
        onboarding_completed: true,
      }).eq('id', profile.tenant_id);
    }

    onComplete();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-4"
      >
        {/* Progress */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold">Welcome to SalesDaddy</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </p>
          <div className="flex gap-1.5 justify-center mt-3">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < currentStep
                    ? 'w-8 bg-primary'
                    : i === currentStep
                    ? 'w-8 bg-primary/60'
                    : 'w-4 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="border border-border rounded-2xl bg-card shadow-lg overflow-hidden">
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.role === 'assistant' && (
                      <Bot className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'user' && (
                      <User className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.1s]" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            {step?.type === 'confirm' ? (
              <Button onClick={handleComplete} className="w-full" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  size="icon"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
