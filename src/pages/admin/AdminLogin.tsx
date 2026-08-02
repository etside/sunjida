import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSuperPin } from '@/hooks/useSuperPin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEOHead } from '@/components/seo/SEOHead';
import { Logo } from '@/components/brand/Logo';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { verify } = useSuperPin();
  const [step, setStep] = useState<'pin' | 'auth'>('pin');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 5) {
      setPinError('PIN must be 5 digits');
      return;
    }
    if (verify(pin)) {
      toast.success('PIN verified');
      setPin('');
      setPinError('');
      setStep('auth');
    } else {
      setPinError('Invalid PIN');
      setPin('');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password required');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    }
  };

  return (
    <>
      <SEOHead title="Admin Login | SalesDaddy" description="Super admin access to SalesDaddy control panel" />

      <div className="min-h-screen flex items-center justify-center bg-secondary/20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <Logo />
            <div className="mt-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-light tracking-wide">Super Admin Access</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === 'pin' ? 'Enter your 5-digit PIN to continue' : 'Sign in with your admin credentials'}
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            {step === 'pin' ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-pin">PIN Code</Label>
                  <div className="relative">
                    <Input
                      id="admin-pin"
                      type={showPin ? 'text' : 'password'}
                      placeholder="\u2022\u2022\u2022\u2022\u2022"
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setPin(val);
                        setPinError('');
                      }}
                      maxLength={5}
                      className={`text-center text-lg tracking-[0.5em] pr-10 ${pinError ? 'border-destructive' : ''}`}
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
                  {pinError && <p className="text-sm text-destructive">{pinError}</p>}
                </div>
                <Button type="submit" className="w-full">Verify PIN</Button>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@salesdaddy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sign In
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep('pin'); setEmail(''); setPassword(''); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to PIN
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <a href="/auth" className="hover:text-foreground transition-colors">
              Tenant login \u2192
            </a>
          </p>
        </motion.div>
      </div>
    </>
  );
}
