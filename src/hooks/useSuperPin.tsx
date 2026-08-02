import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

const PIN = '85677';
const STORAGE_KEY = 'salesdaddy_super_pin';
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

interface SuperPinContextType {
  verified: boolean;
  verify: (pin: string) => boolean;
  logout: () => void;
}

const SuperPinContext = createContext<SuperPinContextType | undefined>(undefined);

export function SuperPinProvider({ children }: { children: ReactNode }) {
  const [verified, setVerified] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    try {
      const { timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp > EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
  });

  const verify = useCallback((pin: string) => {
    if (pin === PIN) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
      setVerified(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setVerified(false);
  }, []);

  return (
    <SuperPinContext.Provider value={{ verified, verify, logout }}>
      {children}
    </SuperPinContext.Provider>
  );
}

export function useSuperPin() {
  const ctx = useContext(SuperPinContext);
  if (!ctx) throw new Error('useSuperPin must be used within SuperPinProvider');
  return ctx;
}
