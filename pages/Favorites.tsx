import React, { useMemo } from 'react';
import { Heart, ChevronRight, Info, MessageSquare, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useNavigate } from 'react-router-dom';
import { PolicyListing } from '../types';
import { useLanguage } from '../context/LanguageContext';

const Favorites: React.FC = () => {
  const { currentUser, marketplaceListings, toggleFavorite, startConversation, sendMatchRequest } = useMessaging();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const favoriteListings = useMemo(() => {
    if (!currentUser || !currentUser.favorites) return [];
    return marketplaceListings.filter(l => currentUser.favorites?.includes(l.id));
  }, [marketplaceListings, currentUser]);

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

  const handleChatClick = (policy: PolicyListing) => {
    if (currentUser?.id === policy.sellerId) {
        alert(t('market.alert.selfChat'));
        return;
    }
    const convId = startConversation(policy);
    navigate(`/messages?id=${convId}`);
  };

  const handleMatchClick = (listing: PolicyListing) => {
    if (currentUser?.id === listing.sellerId) {
        alert(t('market.alert.selfMatch'));
        return;
    }

    if (window.confirm(t('market.confirm.match'))) {
        sendMatchRequest(listing);
        alert(t('market.alert.requestSent'));
        navigate('/messages');
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
            <Heart className="text-red-500 fill-red-500" size={32} />
            <h1 className="text-3xl font-bold text-prepro-dark">{t('fav.title')}</h1>
        </div>

        {favoriteListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                <Heart size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('fav.empty.title')}</h3>
            <p className="text-gray-500 mb-8">{t('fav.empty.desc')}</p>
            <button 
                onClick={() => navigate('/marketplace')}
                className="bg-prepro-blue text-white px-6 py-2.5 rounded-full font-bold hover:bg-prepro-dark transition-colors flex items-center gap-2 mx-auto"
            >
                {t('fav.btn.browse')} <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteListings.map((p) => {
               const currentCashValue = calculateCurrentCashValue(p);
               const isDynamic = currentCashValue > p.surrenderValue;

               return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
                    <div className="p-5 flex flex-col flex-grow relative">
                    
                    {/* Pending Badge */}
                    {p.approvalStatus === 'pending' && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm z-10 flex items-center gap-1">
                            <Clock size={10} /> {t('mylist.status.pending')}
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
                            onClick={() => toggleFavorite(p.id)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors z-20"
                            title={t('fav.remove')}
                        >
                            <Heart size={20} className="fill-red-500 text-red-500" />
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
                        <span className="font-semibold text-gray-700">{p.remainingYears} {t('common.year')}</span>
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
                            onClick={() => handleChatClick(p)}
                            disabled={p.approvalStatus === 'pending'}
                            className="bg-blue-50 text-prepro-blue px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('market.contactSeller')}
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
        )}
      </div>
    </div>
  );
};

export default Favorites;