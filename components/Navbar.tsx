import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, BarChart2, ShoppingBag, Home, MessageSquare, LogOut, User, List, Settings, Heart, BookOpen, Globe } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../locales';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number | null;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadTotal, currentUser, logout } = useMessaging();
  const { t, language, setLanguage } = useLanguage();

  const navItems: NavItem[] = [
    { name: t('nav.home'), path: '/', icon: <Home size={18} /> },
    { name: t('nav.marketplace'), path: '/marketplace', icon: <ShoppingBag size={18} /> },
    { name: t('nav.smartSearch'), path: '/smart-search', icon: <Search size={18} /> },
    { name: t('nav.investmentGuide'), path: '/investment-guide', icon: <BookOpen size={18} /> },
    { name: t('nav.analysis'), path: '/analysis', icon: <BarChart2 size={18} /> },
  ];

  // Logic for Seller/Agent specific links
  if (currentUser && (currentUser.role === 'seller' || currentUser.role === 'agent')) {
      navItems.push({
          name: t('nav.myListings'),
          path: '/my-listings',
          icon: <List size={18} />
      });
  }

  // Admin & Agent Link for Management
  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'agent')) {
      navItems.push({
          name: currentUser.role === 'admin' ? t('nav.admin') : t('nav.userManagement'),
          path: '/admin',
          icon: <Settings size={18} />
      });
  }

  // Only show Messages if logged in
  if (currentUser) {
      navItems.push({
        name: t('nav.favorites'),
        path: '/favorites',
        icon: <Heart size={18} />
      });
      navItems.push({ 
        name: t('nav.messages'), 
        path: '/messages', 
        icon: <MessageSquare size={18} />,
        badge: unreadTotal > 0 ? unreadTotal : null
      });
  }

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
      logout();
      navigate('/');
      setIsOpen(false);
  };

  const handleProfileClick = () => {
      if (currentUser?.role === 'admin') {
          navigate('/admin');
      } else {
          navigate('/dashboard');
      }
      setIsOpen(false);
  };

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languageOptions: { code: Language; label: string }[] = [
      { code: 'zh-HK', label: '繁體中文' },
      { code: 'zh-CN', label: '简体中文' },
      { code: 'en-US', label: 'English' },
      { code: 'ja-JP', label: '日本語' },
      { code: 'ko-KR', label: '한국어' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}images/logo_company.png`} alt="Logo" className="h-10 w-10 object-contain" />
              <div className="flex flex-col">
                <span className="font-bold text-xl text-prepro-dark leading-none">{t('app.name')}</span>
                <span className="text-xs text-prepro-blue font-medium tracking-wide">{t('app.code')}</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'text-prepro-blue bg-blue-50'
                    : 'text-gray-600 hover:text-prepro-blue hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.name}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white shadow-sm z-10">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Language Switcher Desktop */}
            <div className="relative ml-2" ref={langDropdownRef}>
                <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="p-2 text-gray-500 hover:text-prepro-blue transition-colors rounded-full hover:bg-gray-100"
                    title={t('nav.language')}
                >
                    <Globe size={20} />
                </button>
                {isLangOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                        {languageOptions.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsLangOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${language === lang.code ? 'text-prepro-blue font-bold' : 'text-gray-700'}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {currentUser ? (
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                    <button 
                        onClick={handleProfileClick}
                        className="flex flex-col items-end hover:opacity-80 transition-opacity text-right group"
                    >
                        <span className="text-sm font-bold text-prepro-dark group-hover:text-prepro-blue">{currentUser.name}</span>
                        <span className="text-xs text-gray-500">{t(`role.${currentUser.role}`)}</span>
                    </button>
                    <button 
                        onClick={handleProfileClick}
                        className="h-8 w-8 bg-prepro-blue rounded-full flex items-center justify-center text-white font-bold hover:bg-prepro-dark transition-colors"
                    >
                        {currentUser.name.charAt(0)}
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title={t('nav.logout')}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            ) : (
                <Link 
                  to="/login"
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-prepro-dark rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                >
                  {t('nav.login')}
                </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-prepro-blue"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          style={{ top: '64px' }}
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg fixed top-16 left-0 right-0 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`relative block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3 ${
                  isActive(item.path)
                    ? 'text-prepro-blue bg-blue-50'
                    : 'text-gray-600 hover:text-prepro-blue hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.name}
              </Link>
            ))}

            {/* Mobile Language Switcher */}
            <div className="border-t border-gray-100 mt-2 pt-2 pb-2">
                <div className="px-3 py-2 text-sm font-bold text-gray-500 flex items-center gap-2">
                    <Globe size={16} /> {t('nav.language')}
                </div>
                <div className="grid grid-cols-2 gap-2 px-3">
                    {languageOptions.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`text-center py-2 rounded-md text-sm border ${language === lang.code ? 'bg-prepro-blue text-white border-prepro-blue' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="border-t border-gray-100 mt-2 pt-2">
                {currentUser ? (
                    <>
                        <button 
                            onClick={handleProfileClick}
                            className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 rounded-md"
                        >
                             <div className="h-8 w-8 bg-prepro-blue rounded-full flex items-center justify-center text-white font-bold">
                                {currentUser.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">{currentUser.name}</div>
                                <div className="text-xs text-gray-500">{t(`role.${currentUser.role}`)}</div>
                            </div>
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-red-500 font-medium flex items-center gap-3 hover:bg-red-50 rounded-md"
                        >
                            <LogOut size={18} /> {t('nav.logout')}
                        </button>
                    </>
                ) : (
                    <Link 
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-prepro-blue hover:bg-blue-50 flex items-center gap-3"
                    >
                        <User size={18} /> {t('nav.login')}
                    </Link>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;