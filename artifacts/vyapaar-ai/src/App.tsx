import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useState, useEffect } from "react";
import { translateText } from "./services/translationService";
if (typeof window !== "undefined") {
  (window as any).translateText = translateText;
}

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
const AICeoCommandCenterPage = lazy(() => import("./pages/AICeoCommandCenterPage"));
const MissionManagementPage = lazy(() => import("./pages/MissionManagementPage"));
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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function DashboardController() {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("vyapaar_homepage_mode") || "ai-ceo";
  });

  const handleToggle = (mode: string) => {
    localStorage.setItem("vyapaar_homepage_mode", mode);
    setViewMode(mode);
    window.dispatchEvent(new Event("homepage_mode_changed"));
  };

  useEffect(() => {
    const listener = () => {
      setViewMode(localStorage.getItem("vyapaar_homepage_mode") || "ai-ceo");
    };
    window.addEventListener("homepage_mode_changed", listener);
    return () => window.removeEventListener("homepage_mode_changed", listener);
  }, []);

  if (viewMode === "dashboard") {
    return <DashboardPage onToggleView={handleToggle} currentMode={viewMode} />;
  }
  return <AICeoCommandCenterPage onToggleView={handleToggle} currentMode={viewMode} />;
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
              <DashboardController />
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </Route>

      <Route path="/missions">
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <MissionManagementPage />
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
