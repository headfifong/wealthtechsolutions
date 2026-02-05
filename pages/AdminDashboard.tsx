import React, { useState, useEffect, useMemo } from 'react';
import { useMessaging } from '../context/MessagingContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Users, FileText, Search, AlertCircle, Trash2, StopCircle, UserPlus, X, Edit2, Archive, Eye, DollarSign, Calendar, TrendingUp, Filter } from 'lucide-react';
import { User, PolicyListing } from '../types';

const AdminDashboard: React.FC = () => {
  const { currentUser, marketplaceListings, updateListingStatus, deleteListing, users, toggleUserStatus, createUser, deleteUser } = useMessaging();
  const { t } = useLanguage();
  const navigate = useNavigate();
  // Default to 'users' if agent, otherwise 'listings'
  const [activeTab, setActiveTab] = useState<'listings' | 'users'>('listings');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedListing, setSelectedListing] = useState<PolicyListing | null>(null);
  
  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [listingSellerFilter, setListingSellerFilter] = useState<string>('all');
  
  const [newUser, setNewUser] = useState({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'seller'
  });

  useEffect(() => {
    if (currentUser?.role === 'agent') {
        setActiveTab('users');
    } else {
        setActiveTab('listings');
    }
  }, [currentUser]);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'agent')) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">{t('common.error')}</h2>
                <p className="text-gray-600 mt-2">Access Denied.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-prepro-blue hover:underline">{t('common.back')}</button>
            </div>
        </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  // --- Logic for Visible Listings (Hierarchical) ---
  const visibleListings = useMemo(() => {
      if (!currentUser) return [];
      if (isAdmin) return marketplaceListings;

      return marketplaceListings.filter(l => {
          if (l.sellerId === currentUser.id) return true;
          const seller = users.find(u => u.id === l.sellerId);
          return seller?.createdBy === currentUser.id;
      });
  }, [marketplaceListings, users, currentUser, isAdmin]);

  const pendingListings = visibleListings.filter(l => l.approvalStatus === 'pending');
  const processedListings = visibleListings.filter(l => l.approvalStatus !== 'pending');

  // Filtered Processed Listings based on Seller Selection
  const filteredProcessedListings = useMemo(() => {
      if (listingSellerFilter === 'all') return processedListings;
      return processedListings.filter(l => l.sellerId === listingSellerFilter);
  }, [processedListings, listingSellerFilter]);

  // Extract unique sellers involved in the visible listings for the dropdown
  const uniqueSellersInListings = useMemo(() => {
      const sellerIds = new Set(visibleListings.map(l => l.sellerId));
      return Array.from(sellerIds).map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
  }, [visibleListings, users]);


  // --- Logic for Visible Users (Hierarchical) ---
  const visibleUsers = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === 'admin') {
      return users;
    } else if (currentUser.role === 'agent') {
      return users.filter(u => u.createdBy === currentUser.id);
    }
    return [];
  }, [users, currentUser]);

  // Filtered Users based on Role Selection
  const filteredUsers = useMemo(() => {
      if (userRoleFilter === 'all') return visibleUsers;
      return visibleUsers.filter(u => u.role === userRoleFilter);
  }, [visibleUsers, userRoleFilter]);

  // Helper to look up creator
  const getCreatorLabel = (creatorId?: string) => {
      if (!creatorId) return t('admin.selfReg');
      const creator = users.find(u => u.id === creatorId);
      if (creator) {
          return `${creator.name} (${t(`role.${creator.role}`)})`;
      }
      return creatorId; // Fallback
  };

  // Actions
  const handleCreateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newUser.name || !newUser.email || !newUser.password) {
          alert("Please fill all required fields.");
          return;
      }
      
      if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
          alert("Email already exists.");
          return;
      }

      createUser({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role as any, 
          phone: newUser.phone
      });

      alert(`${t('common.success')}!`);
      setIsAddUserModalOpen(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'seller' });
  };

  const handleDeleteUser = (userId: string) => {
      if (confirm("Are you sure you want to delete this user?")) {
          deleteUser(userId);
      }
  };

  const handleEditListing = (id: string) => {
      navigate(`/post-product?edit=${id}`);
  };

  const handleDeleteListing = (id: string) => {
      if(confirm("Are you sure you want to delete this listing?")) {
          deleteListing(id);
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="bg-prepro-dark rounded-xl p-8 mb-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Shield className="text-prepro-accent" size={32} /> 
                  {isAdmin ? t('admin.title') : t('admin.agentTitle')}
              </h1>
              <p className="text-gray-300">
                  {isAdmin ? t('admin.subtitle') : t('admin.agentSubtitle')}
              </p>
           </div>
           
           <div className="text-right bg-white/10 px-4 py-2 rounded-lg">
              <p className="text-2xl font-bold">{pendingListings.length}</p>
              <p className="text-xs text-gray-400 uppercase">{t('admin.pendingItems')}</p>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
            <button 
                onClick={() => setActiveTab('listings')}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'listings' ? 'bg-white text-prepro-blue shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
                <FileText size={18} /> {t('admin.tabListings')}
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-prepro-blue shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
                <Users size={18} /> {t('admin.tabUsers')}
            </button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
            <div className="space-y-8 animate-fade-in">
                {/* Pending Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="text-yellow-500" /> {t('admin.pendingApprovals')} ({pendingListings.length})
                    </h2>
                    {pendingListings.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200 text-gray-500">
                            {t('common.noData')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {pendingListings.map(listing => (
                                <div key={listing.id} className="bg-white rounded-xl p-6 shadow-sm border border-l-4 border-l-yellow-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-blue-100 text-prepro-blue text-xs font-bold px-2 py-1 rounded">{listing.listingId}</span>
                                            <h3 className="font-bold text-lg text-gray-900">{listing.name}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span><span className="font-semibold">{t('admin.productName')}:</span> {listing.company}</span>
                                            <span><span className="font-semibold">{t('admin.seller')}:</span> {listing.sellerId}</span>
                                            <span><span className="font-semibold">{t('market.askingPrice')}:</span> ${listing.askingPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button 
                                            onClick={() => updateListingStatus(listing.id, 'approved')}
                                            className="flex-1 md:flex-none bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-sm text-sm"
                                        >
                                            <CheckCircle size={16} /> {t('admin.approve')}
                                        </button>
                                        <button 
                                            onClick={() => updateListingStatus(listing.id, 'rejected')}
                                            className="flex-1 md:flex-none bg-white border border-red-200 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <XCircle size={16} /> {t('admin.reject')}
                                        </button>
                                        <button 
                                            onClick={() => setSelectedListing(listing)}
                                            className="flex-1 md:flex-none bg-white border border-gray-300 text-blue-500 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleEditListing(listing.id)}
                                            className="flex-1 md:flex-none bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteListing(listing.id)}
                                            className="flex-1 md:flex-none bg-white border border-gray-300 text-gray-400 px-3 py-2 rounded-lg hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Listings Section */}
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <h2 className="text-xl font-bold text-gray-800">{t('admin.listingsMgmt')}</h2>
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <Filter size={16} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Seller:</span>
                            <select 
                                value={listingSellerFilter}
                                onChange={(e) => setListingSellerFilter(e.target.value)}
                                className="text-sm border-none focus:ring-0 bg-transparent text-gray-800 font-medium cursor-pointer"
                            >
                                <option value="all">All Sellers</option>
                                {uniqueSellersInListings.map(seller => (
                                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.listingId')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.productName')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.seller')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProcessedListings.map(listing => (
                                        <tr key={listing.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-prepro-blue">{listing.listingId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {listing.name}
                                                <div className="text-xs text-gray-500">{listing.company}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {listing.sellerId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    listing.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                                                    listing.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-200 text-gray-800'
                                                }`}>
                                                    {listing.approvalStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(listing.approvalStatus === 'rejected' || listing.approvalStatus === 'withdrawn') && (
                                                        <button 
                                                            onClick={() => updateListingStatus(listing.id, 'approved')}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    {listing.approvalStatus === 'approved' && (
                                                        <button 
                                                            onClick={() => updateListingStatus(listing.id, 'withdrawn')}
                                                            className="text-orange-500 hover:text-orange-700 bg-orange-50 p-1.5 rounded"
                                                        >
                                                            <Archive size={16} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => setSelectedListing(listing)} className="text-blue-500 hover:text-blue-700 p-1.5">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button onClick={() => handleEditListing(listing.id)} className="text-blue-500 hover:text-blue-700 p-1.5">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteListing(listing.id)} className="text-gray-400 hover:text-red-600 p-1.5">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProcessedListings.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-gray-500">{t('common.noData')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users size={24} className="text-prepro-blue" /> {t('admin.usersList')} ({filteredUsers.length})
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                            <Filter size={16} className="text-gray-500" />
                            <select 
                                value={userRoleFilter}
                                onChange={(e) => setUserRoleFilter(e.target.value)}
                                className="text-sm border-none focus:ring-0 bg-transparent text-gray-800 font-medium cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="buyer">{t('role.buyer')}</option>
                                <option value="seller">{t('role.seller')}</option>
                                <option value="agent">{t('role.agent')}</option>
                                <option value="admin">{t('role.admin')}</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => setIsAddUserModalOpen(true)}
                            className="bg-prepro-blue text-white px-4 py-2 rounded-lg font-bold hover:bg-prepro-dark flex items-center gap-2 shadow-sm"
                        >
                            <UserPlus size={18} /> {t('admin.addUser')}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('register.name')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.role')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('login.email')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.createdBy')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.joinedDate')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-prepro-blue font-bold mr-3">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                                                user.role === 'seller' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {t(`role.${user.role}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getCreatorLabel(user.createdBy)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.status === 'active' ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setSelectedUser(user)} className="text-blue-500 hover:text-blue-700 p-1.5" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => toggleUserStatus(user.id)} 
                                                    className={`${user.status === 'active' ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} p-1.5`}
                                                    title={user.status === 'active' ? 'Suspend' : 'Activate'}
                                                >
                                                    {user.status === 'active' ? <StopCircle size={16} /> : <CheckCircle size={16} />}
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-gray-400 hover:text-red-600 p-1.5" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-6 text-gray-500">{t('common.noData')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Add User Modal */}
        {isAddUserModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsAddUserModalOpen(false)}></div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                        <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <UserPlus className="h-6 w-6 text-prepro-blue" />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {t('admin.addUserTitle')}
                                </h3>
                             </div>
                             <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                 <X size={20} />
                             </button>
                        </div>
                        
                        <div className="mt-2">
                             <p className="text-sm text-gray-500 mb-4">
                                {t('admin.addUserDesc')}
                             </p>
                             <form onSubmit={handleCreateUser} className="space-y-4">
                                 {isAdmin && (
                                     <div>
                                         <label className="block text-sm font-medium text-gray-700">{t('admin.role')}</label>
                                         <select 
                                             value={newUser.role}
                                             onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                                         >
                                             <option value="seller">{t('role.seller')}</option>
                                             <option value="agent">{t('role.agent')}</option>
                                         </select>
                                     </div>
                                 )}

                                 <div>
                                     <label className="block text-sm font-medium text-gray-700">{t('register.name')}</label>
                                     <input 
                                        type="text" 
                                        required
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                                        placeholder="Chan Tai Man"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700">{t('login.email')}</label>
                                     <input 
                                        type="email" 
                                        required
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                                        placeholder="client@example.com"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700">{t('register.phone')}</label>
                                     <input 
                                        type="tel" 
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                                        placeholder="+852 9123 4567"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700">{t('login.password')}</label>
                                     <input 
                                        type="text" 
                                        required
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                                        placeholder="Secret123"
                                     />
                                 </div>

                                 <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-prepro-blue text-base font-medium text-white hover:bg-prepro-dark focus:outline-none sm:col-start-2 sm:text-sm"
                                    >
                                        {t('admin.create')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddUserModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                </div>
                             </form>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* User Details Modal (Can reuse selectedUser state) */}
        {selectedUser && (
             <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedUser(null)}></div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                            <button onClick={() => setSelectedUser(null)}><X size={20}/></button>
                        </div>
                        <div className="text-sm space-y-2">
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Role:</strong> {t(`role.${selectedUser.role}`)}</p>
                            <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                            <p><strong>Status:</strong> {selectedUser.status}</p>
                        </div>
                        <div className="mt-4">
                            <button onClick={() => setSelectedUser(null)} className="w-full border p-2 rounded">{t('common.cancel')}</button>
                        </div>
                    </div>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;