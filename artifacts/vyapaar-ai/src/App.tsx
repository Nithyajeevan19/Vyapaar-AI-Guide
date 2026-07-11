import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SkeletonCard } from "./components/SkeletonCard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { setBaseUrl, setUserIdGetter } from "@workspace/api-client-react";
import { auth } from "./firebase/config";

// Lazy-loaded page components
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LanguageSelectPage = lazy(() => import("./pages/LanguageSelectPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AIBusinessSetupPage = lazy(() => import("./pages/AIBusinessSetupPage"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const WebsitePage = lazy(() => import("./pages/WebsitePage"));
const WhatsAppPage = lazy(() => import("./pages/WhatsAppPage"));
const LearningPage = lazy(() => import("./pages/LearningPage"));
const SchemesPage = lazy(() => import("./pages/SchemesPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const MarketingPage = lazy(() => import("./pages/MarketingPage"));
const CRMPage = lazy(() => import("./pages/CRMPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const BillingOCRPage = lazy(() => import("./pages/BillingOCRPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

setBaseUrl(import.meta.env.VITE_API_URL || "https://vyapaar-ai-guide-1.onrender.com");

setUserIdGetter(() => {
  const mock = localStorage.getItem("vyapaar_mock_user");
  if (mock) {
    try {
      return JSON.parse(mock).uid;
    } catch {
      return "mock-user-1";
    }
  }
  return auth.currentUser?.uid || null;
});

const queryClient = new QueryClient();

// Page-level skeleton loader representing dashboard configurations
function PageLoader() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-2">
        <SkeletonCard className="h-10 w-1/3" />
        <SkeletonCard className="h-4 w-1/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-40" />
      </div>
      <SkeletonCard className="h-96 w-full" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Suspense fallback={<PageLoader />}>
          <LandingPage />
        </Suspense>
      </Route>

      <Route path="/login">
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </Route>

      <Route path="/languages">
        <Suspense fallback={<PageLoader />}>
          <LanguageSelectPage />
        </Suspense>
      </Route>

      {/* Protected Setup Wizard (requires user auth context) */}
      <Route path="/ai-setup">
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <AIBusinessSetupPage />
          </Suspense>
        </ProtectedRoute>
      </Route>

      {/* Standard Core Modules (requires user auth context) */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/website">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <WebsitePage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/whatsapp">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <WhatsAppPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/learning">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <LearningPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/schemes">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <SchemesPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/insights">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <InsightsPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/marketing">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <MarketingPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      {/* CRM and Profile modules */}
      <Route path="/crm">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <CRMPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/support">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <SupportPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/ocr-billing">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <BillingOCRPage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route>
        <Suspense fallback={<PageLoader />}>
          <NotFoundPage />
        </Suspense>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </WouterRouter>
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
