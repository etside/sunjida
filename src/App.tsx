import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { SuperPinProvider } from "@/hooks/useSuperPin";

import { Layout } from "@/components/layout/Layout";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { LoadingFallback } from "@/components/ui/LoadingFallback";
import { PageTransition } from "@/components/ui/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SuperPinGuard } from "@/components/admin/SuperPinGuard";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";

// Code-split route components
const Home = lazy(() => import("./pages/Home"));
import { AppLayout } from "@/components/app/AppLayout";
const SolutionPage = lazy(() => import("./pages/SolutionPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Docs = lazy(() => import("./pages/Docs"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Account = lazy(() => import("./pages/Account"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AgentSettings = lazy(() => import("./pages/admin/AgentSettings"));
const AgentAnalytics = lazy(() => import("./pages/admin/AgentAnalytics"));
const AppOnboarding = lazy(() => import("./pages/app/Onboarding"));
const AppOverview = lazy(() => import("./pages/app/Overview"));
const AppLeads = lazy(() => import("./pages/app/Leads"));
const AppTraining = lazy(() => import("./pages/app/Training"));
const AppIntegration = lazy(() => import("./pages/app/Integration"));
const AppChannels = lazy(() => import("./pages/app/Channels"));
const AppSocialConnections = lazy(() => import("./pages/app/SocialConnections"));
const AppAiProviders = lazy(() => import("./pages/app/AiProviders"));
const AppInventory = lazy(() => import("./pages/app/Inventory"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <ErrorBoundary scope={location.pathname} key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/solutions/:slug" element={<PageTransition><SolutionPage /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/docs" element={<PageTransition><Docs /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin" element={<SuperPinGuard><AdminLayout /></SuperPinGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="agent" element={<AgentSettings />} />
          <Route path="analytics" element={<AgentAnalytics />} />
        </Route>
        <Route path="/app/onboarding" element={<AppOnboarding />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<AppOverview />} />
          <Route path="leads" element={<AppLeads />} />
          <Route path="training" element={<AppTraining />} />
          <Route path="integration" element={<AppIntegration />} />
          <Route path="channels" element={<AppChannels />} />
          <Route path="connections" element={<AppSocialConnections />} />
          <Route path="ai-providers" element={<AppAiProviders />} />
          <Route path="inventory" element={<AppInventory />} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
      </ErrorBoundary>
    </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SuperPinProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SkipToContent />
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <AnimatedRoutes />
                  </Suspense>
                </Layout>
              </BrowserRouter>
            </TooltipProvider>
          </SuperPinProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
