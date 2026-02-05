import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('dev_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('dev_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('dev_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-slide-up">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-gray-600">
          <p>
            {t('cookie.message')}
            <Link to="/privacy-policy" className="text-prepro-blue hover:underline ml-1 font-medium">
              {t('cookie.policy')}
            </Link>.
          </p>
        </div>
        <div className="flex gap-3 whitespace-nowrap w-full md:w-auto">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {t('cookie.decline')}
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 bg-prepro-blue text-white rounded-lg text-sm font-bold hover:bg-prepro-dark transition-colors shadow-sm"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;