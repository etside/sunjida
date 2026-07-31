import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '@/components/agent/ChatWidget';

interface LayoutProps {
  children: ReactNode;
}

/** Routes that render their own hero spacing under the fixed header */
const FULL_BLEED = ['/', '/pricing', '/docs'];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const path = location.pathname;
  const fullBleed = FULL_BLEED.includes(path) || path.startsWith('/solutions/');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        id="main-content"
        className={`flex-1 ${fullBleed ? '' : 'pt-16'}`}
        tabIndex={-1}
      >
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>

  );
}
