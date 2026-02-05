import React, { useState } from 'react';
import { Search, Target, Clock, ArrowRight } from 'lucide-react';
import { SearchResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

const SmartSearch: React.FC = () => {
  const [term, setTerm] = useState<number | string>(5);
  const [returnRate, setReturnRate] = useState<number | string>(4);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const { t } = useLanguage();

  // Mock Database
  const productDatabase: Omit<SearchResult, 'matchScore'>[] = [
    { id: 1, name: "穩健增長計劃 A", company: "AIA", avgReturn: 3.8, term: 5 },
    { id: 2, name: "未來收益保 B", company: "Prudential", avgReturn: 4.2, term: 5 },
    { id: 3, name: "精英護航計劃 C", company: "Manulife", avgReturn: 4.5, term: 7 },
    { id: 4, name: "長期回報儲蓄 D", company: "AXA", avgReturn: 5.1, term: 10 },
    { id: 5, name: "靈活自主保 E", company: "Sun Life", avgReturn: 3.5, term: 3 },
    { id: 6, name: "卓越遠見計劃 F", company: "BOC Life", avgReturn: 4.1, term: 6 },
  ];

  const handleSearch = () => {
    setIsSearching(true);
    setResults(null);

    // Handle empty strings by defaulting to 0 for calculations
    const termValue = term === '' ? 0 : Number(term);
    const rateValue = returnRate === '' ? 0 : Number(returnRate);

    // Simulate API delay
    setTimeout(() => {
      const computedResults = productDatabase.map(product => {
        // Simple weighted scoring algorithm
        const termDiff = Math.abs(product.term - termValue) / (termValue || 1);
        const rateDiff = Math.abs(product.avgReturn - rateValue) / (rateValue || 1);
        // Term importance 40%, Rate importance 60%
        const matchScore = Math.max(0, (1 - (termDiff * 0.4 + rateDiff * 0.6)) * 100);
        return { ...product, matchScore };
      })
      .filter(p => p.matchScore > 50)
      .sort((a, b) => b.matchScore - a.matchScore);

      setResults(computedResults);
      setIsSearching(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-prepro-dark mb-4">
            {t('smart.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            {t('smart.subtitle')}
          </p>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all hover:scale-[1.01]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-left">
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Clock size={18} className="text-prepro-blue" /> {t('smart.label.term')}
                </label>
                <div className="relative group">
                  <input 
                    type="number" 
                    value={term}
                    onChange={(e) => setTerm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 text-3xl font-bold text-center py-4 rounded-xl border-2 border-slate-200 focus:border-prepro-blue focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">{t('common.year')}</span>
                </div>
              </div>
              <div className="text-left">
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                   <Target size={18} className="text-prepro-blue" /> {t('smart.label.return')}
                </label>
                <div className="relative group">
                  <input 
                    type="number" 
                    value={returnRate}
                    onChange={(e) => setReturnRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 text-3xl font-bold text-center py-4 rounded-xl border-2 border-slate-200 focus:border-prepro-blue focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className={`w-full bg-prepro-blue text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-prepro-dark transition-all flex items-center justify-center gap-3 ${isSearching ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('smart.btn.searching')}
                </>
              ) : (
                <>
                  <Search size={24} /> {t('smart.btn.search')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="container mx-auto px-6 py-16 animate-fade-in-up">
           <div className="text-center mb-10">
             <h2 className="text-2xl font-bold text-prepro-dark">{t('smart.results.title')}</h2>
             <p className="text-gray-500 mt-2">
                {t('smart.results.subtitle').replace('{term}', String(term === '' ? 0 : term)).replace('{rate}', String(returnRate === '' ? 0 : returnRate))}
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {results.length > 0 ? results.map((result) => (
                <div key={result.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                        {result.company}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-prepro-blue">{result.matchScore.toFixed(0)}%</span>
                        <p className="text-xs text-gray-400">{t('smart.match')}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-prepro-dark mb-6">{result.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-4 mb-6">
                      <div className="text-center border-r border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">{t('smart.histReturn')}</p>
                        <p className="text-lg font-bold text-green-600">{result.avgReturn}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">{t('smart.refTerm')}</p>
                        <p className="text-lg font-bold text-gray-700">{result.term} {t('common.year')}</p>
                      </div>
                    </div>
                    
                    <button className="w-full border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                       {t('smart.details')} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
             )) : (
                <div className="col-span-3 text-center py-10 text-gray-500">
                    <p>{t('smart.noResults')}</p>
                </div>
             )}
           </div>
           <p className="text-center mt-12 text-sm text-gray-400 max-w-2xl mx-auto">
             {t('smart.disclaimer')}
           </p>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;