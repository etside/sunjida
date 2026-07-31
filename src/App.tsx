import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { Layout } from "@/components/layout/Layout";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { LoadingFallback } from "@/components/ui/LoadingFallback";
import { PageTransition } from "@/components/ui/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";

// Code-split route components
const Home = lazy(() => import("./pages/Home"));
const SolutionPage = lazy(() => import("./pages/SolutionPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Docs = lazy(() => import("./pages/Docs"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AgentSettings = lazy(() => import("./pages/admin/AgentSettings"));
const AgentAnalytics = lazy(() => import("./pages/admin/AgentAnalytics"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/solutions/:slug" element={<PageTransition><SolutionPage /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/docs" element={<PageTransition><Docs /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/product/:slug" element={<PageTransition><ProductDetailPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/order-success" element={<PageTransition><OrderSuccess /></PageTransition>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="agent" element={<AgentSettings />} />
        </Route>


        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
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
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
