import React, { useState, useMemo } from 'react';
import { Filter, ChevronRight, Info, MessageSquare, Clock, X, Heart, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { PolicyListing, AnalysisDataPoint } from '../types';
import { useMessaging } from '../context/MessagingContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Marketplace: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyListing | null>(null);
  
  const { startConversation, sendMatchRequest, currentUser, marketplaceListings, toggleFavorite } = useMessaging();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const filteredPolicies = useMemo(() => {
    return marketplaceListings.filter(p => {
      if (p.approvalStatus !== 'approved') {
          return false;
      }
      
      const typeMatch = filterType === 'all' || p.status === filterType;
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const priceMatch = p.askingPrice >= min && p.askingPrice <= max;
      return typeMatch && priceMatch;
    });
  }, [marketplaceListings, filterType, minPrice, maxPrice]);

  const checkAuth = () => {
      if (!currentUser) {
          if (window.confirm("Please login first.")) {
              navigate('/login');
          }
          return false;
      }
      return true;
  };

  const verifyBuyerAccess = () => {
      if (!currentUser) return false;
      if (currentUser.role === 'buyer' && (!currentUser.phone || !currentUser.kycData)) {
          if (window.confirm("Please complete verification.")) {
              navigate('/verification?redirect=/marketplace');
          }
          return false;
      }
      return true;
  };

  const handleDetailsClick = (listingId: string) => {
    if (!checkAuth()) return;
    if (!verifyBuyerAccess()) return; 

    const policy = marketplaceListings.find(p => p.listingId === listingId);
    if (policy) {
        setSelectedPolicy(policy);
    }
  };

  const handleMatchClick = (listing: PolicyListing) => {
    if (!checkAuth()) return;
    if (!verifyBuyerAccess()) return; 
    
    if (currentUser?.id === listing.sellerId) {
        alert("Cannot match your own listing.");
        return;
    }

    if (window.confirm(`Confirm Match Request?`)) {
        sendMatchRequest(listing);
        alert("Request Sent!");
        navigate('/messages');
    }
  };

  const handleChatClick = (policy: PolicyListing) => {
    if (!checkAuth()) return;
    if (!verifyBuyerAccess()) return; 

    if (currentUser?.id === policy.sellerId) {
        alert("Cannot chat with yourself.");
        return;
    }
    const convId = startConversation(policy);
    navigate(`/messages?id=${convId}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    if (!checkAuth()) return;
    toggleFavorite(listingId);
  };

  const calculateCurrentCashValue = (listing: PolicyListing) => {
      if (!listing.publishDate || !listing.cashValueGrowthRate) return listing.surrenderValue;
      
      const now = new Date();
      const published = new Date(listing.publishDate);
      const diffTime = Math.max(0, now.getTime() - published.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) return listing.surrenderValue;

      const yearsPassed = diffDays / 365;
      const growthFactor = Math.pow(1 + (listing.cashValueGrowthRate / 100), yearsPassed);
      
      return Math.floor(listing.surrenderValue * growthFactor);
  };

  // Generate chart data for policy detail view
  const generatePolicyChartData = useMemo(() => {
    if (!selectedPolicy) return { data: [], breakevenYear: -1 };
    
    const data: AnalysisDataPoint[] = [];
    const currentCashValue = calculateCurrentCashValue(selectedPolicy);
    const askingPrice = selectedPolicy.askingPrice;
    const remainingYears = selectedPolicy.remainingYears;
    const irr = parseFloat(selectedPolicy.irrForBuyer) / 100 || 0.05;
    
    let currentValue = currentCashValue;
    let foundBreakeven = currentValue >= askingPrice ? 0 : -1;
    
    // Year 0 - Purchase point
    data.push({
      year: 'Y0',
      totalCost: askingPrice,
      cashValue: currentValue,
      breakeven: currentValue >= askingPrice
    });
    
    for (let year = 1; year <= remainingYears; year++) {
      currentValue = currentValue * (1 + irr);
      
      const isBreakeven = currentValue >= askingPrice;
      if (foundBreakeven === -1 && isBreakeven) {
        foundBreakeven = year;
      }
      
      data.push({
        year: `Y${year}`,
        totalCost: askingPrice,
        cashValue: Math.round(currentValue),
        breakeven: isBreakeven
      });
    }
    
    return { data, breakevenYear: foundBreakeven };
  }, [selectedPolicy]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-prepro-dark mb-3">{t('market.title')}</h1>
          <p className="text-xl text-prepro-blue">{t('market.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: t('market.filterAll') },
                { id: 'paid-up', label: t('market.filterPaidUp') },
                { id: 'near-breakeven', label: t('market.filterBreakeven') },
                { id: 'high-guaranteed', label: t('market.filterGuaranteed') },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterType(btn.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === btn.id
                      ? 'bg-prepro-dark text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{t('market.priceRange')}:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-24 px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-prepro-blue outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-24 px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-prepro-blue outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPolicies.map((p) => {
            const isFavorite = currentUser?.favorites?.includes(p.id);
            const currentCashValue = calculateCurrentCashValue(p);
            const isDynamic = currentCashValue > p.surrenderValue;

            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
                <div className="p-5 flex flex-col flex-grow relative">
                  
                  {p.approvalStatus === 'pending' && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm z-10 flex items-center gap-1">
                          <Clock size={10} /> Pending
                      </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-prepro-blue bg-blue-50 px-2 py-1 rounded">
                              {p.listingId}
                          </span>
                          {p.isPaidUp && (
                              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                                  <Info size={10} /> Paid-Up
                              </span>
                          )}
                      </div>
                      
                      <button 
                        onClick={(e) => handleToggleFavorite(e, p.id)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors z-20"
                      >
                         <Heart size={20} className={`transition-all ${isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-300 hover:text-red-400"}`} />
                      </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-prepro-dark mb-1 truncate" title={p.name}>{p.name}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-4">{p.company}</p>

                  <div className="space-y-3 mb-6 text-sm flex-grow">
                    <div className="flex justify-between items-center border-b border-dashed border-gray-100 pb-2">
                      <span className="text-gray-500">{t('market.irr')}</span>
                      <span className="font-bold text-green-600 text-base">{p.irrForBuyer}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-gray-100 pb-2">
                      <span className="text-gray-500">{t('market.sumAssured')}</span>
                      <span className="font-semibold text-gray-700">${p.totalSumAssured.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-gray-100 pb-2">
                      <span className="text-gray-500">{t('market.remainingYears')}</span>
                      <span className="font-semibold text-gray-700">{p.remainingYears} yrs</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-dashed border-gray-100 pb-2">
                      <span className="text-gray-500 flex items-center gap-1">
                          {t('market.cashValue')}
                          {isDynamic && <TrendingUp size={12} className="text-prepro-blue" />}
                      </span>
                      <span className={`font-semibold ${isDynamic ? 'text-prepro-blue' : 'text-gray-700'}`}>
                          ${currentCashValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold">{t('market.askingPrice')}</p>
                      <p className="text-2xl font-bold text-prepro-dark tracking-tight">
                          ${p.askingPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                          onClick={() => handleDetailsClick(p.listingId)}
                          className="flex-1 bg-gray-50 text-gray-700 font-semibold py-2 px-3 rounded-lg text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                          {t('market.details')}
                      </button>
                      <button 
                          onClick={() => handleChatClick(p)}
                          disabled={p.approvalStatus === 'pending'}
                          className="bg-blue-50 text-prepro-blue px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <MessageSquare size={18} />
                      </button>
                      <button 
                          onClick={() => handleMatchClick(p)}
                          disabled={p.approvalStatus === 'pending'}
                          className="flex-1 bg-prepro-blue text-white font-semibold py-2 px-3 rounded-lg text-sm hover:bg-prepro-dark transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {t('market.match')} <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                <Filter size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">{t('market.noData')}</p>
          </div>
        )}

        {/* Details Modal with Chart */}
        {selectedPolicy && (
            <PolicyDetailModal 
                policy={selectedPolicy}
                onClose={() => setSelectedPolicy(null)}
                onChat={() => {
                    handleChatClick(selectedPolicy);
                    setSelectedPolicy(null);
                }}
                onMatch={() => {
                    handleMatchClick(selectedPolicy);
                    setSelectedPolicy(null);
                }}
                calculateCurrentCashValue={calculateCurrentCashValue}
                t={t}
            />
        )}
      </div>
    </div>
  );
};

// Policy Detail Modal with Chart Visualization
interface PolicyDetailModalProps {
  policy: PolicyListing;
  onClose: () => void;
  onChat: () => void;
  onMatch: () => void;
  calculateCurrentCashValue: (listing: PolicyListing) => number;
  t: (key: string) => string;
}

const PolicyDetailModal: React.FC<PolicyDetailModalProps> = ({ 
  policy, 
  onClose, 
  onChat, 
  onMatch, 
  calculateCurrentCashValue,
  t 
}) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Generate projection data based on policy details
  const chartData = useMemo(() => {
    const data: { year: string; investment: number; cashValue: number }[] = [];
    const initialInvestment = policy.askingPrice;
    const currentCashValue = calculateCurrentCashValue(policy);
    const growthRate = policy.cashValueGrowthRate ? policy.cashValueGrowthRate / 100 : 0.045;
    const totalYears = policy.remainingYears;

    let projectedValue = currentCashValue;

    // Year 0 - Purchase point
    data.push({
      year: 'Y0',
      investment: initialInvestment,
      cashValue: currentCashValue
    });

    // Project future years
    for (let year = 1; year <= totalYears; year++) {
      projectedValue = projectedValue * (1 + growthRate);
      data.push({
        year: `Y${year}`,
        investment: initialInvestment,
        cashValue: Math.round(projectedValue)
      });
    }

    return data;
  }, [policy, calculateCurrentCashValue]);

  // Find breakeven year
  const breakevenYear = useMemo(() => {
    for (let i = 0; i < chartData.length; i++) {
      if (chartData[i].cashValue >= chartData[i].investment) {
        return i;
      }
    }
    return -1;
  }, [chartData]);

  const breakevenPoint = breakevenYear !== -1 ? chartData[breakevenYear] : null;
  const finalData = chartData[chartData.length - 1];
  const totalProfit = finalData.cashValue - policy.askingPrice;
  const currentCashValue = calculateCurrentCashValue(policy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all scale-100">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-prepro-dark">{policy.name}</h2>
            <p className="text-gray-500 text-sm">{policy.company} • {policy.listingId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">{t('market.askingPrice')}</p>
              <p className="text-lg font-bold text-prepro-dark">${policy.askingPrice.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">{t('market.irr')}</p>
              <p className="text-lg font-bold text-green-600">{policy.irrForBuyer}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">{t('market.remainingYears')}</p>
              <p className="text-lg font-bold text-purple-600">{policy.remainingYears} {t('common.year')}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">{t('analysis.metric.breakeven')}</p>
              <p className="text-lg font-bold text-yellow-600">
                {breakevenYear !== -1 ? `Y${breakevenYear}` : '> MAX'}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9ca3af" 
                    fontSize={11} 
                    tickMargin={8}
                    interval={Math.max(0, Math.floor(policy.remainingYears / 5) - 1)}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={11} 
                    tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                    width={45}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="investment" 
                    name={t('market.askingPrice')}
                    stroke="#9ca3af" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cashValue" 
                    name={t('analysis.chart.value')}
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={false}
                  />
                  {breakevenPoint && (
                    <ReferenceDot 
                      x={breakevenPoint.year} 
                      y={breakevenPoint.cashValue} 
                      r={6} 
                      fill="#fbbf24" 
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  )}
                  {breakevenPoint && (
                    <ReferenceLine 
                      x={breakevenPoint.year} 
                      stroke="#fbbf24" 
                      strokeDasharray="3 3" 
                      label={{ position: 'top', value: t('analysis.breakeven'), fill: '#d97706', fontSize: 10 }} 
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
              <p className="text-xs text-gray-500 mb-1">{t('market.cashValue')}</p>
              <p className="text-base font-bold text-prepro-blue">${currentCashValue.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl text-center border border-green-100">
              <p className="text-xs text-gray-500 mb-1">{t('analysis.metric.interest')}</p>
              <p className={`text-base font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl text-center border border-purple-100">
              <p className="text-xs text-gray-500 mb-1">{t('analysis.metric.total')}</p>
              <p className="text-base font-bold text-purple-600">{formatCurrency(finalData.cashValue)}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">{t('common.status')}:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${policy.isPaidUp ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {policy.isPaidUp ? 'Paid-Up' : 'Paying'}
            </span>
            <span className="text-sm text-gray-500 ml-2">{t('market.maturity')}:</span>
            <span className="text-sm font-medium text-gray-700">{policy.maturityYear}</span>
            <span className="text-sm text-gray-500 ml-2">{t('market.sumAssured')}:</span>
            <span className="text-sm font-medium text-gray-700">${policy.totalSumAssured.toLocaleString()}</span>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <p>{t('smart.disclaimer')}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3 sticky bottom-0 z-10">
          <button 
            onClick={onChat}
            disabled={policy.approvalStatus === 'pending'}
            className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare size={18} /> {t('market.contactSeller')}
          </button>
          <button 
            onClick={onMatch}
            disabled={policy.approvalStatus === 'pending'}
            className="flex-1 bg-prepro-blue text-white font-bold py-3 rounded-xl hover:bg-prepro-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('market.match')} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;