import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import SmartSearch from './pages/SmartSearch';
import Analysis from './pages/Analysis';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PostProduct from './pages/PostProduct';
import MyListings from './pages/MyListings';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import Favorites from './pages/Favorites';
import InvestmentGuide from './pages/InvestmentGuide';
import Verification from './pages/Verification';
import { MessagingProvider } from './context/MessagingContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();
    
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

// Update document title based on language
const DocumentTitle = () => {
    const { t } = useLanguage();
    
    React.useEffect(() => {
        document.title = t('app.title');
    }, [t]);

    return null;
};

const AppContent: React.FC = () => {
  return (
    <HashRouter>
      <MessagingProvider>
        <div className="flex flex-col min-h-screen font-sans text-slate-800">
          <ScrollToTop />
          <DocumentTitle />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/smart-search" element={<SmartSearch />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/post-product" element={<PostProduct />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/investment-guide" element={<InvestmentGuide />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <CookieBanner />
        </div>
      </MessagingProvider>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;