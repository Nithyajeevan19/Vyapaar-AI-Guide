import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import LanguageSelectPage from "./pages/LanguageSelectPage";
import DashboardPage from "./pages/DashboardPage";
import AIBusinessSetupPage from "./pages/AIBusinessSetupPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFoundPage from "./pages/NotFoundPage";

import WebsitePage from "./pages/WebsitePage";
import WhatsAppPage from "./pages/WhatsAppPage";
import LearningPage from "./pages/LearningPage";
import SchemesPage from "./pages/SchemesPage";
import InsightsPage from "./pages/InsightsPage";
import MarketingPage from "./pages/MarketingPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      
      <Route path="/language">
        <ProtectedRoute>
          <LanguageSelectPage />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <Layout>
          <DashboardPage />
        </Layout>
      </Route>

      <Route path="/ai-setup">
        <Layout>
          <AIBusinessSetupPage />
        </Layout>
      </Route>

      <Route path="/website">
        <Layout>
          <WebsitePage />
        </Layout>
      </Route>
      
      <Route path="/whatsapp">
        <Layout>
          <WhatsAppPage />
        </Layout>
      </Route>
      
      <Route path="/learning">
        <Layout>
          <LearningPage />
        </Layout>
      </Route>
      
      <Route path="/schemes">
        <Layout>
          <SchemesPage />
        </Layout>
      </Route>
      
      <Route path="/insights">
        <Layout>
          <InsightsPage />
        </Layout>
      </Route>

      <Route path="/marketing">
        <Layout>
          <MarketingPage />
        </Layout>
      </Route>

      {/* Coming Soon Routes */}
      <Route path="/crm"><Layout><ComingSoonPage /></Layout></Route>
      <Route path="/profile"><Layout><ComingSoonPage /></Layout></Route>

      <Route component={NotFoundPage} />
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
              <Router />
            </WouterRouter>
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
