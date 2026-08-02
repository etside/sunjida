import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useSuperPin } from '@/hooks/useSuperPin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function SuperPinGuard({ children }: { children: React.ReactNode }) {
  const { verified, verify } = useSuperPin();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  if (verified) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 5) {
      setError('PIN must be 5 digits');
      return;
    }
    if (verify(pin)) {
      toast.success('Access granted');
      setPin('');
      setError('');
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-1">Super Admin Access</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter your 5-digit PIN to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPin ? 'text' : 'password'}
                placeholder="•••••"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setPin(val);
                  setError('');
                }}
                maxLength={5}
                className={`text-center text-lg tracking-[0.5em] pr-10 ${error ? 'border-destructive' : ''}`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Verify PIN
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
