import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, FileText, CheckCircle, Monitor, Users, Handshake, ArrowRight, Shield, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Home: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t } = useLanguage();

  // Business-themed images for the rotating banner
  const heroImages = [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", // Skyscraper (Original)
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop", // Business Meeting/Team
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", // Data Analytics/Charts
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop", // Modern Office
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"  // Financial Growth/Abstract
  ];

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Auto-rotate banner every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const steps = [
    { icon: <UserPlus size={28} />, title: t('home.step.1.title'), desc: t('home.step.1.desc') },
    { icon: <FileText size={28} />, title: t('home.step.2.title'), desc: t('home.step.2.desc') },
    { icon: <CheckCircle size={28} />, title: t('home.step.3.title'), desc: t('home.step.3.desc') },
    { icon: <Monitor size={28} />, title: t('home.step.4.title'), desc: t('home.step.4.desc') },
    { icon: <Users size={28} />, title: t('home.step.5.title'), desc: t('home.step.5.desc') },
    { icon: <Handshake size={28} />, title: t('home.step.6.title'), desc: t('home.step.6.desc') },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Rotating Background Images */}
        <div className="absolute inset-0 z-0">
            {heroImages.map((img, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                 <img 
                    src={img} 
                    alt={`Business Banner ${index + 1}`} 
                    className="w-full h-full object-cover"
                />
              </div>
            ))}
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/95 to-slate-50/20"></div>
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-full bg-prepro-blue opacity-10 -skew-x-12 transform translate-x-20 z-0"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="text-prepro-blue font-bold tracking-wider uppercase text-sm mb-2 block">{t('home.hero.code')}</span>
            <h1 className="text-4xl md:text-6xl font-bold text-prepro-dark leading-tight mb-6">
              {t('home.hero.title_prefix')}<br/>
              <span className="text-prepro-blue">{t('home.hero.title_highlight')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              {t('home.hero.desc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/marketplace" className="bg-prepro-blue text-white px-8 py-3 rounded-full font-semibold hover:bg-prepro-dark transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                {t('home.hero.btn_browse')} <ArrowRight size={18} />
              </Link>
              <Link to="/analysis" className="bg-white text-prepro-dark border border-gray-200 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all shadow-sm">
                {t('home.hero.btn_analysis')}
              </Link>
              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="bg-prepro-dark text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                >
                  <Download size={18} /> {t('home.hero.btn_app')}
                </button>
              )}
            </div>
          </div>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-[-40px] left-6 flex gap-2">
             {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'w-8 bg-prepro-blue' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
             ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-prepro-dark mb-4">{t('home.mission.title')}</h2>
            <p className="text-gray-600 text-lg">
              {t('home.mission.desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-prepro-blue rounded-xl flex items-center justify-center mb-4">
                <Monitor size={24} />
              </div>
              <h3 className="text-xl font-bold text-prepro-dark mb-2">{t('home.mission.tech_title')}</h3>
              <p className="text-gray-600">{t('home.mission.tech_desc')}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-prepro-dark mb-2">{t('home.mission.win_title')}</h3>
              <p className="text-gray-600">{t('home.mission.win_desc')}</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-prepro-dark mb-2">{t('home.mission.legal_title')}</h3>
              <p className="text-gray-600">{t('home.mission.legal_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Flow */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-prepro-dark mb-12 text-center">{t('home.journey.title')}</h2>
          
          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 bg-white rounded-full border-4 border-prepro-blue flex items-center justify-center text-prepro-dark shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                     {step.icon}
                     <div className="absolute -bottom-2 w-6 h-6 bg-prepro-blue text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                       {idx + 1}
                     </div>
                  </div>
                  <h4 className="mt-6 font-bold text-prepro-dark">{step.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline CTA */}
      <section className="py-20 bg-prepro-dark text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('home.timeline.title')}</h2>
          <div className="flex flex-col md:flex-row justify-center gap-10 mb-10">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <span className="block text-prepro-accent font-bold text-lg mb-2">{t('home.timeline.date1')}</span>
              <p>{t('home.timeline.desc1')}</p>
              <p className="text-sm opacity-70">{t('home.timeline.sub1')}</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <span className="block text-prepro-accent font-bold text-lg mb-2">{t('home.timeline.date2')}</span>
              <p>{t('home.timeline.desc2')}</p>
              <p className="text-sm opacity-70">{t('home.timeline.sub2')}</p>
            </div>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            {t('home.timeline.contact_desc')}
          </p>
          <a href="mailto:info@dev.com.hk" className="inline-block bg-prepro-accent text-prepro-dark px-8 py-3 rounded-full font-bold hover:bg-white transition-colors">
            {t('home.timeline.btn_contact')}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;