import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Clock, PieChart, ArrowRight, BarChart, Target, AlertTriangle, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const InvestmentGuide: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-prepro-dark text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-prepro-blue/20 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-prepro-accent/20 text-prepro-accent text-xs font-bold tracking-wider mb-4 border border-prepro-accent/50">
            DEV Market Insight
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 whitespace-pre-line">
            {t('guide.hero.title')}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            {t('guide.hero.desc')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-5xl -mt-16 pb-20">
        
        {/* Intro Card: The J-Curve Concept */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-prepro-dark mb-4">{t('guide.jcurve.title')}</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('guide.jcurve.desc')}
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed font-medium">
                {t('guide.jcurve.highlight')}
              </p>
            </div>
            <div className="flex-1 w-full bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center">
                {/* Conceptual Chart */}
                <div className="relative w-full h-48 border-l-2 border-b-2 border-gray-300">
                    {/* Curve */}
                    <svg className="absolute bottom-0 left-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                        <path d="M0,150 Q50,180 100,120 T300,10" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="5,5" />
                        <path d="M100,120 Q180,80 300,10" fill="none" stroke="#118AB2" strokeWidth="4" />
                        
                        {/* Points */}
                        <circle cx="0" cy="150" r="4" fill="#94A3B8" />
                        <circle cx="100" cy="120" r="6" fill="#118AB2" />
                        <text x="105" y="115" className="text-xs font-bold fill-prepro-dark">Secondary Entry</text>
                        <text x="5" y="170" className="text-xs fill-gray-400">Primary Entry</text>
                    </svg>
                </div>
                <p className="text-center text-xs text-gray-500 mt-4">J-Curve Effect Visualization</p>
            </div>
          </div>
        </div>

        {/* Strategies Grid */}
        <h2 className="text-2xl font-bold text-prepro-dark mb-8 text-center flex items-center justify-center gap-2">
            <Target className="text-prepro-accent" /> {t('guide.strat.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-blue-50 text-prepro-blue rounded-lg flex items-center justify-center mb-4 group-hover:bg-prepro-blue group-hover:text-white transition-colors">
                    <Clock size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t('guide.strat.1.title')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                    {t('guide.strat.1.desc')}
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <TrendingUp size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t('guide.strat.2.title')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                    {t('guide.strat.2.desc')}
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <PieChart size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t('guide.strat.3.title')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                    {t('guide.strat.3.desc')}
                </p>
            </div>
        </div>

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
                <h2 className="text-2xl font-bold text-prepro-dark mb-6 flex items-center gap-2">
                    <BarChart className="text-prepro-blue" /> {t('guide.metrics.title')}
                </h2>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-800 mb-1">{t('market.irr')}</h4>
                        <p className="text-sm text-gray-600">
                            {t('guide.metrics.desc_irr')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-1">{t('market.filterGuaranteed')}</h4>
                        <p className="text-sm text-gray-600">
                            {t('guide.metrics.desc_guaranteed')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-1">{t('analysis.label.ratio')}</h4>
                        <p className="text-sm text-gray-600">
                            {t('guide.metrics.desc_ratio')}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h2 className="text-xl font-bold text-prepro-dark mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-yellow-600" /> {t('guide.risks.title')}
                </h2>
                <ul className="space-y-4">
                    <li className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-xs">1</div>
                        <div>
                            <span className="font-bold text-gray-800 block text-sm">{t('guide.risks.liquidity')}</span>
                            <span className="text-xs text-gray-600">{t('guide.risks.liquidity_desc')}</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-xs">2</div>
                        <div>
                            <span className="font-bold text-gray-800 block text-sm">{t('guide.risks.return')}</span>
                            <span className="text-xs text-gray-600">{t('guide.risks.return_desc')}</span>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-xs">3</div>
                        <div>
                            <span className="font-bold text-gray-800 block text-sm">{t('guide.risks.seller')}</span>
                            <span className="text-xs text-gray-600">{t('guide.risks.seller_desc')}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-prepro-dark to-slate-800 rounded-2xl p-10 text-white text-center shadow-lg">
            <BookOpen size={48} className="mx-auto mb-4 text-prepro-blue" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('guide.cta.title')}</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                {t('guide.cta.desc')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                    to="/marketplace" 
                    className="bg-prepro-blue text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-prepro-dark transition-all flex items-center justify-center gap-2"
                >
                    {t('home.hero.btn_browse')} <ArrowRight size={18} />
                </Link>
                <Link 
                    to="/analysis" 
                    className="bg-transparent border border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all"
                >
                    {t('home.hero.btn_analysis')}
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default InvestmentGuide;