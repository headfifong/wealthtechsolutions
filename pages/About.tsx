import React from 'react';
import { Shield, Target, Award, Users, Lock, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-prepro-dark text-white py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-prepro-blue opacity-10 rounded-l-full transform translate-x-1/4"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight whitespace-pre-line">
              {t('about.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              {t('about.hero.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-prepro-blue font-bold tracking-wider uppercase text-sm mb-2 block">{t('footer.about')}</span>
            <h2 className="text-3xl font-bold text-prepro-dark mb-6">{t('about.story.title')}</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {t('about.story.p1')}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t('about.story.p2')}
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="border-l-4 border-prepro-blue pl-4">
                <span className="block text-3xl font-bold text-prepro-dark">100%</span>
                <span className="text-sm text-gray-500">Compliance</span>
              </div>
              <div className="border-l-4 border-prepro-blue pl-4">
                <span className="block text-3xl font-bold text-prepro-dark">24/7</span>
                <span className="text-sm text-gray-500">Matching</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative">
             <div className="absolute -top-4 -right-4 bg-prepro-accent text-prepro-dark p-4 rounded-xl shadow-lg">
                <Award size={32} />
             </div>
             <h3 className="text-xl font-bold text-prepro-dark mb-4">{t('about.why.title')}</h3>
             <ul className="space-y-4">
                <li className="flex items-start gap-3">
                   <Shield className="text-prepro-blue mt-1 flex-shrink-0" size={20} />
                   <div>
                      <span className="font-bold text-gray-800 block">{t('about.why.compliance')}</span>
                      <span className="text-sm text-gray-600">{t('about.why.compliance_desc')}</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <Lock className="text-prepro-blue mt-1 flex-shrink-0" size={20} />
                   <div>
                      <span className="font-bold text-gray-800 block">{t('about.why.security')}</span>
                      <span className="text-sm text-gray-600">{t('about.why.security_desc')}</span>
                   </div>
                </li>
                <li className="flex items-start gap-3">
                   <TrendingUp className="text-prepro-blue mt-1 flex-shrink-0" size={20} />
                   <div>
                      <span className="font-bold text-gray-800 block">{t('about.why.value')}</span>
                      <span className="text-sm text-gray-600">{t('about.why.value_desc')}</span>
                   </div>
                </li>
             </ul>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-prepro-dark mb-4">{t('about.values.title')}</h2>
              <p className="text-gray-600">{t('about.values.subtitle')}</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group">
                 <div className="w-16 h-16 bg-blue-50 text-prepro-blue rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-prepro-blue group-hover:text-white transition-colors">
                    <Target size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-prepro-dark mb-3">{t('about.values.neutral')}</h3>
                 <p className="text-gray-500 text-sm">{t('about.values.neutral_desc')}</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group">
                 <div className="w-16 h-16 bg-blue-50 text-prepro-blue rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-prepro-blue group-hover:text-white transition-colors">
                    <Shield size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-prepro-dark mb-3">{t('about.values.integrity')}</h3>
                 <p className="text-gray-500 text-sm">{t('about.values.integrity_desc')}</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group">
                 <div className="w-16 h-16 bg-blue-50 text-prepro-blue rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-prepro-blue group-hover:text-white transition-colors">
                    <Users size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-prepro-dark mb-3">{t('about.values.inclusion')}</h3>
                 <p className="text-gray-500 text-sm">{t('about.values.inclusion_desc')}</p>
              </div>
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
         <div className="container mx-auto px-6">
            <div className="bg-prepro-dark rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden relative">
               <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 pattern-dots"></div>
               <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('about.cta.title')}</h2>
                  <p className="text-gray-300 max-w-xl mx-auto mb-8 text-lg">
                     {t('about.cta.desc')}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <Link to="/marketplace" className="bg-prepro-accent text-prepro-dark px-8 py-3 rounded-full font-bold hover:bg-white transition-colors flex items-center justify-center gap-2">
                        {t('home.hero.btn_browse')} <ArrowRight size={18} />
                     </Link>
                     <Link to="/register" className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-prepro-dark transition-colors">
                        {t('login.registerNow')}
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default About;