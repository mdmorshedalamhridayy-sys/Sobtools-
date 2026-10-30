import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { RecentToolsProvider } from './context/RecentToolsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AllToolsPage } from './pages/AllToolsPage';
import { CategoryPage } from './pages/CategoryPage';
import { ToolPage } from './pages/ToolPage';
import { AboutPage } from './pages/AboutPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { SitemapPage } from './pages/SitemapPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Authentication & Account Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { useActiveSessionTracker } from './hooks/useActiveSessionTracker';

function AppContent() {
  useActiveSessionTracker();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors selection:bg-indigo-600 selection:text-white">
      {/* Site Header */}
      <Header />

      {/* Main App Content Viewport */}
      <main className="flex-1">
                  <Routes>
                    {/* Public Informational Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/disclaimer" element={<DisclaimerPage />} />
                    <Route path="/sitemap" element={<SitemapPage />} />

                    {/* Authentication Flows */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    {/* Protected User Dashboard & Account Routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={<Navigate to="/dashboard?tab=profile" replace />}
                    />
                    <Route
                      path="/settings"
                      element={<Navigate to="/dashboard?tab=security" replace />}
                    />
                    <Route
                      path="/favorites"
                      element={<Navigate to="/dashboard?tab=favorites" replace />}
                    />
                    <Route
                      path="/history"
                      element={<Navigate to="/dashboard?tab=history" replace />}
                    />

                    {/* STRICT MANDATORY TOOL ACCESS ENFORCEMENT */}
                    <Route
                      path="/tools"
                      element={
                        <ProtectedRoute>
                          <AllToolsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tools/:slug"
                      element={
                        <ProtectedRoute>
                          <ToolPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Dashboard & Subroutes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboardPage />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/*"
                      element={
                        <AdminRoute>
                          <AdminDashboardPage />
                        </AdminRoute>
                      }
                    />

                    {/* 404 Not Found Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>

                {/* Site Footer */}
                <Footer />
              </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <RecentToolsProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </RecentToolsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
