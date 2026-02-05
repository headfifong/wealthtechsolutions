import React, { useState } from 'react';
import { useMessaging } from '../context/MessagingContext';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, PlusCircle, Trash2, Edit2, Archive, TrendingUp, Eye, FileText, DollarSign, Calendar, X } from 'lucide-react';
import { PolicyListing } from '../types';
import { useLanguage } from '../context/LanguageContext';

const MyListings: React.FC = () => {
  const { currentUser, marketplaceListings, deleteListing, unlistListing } = useMessaging();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedListing, setSelectedListing] = useState<PolicyListing | null>(null);

  // Redirect if not authorized
  if (!currentUser || (currentUser.role !== 'seller' && currentUser.role !== 'agent')) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">{t('admin.accessDenied')}</h2>
                <p className="text-gray-600 mt-2">{t('admin.accessDeniedDesc')}</p>
                <button onClick={() => navigate('/')} className="mt-4 text-prepro-blue hover:underline">{t('common.back')}</button>
            </div>
        </div>
    );
  }

  const myListings = marketplaceListings.filter(l => l.sellerId === currentUser.id);

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

  const handleEdit = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      navigate(`/post-product?edit=${id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm(t('mylist.confirm.delete'))) {
          deleteListing(id);
      }
  };

  const handleUnlist = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm(t('mylist.confirm.unlist'))) {
          unlistListing(id);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-prepro-dark">{t('mylist.title')}</h1>
            <p className="text-gray-500 mt-1">{t('mylist.subtitle')}</p>
          </div>
          <button 
            onClick={() => navigate('/post-product')}
            className="bg-prepro-blue text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-prepro-dark transition-all flex items-center gap-2"
          >
            <PlusCircle size={20} /> {t('mylist.new')}
          </button>
        </div>

        {myListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('mylist.empty.title')}</h3>
            <p className="text-gray-500 mb-8">{t('mylist.empty.desc')}</p>
            <button 
                onClick={() => navigate('/post-product')}
                className="text-prepro-blue font-bold hover:underline"
            >
                {t('mylist.empty.btn')} &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((p) => {
              const currentCashValue = calculateCurrentCashValue(p);
              const isDynamic = currentCashValue > p.surrenderValue;
              
              const canEdit = p.approvalStatus === 'pending' || currentUser.role === 'agent' || currentUser.role === 'admin';

              return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-prepro-blue bg-blue-50 px-2 py-1 rounded">
                        {p.listingId}
                    </span>
                    
                    {/* Status Badge */}
                    {p.approvalStatus === 'pending' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
                            <Clock size={12} /> {t('mylist.status.pending')}
                        </span>
                    )}
                    {p.approvalStatus === 'approved' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle size={12} /> {t('mylist.status.approved')}
                        </span>
                    )}
                    {p.approvalStatus === 'rejected' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-full">
                            <XCircle size={12} /> {t('mylist.status.rejected')}
                        </span>
                    )}
                    {p.approvalStatus === 'withdrawn' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                            <Archive size={12} /> {t('mylist.status.withdrawn')}
                        </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-prepro-dark mb-1 truncate">{p.name}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-4">{p.company}</p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                     <div className="flex justify-between">
                        <span>{t('mylist.label.price')}:</span>
                        <span className="font-bold text-prepro-dark">${p.askingPrice.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                            {t('mylist.label.cashVal')}:
                            {isDynamic && <TrendingUp size={12} className="text-prepro-blue" />}
                        </span>
                        <span className={`font-medium ${isDynamic ? 'text-prepro-blue' : ''}`}>
                            ${currentCashValue.toLocaleString()}
                        </span>
                     </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-100 flex gap-2 flex-wrap">
                    {/* View Button - Always Available */}
                    <button 
                        onClick={() => setSelectedListing(p)}
                        className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors flex items-center justify-center gap-1"
                    >
                        <Eye size={14} /> {t('mylist.action.view')}
                    </button>

                    {/* Edit Logic: Agents can edit anytime */}
                    {canEdit && (
                        <button 
                            onClick={(e) => handleEdit(e, p.id)}
                            className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors flex items-center justify-center gap-1"
                        >
                            <Edit2 size={14} /> {t('mylist.action.edit')}
                        </button>
                    )}

                    {/* Delete Logic: Pending/Rejected usually */}
                    {(p.approvalStatus === 'pending' || p.approvalStatus === 'rejected') && (
                        <button 
                            onClick={(e) => handleDelete(e, p.id)}
                            className="flex-1 text-center py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                        >
                            <Trash2 size={14} /> {t('mylist.action.delete')}
                        </button>
                    )}

                    {/* Logic: Only Approved can Unlist */}
                    {p.approvalStatus === 'approved' && (
                         <button 
                             onClick={(e) => handleUnlist(e, p.id)}
                             className="flex-1 text-center py-2 border border-orange-200 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                         >
                             <Archive size={14} /> {t('mylist.action.unlist')}
                         </button>
                    )}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Listing Details Modal */}
        {selectedListing && (
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedListing(null)}></div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                        <div className="flex justify-between items-start mb-4 border-b pb-2">
                             <div>
                                <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="text-prepro-blue" size={20} />
                                    {t('mylist.modal.title')}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedListing.listingId}</p>
                             </div>
                             <button onClick={() => setSelectedListing(null)} className="text-gray-400 hover:text-gray-500">
                                 <X size={24} />
                             </button>
                        </div>
                        
                        <div className="mt-4 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">{t('mylist.modal.basic')}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs">{t('admin.productName')}</span>
                                        <span className="font-medium">{selectedListing.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">{t('post.label.company')}</span>
                                        <span className="font-medium">{selectedListing.company}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">{t('post.label.policyNum')}</span>
                                        <span className="font-medium font-mono">{selectedListing.policyNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">{t('common.status')}</span>
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                                            selectedListing.isPaidUp ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {selectedListing.statusText}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase flex items-center gap-2">
                                    <DollarSign size={16} /> {t('mylist.modal.financial')}
                                </h4>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-gray-100 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('post.label.asking')}</span>
                                        <span className="font-bold text-lg text-prepro-dark">${selectedListing.askingPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('post.label.surrender')}</span>
                                        <span className="font-medium">${selectedListing.surrenderValue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('post.label.sumAssured')}</span>
                                        <span className="font-medium">${selectedListing.totalSumAssured.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('post.label.premiums')}</span>
                                        <span className="font-medium">${selectedListing.premiumsPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('market.irr')}</span>
                                        <span className="font-bold text-green-600">{selectedListing.irrForBuyer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('post.label.growth')}</span>
                                        <span className="font-medium">{selectedListing.cashValueGrowthRate}% p.a.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Time */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase flex items-center gap-2">
                                    <Calendar size={16} /> {t('mylist.modal.time')}
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <div className="text-center">
                                        <span className="block text-gray-500 text-xs mb-1">{t('post.label.held')}</span>
                                        <span className="font-bold text-gray-900">{selectedListing.yearsHeld} {t('common.year')}</span>
                                    </div>
                                    <div className="text-center border-l border-blue-200">
                                        <span className="block text-gray-500 text-xs mb-1">{t('post.label.remaining')}</span>
                                        <span className="font-bold text-gray-900">{selectedListing.remainingYears} {t('common.year')}</span>
                                    </div>
                                    <div className="text-center border-l border-blue-200">
                                        <span className="block text-gray-500 text-xs mb-1">{t('post.label.maturity')}</span>
                                        <span className="font-bold text-gray-900">{selectedListing.maturityYear}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Footer */}
                            <div className="text-xs text-gray-400 pt-4 border-t border-gray-100 flex justify-between">
                                <span>{t('mylist.label.appDate')}: {selectedListing.applicationDate?.toLocaleDateString()}</span>
                                <span>{t('mylist.label.pubDate')}: {selectedListing.publishDate ? selectedListing.publishDate.toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedListing(null)}
                                className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                {t('mylist.modal.close')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default MyListings;