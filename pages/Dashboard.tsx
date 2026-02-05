import React, { useState } from 'react';
import { useMessaging } from '../context/MessagingContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Package, MessageSquare, ShoppingBag, PlusCircle, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { currentUser, marketplaceListings, conversations } = useMessaging();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // Calculate stats
  const myListings = marketplaceListings.filter(l => l.sellerId === currentUser.id);
  const activeListings = myListings.filter(l => l.approvalStatus === 'approved').length;
  const pendingListings = myListings.filter(l => l.approvalStatus === 'pending').length;
  
  const roleDisplay = {
    'buyer': t('login.buyer'),
    'seller': t('login.seller'),
    'agent': t('login.agent'),
    'admin': t('login.admin')
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-prepro-dark mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-500 mb-8">{t('dashboard.welcome')}, {currentUser.name}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-prepro-blue text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">{currentUser.name}</h2>
                    <span className="inline-block bg-blue-50 text-prepro-blue text-xs px-2 py-1 rounded font-semibold mt-1">
                        {roleDisplay[currentUser.role]}
                    </span>
                  </div>
               </div>

               <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold">{t('dashboard.email')}</label>
                    <p className="text-sm font-medium text-gray-700">{currentUser.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold">{t('dashboard.status')}</label>
                    <div className="flex items-center gap-2 mt-1">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-600">{t('dashboard.verified')}</span>
                    </div>
                  </div>
                  {currentUser.role !== 'buyer' && (
                     <div>
                        <label className="text-xs text-gray-400 uppercase font-bold">{t('dashboard.kyc')}</label>
                         <div className="flex items-center gap-2 mt-1">
                            {currentUser.kycData ? (
                                <>
                                    <Shield size={16} className="text-green-500" />
                                    <span className="text-sm font-medium text-green-600">{t('dashboard.completed')}</span>
                                </>
                            ) : (
                                <>
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-500">{t('dashboard.basic')}</span>
                                </>
                            )}
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* Right Column: Dashboard Widgets */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-lg text-prepro-dark mb-4">{t('dashboard.quickActions')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button 
                        onClick={() => navigate('/marketplace')}
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors gap-2"
                    >
                        <ShoppingBag className="text-prepro-blue" />
                        <span className="text-sm font-medium">{t('dashboard.browseMarket')}</span>
                    </button>
                    <button 
                         onClick={() => navigate('/messages')}
                        className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors gap-2"
                    >
                        <MessageSquare className="text-prepro-blue" />
                        <span className="text-sm font-medium">{t('dashboard.messages')}</span>
                    </button>
                    {(currentUser.role === 'seller' || currentUser.role === 'agent') && (
                        <>
                            <button 
                                onClick={() => navigate('/post-product')}
                                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors gap-2"
                            >
                                <PlusCircle className="text-prepro-blue" />
                                <span className="text-sm font-medium">{t('dashboard.postListing')}</span>
                            </button>
                             <button 
                                onClick={() => navigate('/my-listings')}
                                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors gap-2"
                            >
                                <Package className="text-prepro-blue" />
                                <span className="text-sm font-medium">{t('dashboard.myListings')}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Role Specific Widgets */}
            {(currentUser.role === 'seller' || currentUser.role === 'agent') ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-prepro-dark">{t('dashboard.listingsOverview')}</h3>
                        <button onClick={() => navigate('/my-listings')} className="text-sm text-prepro-blue hover:underline">{t('common.view')} {t('market.filterAll')}</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <span className="text-3xl font-bold text-green-600 block">{activeListings}</span>
                            <span className="text-sm text-green-800">{t('dashboard.activeListings')}</span>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <span className="text-3xl font-bold text-yellow-600 block">{pendingListings}</span>
                            <span className="text-sm text-yellow-800">{t('dashboard.pendingListings')}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-prepro-dark mb-4">{t('dashboard.investOverview')}</h3>
                    <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
                        <p className="text-gray-500 mb-2">{t('dashboard.noInvest')}</p>
                        <button onClick={() => navigate('/marketplace')} className="bg-prepro-blue text-white px-6 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-prepro-dark">
                            {t('dashboard.findInvest')}
                        </button>
                    </div>
                </div>
            )}

            {/* Recent Messages Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-prepro-dark">{t('dashboard.recentMessages')}</h3>
                    <button onClick={() => navigate('/messages')} className="text-sm text-prepro-blue hover:underline">{t('dashboard.messages')}</button>
                </div>
                {conversations.length > 0 ? (
                    <div className="space-y-3">
                        {conversations.slice(0, 3).map(conv => (
                            <div key={conv.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => navigate(`/messages?id=${conv.id}`)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                        {conv.sellerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{conv.listingName}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{conv.messages[conv.messages.length - 1]?.text}</p>
                                    </div>
                                </div>
                                {conv.unreadCount > 0 && <span className="bg-red-500 w-2 h-2 rounded-full"></span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">{t('common.noData')}</p>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;