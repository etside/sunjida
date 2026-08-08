import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Button } from '@/components/ui/button';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CHAT_URL = `${SUPABASE_URL}/functions/v1/agent-chat`;

export function ChatWidget() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const conversationId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis ?? null;
  }, []);

  // Speak text aloud using browser TTS
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current || !text) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = /[\u0980-\u09FF]/.test(text) ? 'bn-BD' : 'en-US';
    utter.rate = 1.0;
    synthRef.current.speak(utter);
  }, [voiceEnabled]);

  // Start/stop speech recognition
  const toggleMic = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    const rec = new SR();
    rec.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, lang]);

  useEffect(() => {
    const fallback =
      lang === 'bn'
        ? 'হ্যালো! আমি SalesDaddy সহকারী। কীভাবে সাহায্য করতে পারি?'
        : 'Hi! I am the SalesDaddy assistant. How can I help you today?';

    void (async () => {
      try {
        const res = await fetch(CHAT_URL, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
        });
        if (!res.ok) throw new Error('bootstrap failed');
        const data = await res.json();
        setEnabled(data.is_enabled !== false);
        setGreeting((lang === 'bn' ? data.greeting_bn : data.greeting_en) || fallback);
      } catch {
        setEnabled(true);
        setGreeting(fallback);
      }
    })();
  }, [lang]);


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError(null);
    setInput('');
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setBusy(true);

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify({ messages: next, conversationId: conversationId.current }),
      });

      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error ?? 'The assistant is unavailable right now.');
      }
      conversationId.current = res.headers.get('X-Conversation-Id') || conversationId.current;

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
          try {
            const delta = JSON.parse(line.slice(6))?.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  role: 'assistant',
                  content: copy[copy.length - 1].content + delta,
                };
                return copy;
              });
            }
          } catch {
            /* partial frame */
          }
        }
      }
      // Auto-speak the full reply after streaming completes
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.content) {
          // Defer speak so state is settled
          setTimeout(() => speak(last.content), 100);
        }
        return prev;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!enabled) return null;

  const placeholder = lang === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Type your question...';
  const title = lang === 'bn' ? 'SalesDaddy সহকারী' : 'SalesDaddy Assistant';

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">বাংলা · English · 24/7</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVoiceEnabled((v) => !v)}
                  aria-label={voiceEnabled ? 'Mute voice' : 'Enable voice'}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                {greeting}
              </div>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground'
                      : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-sm text-secondary-foreground'
                  }
                >
                  {m.content || <Loader2 className="h-4 w-4 animate-spin" />}
                  {m.role === 'assistant' && m.content && voiceEnabled && (
                    <button
                      onClick={() => speak(m.content)}
                      aria-label="Read aloud"
                      className="ml-2 inline-block align-middle text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              {busy && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {lang === 'bn' ? 'টাইপ করছে...' : 'Typing...'}
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="flex items-center gap-2 border-t border-border px-3 py-3"
            >
              <button
                type="button"
                onClick={toggleMic}
                aria-label={listening ? 'Stop recording' : 'Start voice input'}
                className={`rounded-lg p-2 transition-colors ${
                  listening
                    ? 'bg-destructive text-destructive-foreground animate-pulse'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? (lang === 'bn' ? 'শুনছি...' : 'Listening...') : placeholder}
                aria-label={placeholder}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <Button type="submit" size="icon" disabled={busy || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </>
  );
}
