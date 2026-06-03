import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PreviewLayout from './pages/websites/PreviewLayout';
import Snackbar from './components/ui/Snackbar';

class BuilderErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#1e1e1e', color: '#f44747', height: '100vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
          <strong style={{ fontSize: '18px' }}>TemplateBuilder crashed:</strong>{'\n\n'}
          {this.state.error.message}{'\n\n'}
          {this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load pages to code-split the application
const LoginPage = React.lazy(() => import('./pages/LoginRevamp'));
const FirstTimeLabamuPage = React.lazy(() => import('./pages/FirstTimeLabamu'));
const FirstTimeMRPPage = React.lazy(() => import('./pages/FirstTimeMRP'));
const FirstTimeBothPage = React.lazy(() => import('./pages/FirstTimeBoth'));
const LabamuOnboardingPage = React.lazy(() => import('./pages/LabamuOnboarding'));
const SSOErrorPage = React.lazy(() => import('./pages/SSOError'));
const DashboardPage = React.lazy(() => import('./pages/Dashboard'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const WebsiteTemplates = React.lazy(() => import('./pages/WebsiteTemplates'));
const CompanyProfile = React.lazy(() => import('./pages/CompanyProfile'));
const CatalogProducts = React.lazy(() => import('./pages/CatalogProducts'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const CatalogCategories = React.lazy(() => import('./pages/CatalogCategories'));
const HouzezPreview = React.lazy(() => import('./pages/websites/templates/houzez/HouzezPreview'));
const TemplateBuilder = React.lazy(() => import('./pages/websites/TemplateBuilder'));

// Simple mock auth context — replace with real auth later
function isAuthenticated() {
  return sessionStorage.getItem('lb_mock_auth') === 'true';
}

function ProtectedRoute({ children }) {
  if (isAuthenticated()) return children;
  if (sessionStorage.getItem('lb_sso_error')) return <Navigate to="/sso-error" replace />;
  return <Navigate to="/login" replace />;
}

// Simple absolute centered loader for page transitions
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: '#F5F5F7' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #E6F0FF', borderTopColor: '#006BFF', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sso-error" element={<SSOErrorPage />} />
          <Route path="/first-time-from-labamu" element={<FirstTimeLabamuPage />} />
          <Route path="/first-time-from-labamu/onboarding" element={<LabamuOnboardingPage />} />
          <Route path="/first-time-from-mrp" element={<FirstTimeMRPPage />} />
          <Route path="/first-time-from-mrp/onboarding" element={<LabamuOnboardingPage />} />
          <Route path="/first-time-both" element={<FirstTimeBothPage />} />
          <Route path="/first-time-both/onboarding" element={<LabamuOnboardingPage />} />
          
          {/* Merchant Backoffice Protected Routes with Shared Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/websites" element={<WebsiteTemplates />} />
            <Route path="/catalog" element={<CatalogProducts />} />
            <Route path="/catalog/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<CatalogCategories />} />
            <Route path="/profile" element={<CompanyProfile />} />
          </Route>

          <Route path="/storefront" element={<LandingPage />} />
          
          {/* Template Previews */}
          <Route path="/templates-preview/houzez" element={
            <PreviewLayout>
              <HouzezPreview />
            </PreviewLayout>
          } />

          {/* Builder Routes */}
          <Route path="/templates-edit/:id" element={
            <BuilderErrorBoundary>
              <ProtectedRoute>
                <TemplateBuilder />
              </ProtectedRoute>
            </BuilderErrorBoundary>
          } />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
      <Snackbar />
    </BrowserRouter>
  );
}
