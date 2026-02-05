import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DollarSign, Calendar, FileText, CheckCircle, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { PolicyListing } from '../types';
import { useLanguage } from '../context/LanguageContext';

// Validation error type
interface ValidationErrors {
  [key: string]: string | null;
}

const PostProduct: React.FC = () => {
  const { postListing, updateListing, currentUser, marketplaceListings, users } = useMessaging();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { t } = useLanguage();
  
  const existingListing = editId ? marketplaceListings.find((l: PolicyListing) => l.id === editId) : null;

  const [formData, setFormData] = useState({
    company: '友邦 AIA',
    policyNumber: '',
    name: '',
    askingPrice: '',
    surrenderValue: '',
    totalSumAssured: '',
    premiumsPaid: '',
    yearsHeld: '',
    remainingYears: '',
    maturityYear: '',
    isPaidUp: false,
    premiumFrequency: 'annually',
    premiumAmount: '',
    cashValueGrowthRate: '4.5'
  });

  // Track which fields have been touched (for inline validation)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Mark field as touched on blur
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Current year for validation
  const currentYear = new Date().getFullYear();

  // Real-time validation logic
  const validationErrors = useMemo((): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    const askingPrice = Number(formData.askingPrice) || 0;
    const surrenderValue = Number(formData.surrenderValue) || 0;
    const totalSumAssured = Number(formData.totalSumAssured) || 0;
    const premiumsPaid = Number(formData.premiumsPaid) || 0;
    const yearsHeld = Number(formData.yearsHeld) || 0;
    const remainingYears = Number(formData.remainingYears) || 0;
    const maturityYear = Number(formData.maturityYear) || 0;
    const growthRate = Number(formData.cashValueGrowthRate) || 0;
    const premiumAmount = Number(formData.premiumAmount) || 0;

    // === Value Validations ===
    
    // All monetary values must be positive
    if (formData.askingPrice && askingPrice <= 0) {
      errors.askingPrice = t('post.validation.positive');
    }
    if (formData.surrenderValue && surrenderValue <= 0) {
      errors.surrenderValue = t('post.validation.positive');
    }
    if (formData.totalSumAssured && totalSumAssured <= 0) {
      errors.totalSumAssured = t('post.validation.positive');
    }
    if (formData.premiumsPaid && premiumsPaid <= 0) {
      errors.premiumsPaid = t('post.validation.positive');
    }

    // Asking Price <= Total Sum Assured
    if (askingPrice > 0 && totalSumAssured > 0 && askingPrice > totalSumAssured) {
      errors.askingPrice = t('post.validation.askingVsSumAssured');
    }

    // Surrender Value <= Total Sum Assured
    if (surrenderValue > 0 && totalSumAssured > 0 && surrenderValue > totalSumAssured) {
      errors.surrenderValue = t('post.validation.surrenderVsSumAssured');
    }

    // Asking Price >= Surrender Value (seller shouldn't ask less than surrender)
    if (askingPrice > 0 && surrenderValue > 0 && askingPrice < surrenderValue) {
      errors.askingPrice = t('post.validation.askingVsSurrender');
    }

    // === Time Validations ===
    
    // Years Held: 1-50 years
    if (formData.yearsHeld) {
      if (yearsHeld < 1) {
        errors.yearsHeld = t('post.validation.yearsHeldMin');
      } else if (yearsHeld > 50) {
        errors.yearsHeld = t('post.validation.yearsHeldMax');
      }
    }

    // Remaining Years: 0-100 years
    if (formData.remainingYears) {
      if (remainingYears < 0) {
        errors.remainingYears = t('post.validation.remainingMin');
      } else if (remainingYears > 100) {
        errors.remainingYears = t('post.validation.remainingMax');
      }
    }

    // Maturity Year >= Current Year (unless remainingYears is 0)
    if (formData.maturityYear && maturityYear > 0) {
      if (remainingYears > 0 && maturityYear < currentYear) {
        errors.maturityYear = t('post.validation.maturityPast');
      }
      // Check consistency: maturityYear should roughly equal currentYear + remainingYears
      const expectedMaturity = currentYear + remainingYears;
      if (remainingYears > 0 && Math.abs(maturityYear - expectedMaturity) > 1) {
        errors.maturityYear = t('post.validation.maturityMismatch');
      }
    }

    // === Growth Rate Validation ===
    if (formData.cashValueGrowthRate) {
      if (growthRate < 0) {
        errors.cashValueGrowthRate = t('post.validation.growthMin');
      } else if (growthRate > 15) {
        errors.cashValueGrowthRate = t('post.validation.growthMax');
      }
    }

    // === Premium Validations (when not Paid-Up) ===
    if (!formData.isPaidUp && formData.premiumAmount) {
      if (premiumAmount <= 0) {
        errors.premiumAmount = t('post.validation.positive');
      }
    }

    return errors;
  }, [formData, t, currentYear]);

  // Warnings (soft validations - don't block submit)
  const validationWarnings = useMemo((): ValidationErrors => {
    const warnings: ValidationErrors = {};
    
    const surrenderValue = Number(formData.surrenderValue) || 0;
    const premiumsPaid = Number(formData.premiumsPaid) || 0;
    const askingPrice = Number(formData.askingPrice) || 0;
    const remainingYears = Number(formData.remainingYears) || 0;
    const premiumAmount = Number(formData.premiumAmount) || 0;
    const totalSumAssured = Number(formData.totalSumAssured) || 0;

    // Surrender Value typically <= Premiums Paid (early surrender penalty)
    if (surrenderValue > 0 && premiumsPaid > 0 && surrenderValue > premiumsPaid * 1.5) {
      warnings.surrenderValue = t('post.validation.surrenderVsPremiums');
    }

    // Future premiums warning
    if (!formData.isPaidUp && premiumAmount > 0 && remainingYears > 0) {
      let annualPremium = premiumAmount;
      if (formData.premiumFrequency === 'monthly') annualPremium = premiumAmount * 12;
      if (formData.premiumFrequency === 'quarterly') annualPremium = premiumAmount * 4;
      if (formData.premiumFrequency === 'oneOff') annualPremium = 0; // One-off payment already made
      
      const totalFuturePremiums = annualPremium * remainingYears;
      if (totalFuturePremiums > totalSumAssured * 0.5) {
        warnings.premiumAmount = t('post.validation.futurePremiumsHigh');
      }
    }

    return warnings;
  }, [formData, t]);

  // Check if form has any blocking errors
  const hasErrors = Object.values(validationErrors).some(e => e !== null);

  // Load data for edit
  useEffect(() => {
    if (existingListing) {
       setFormData({
           company: existingListing.company,
           policyNumber: existingListing.policyNumber || '',
           name: existingListing.name,
           askingPrice: String(existingListing.askingPrice),
           surrenderValue: String(existingListing.surrenderValue),
           totalSumAssured: String(existingListing.totalSumAssured),
           premiumsPaid: String(existingListing.premiumsPaid),
           yearsHeld: String(existingListing.yearsHeld),
           remainingYears: String(existingListing.remainingYears),
           maturityYear: String(existingListing.maturityYear),
           isPaidUp: existingListing.isPaidUp,
           premiumFrequency: existingListing.premiumFrequency || 'annually',
           premiumAmount: String(existingListing.premiumAmount || ''),
           cashValueGrowthRate: String(existingListing.cashValueGrowthRate || '4.5')
       });
    }
  }, [existingListing]);

  // Helper component for field error/warning display
  const FieldFeedback: React.FC<{ field: string }> = ({ field }) => {
    const error = touched[field] ? validationErrors[field] : null;
    const warning = touched[field] ? validationWarnings[field] : null;
    
    if (error) {
      return (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      );
    }
    if (warning) {
      return (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <AlertTriangle size={12} /> {warning}
        </p>
      );
    }
    return null;
  };

  // Get input class based on validation state
  const getInputClass = (field: string, baseClass: string) => {
    if (touched[field] && validationErrors[field]) {
      return `${baseClass} border-red-400 focus:ring-red-500 focus:border-red-500`;
    }
    if (touched[field] && validationWarnings[field]) {
      return `${baseClass} border-amber-400 focus:ring-amber-500 focus:border-amber-500`;
    }
    return baseClass;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Mark all fields as touched to show all errors
    const allFields = ['askingPrice', 'surrenderValue', 'totalSumAssured', 'premiumsPaid', 
                       'yearsHeld', 'remainingYears', 'maturityYear', 'cashValueGrowthRate', 'premiumAmount'];
    const allTouched: Record<string, boolean> = {};
    allFields.forEach(f => allTouched[f] = true);
    setTouched(allTouched);

    // Block submit if there are errors
    if (hasErrors) {
      alert(t('post.validation.hasErrors'));
      return;
    }

    const askingPrice = Number(formData.askingPrice);
    const surrenderValue = Number(formData.surrenderValue);
    const premiumsPaid = Number(formData.premiumsPaid);
    const totalSumAssured = Number(formData.totalSumAssured);
    const yearsHeld = Number(formData.yearsHeld);
    const remainingYears = Number(formData.remainingYears);
    
    const listingData: Partial<PolicyListing> = {
        company: formData.company,
        policyNumber: formData.policyNumber,
        name: formData.name,
        askingPrice: askingPrice,
        surrenderValue: surrenderValue,
        totalSumAssured: totalSumAssured,
        premiumsPaid: premiumsPaid,
        yearsHeld: yearsHeld,
        remainingYears: remainingYears,
        maturityYear: Number(formData.maturityYear),
        isPaidUp: formData.isPaidUp,
        status: formData.isPaidUp ? 'paid-up' : 'paying' as any,
        statusText: formData.isPaidUp ? 'Paid-Up' : 'Paying',
        irrForBuyer: `${formData.cashValueGrowthRate}%`,
        cashValueGrowthRate: Number(formData.cashValueGrowthRate),
        premiumFrequency: formData.isPaidUp ? undefined : formData.premiumFrequency as any,
        premiumAmount: formData.isPaidUp ? undefined : Number(formData.premiumAmount)
    };

    if (editId && existingListing) {
        updateListing(editId, listingData);
        alert(t('common.success'));
    } else {
        postListing(listingData);
        if (currentUser.role === 'agent' || currentUser.role === 'admin') {
            alert(t('common.success'));
        } else {
            alert(t('post.submitted'));
        }
    }

    // Redirect Logic
    if (currentUser.role === 'admin') {
        navigate('/admin');
    } else if (currentUser.role === 'agent') {
        if (existingListing && existingListing.sellerId !== currentUser.id) {
            navigate('/admin');
        } else {
            navigate('/my-listings');
        }
    } else {
        navigate('/my-listings');
    }
  };

  // 1. General Page Permission Check
  if (!currentUser || (currentUser.role !== 'seller' && currentUser.role !== 'agent' && currentUser.role !== 'admin')) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
              <div className="text-center">
                  <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                  <h2 className="text-xl font-bold text-gray-800">{t('common.error')}</h2>
                  <p className="text-gray-600 mt-2">{t('admin.accessDenied')}</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-prepro-blue hover:underline">{t('common.back')}</button>
              </div>
          </div>
      );
  }

  // 2. Specific Edit Permission Check
  if (editId && existingListing) {
      const isOwner = existingListing.sellerId === currentUser.id;
      const isAdmin = currentUser.role === 'admin';
      let isCreatorAgent = false;

      if (currentUser.role === 'agent') {
          const listingOwner = users.find((u: any) => u.id === existingListing.sellerId);
          if (listingOwner && listingOwner.createdBy === currentUser.id) {
              isCreatorAgent = true;
          }
      }

      if (!isOwner && !isAdmin && !isCreatorAgent) {
          return (
              <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                  <div className="text-center">
                      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800">{t('common.error')}</h2>
                      <p className="text-gray-600 mt-2">{t('admin.accessDenied')}</p>
                      <button onClick={() => navigate(currentUser.role === 'admin' || currentUser.role === 'agent' ? '/admin' : '/my-listings')} className="mt-4 text-prepro-blue hover:underline">{t('common.back')}</button>
                  </div>
              </div>
          );
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-prepro-dark">{editId ? t('post.title.edit') : t('post.title.add')}</h1>
          <p className="mt-2 text-gray-600">{editId ? t('post.subtitle.edit') : t('post.subtitle.add')}</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-prepro-dark mb-4 flex items-center gap-2 border-b pb-2">
                <FileText size={20} className="text-prepro-blue" /> {t('post.section.basic')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.company')}</label>
                  <select 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 px-3 border"
                  >
                    <option value="友邦 AIA">友邦 AIA</option>
                    <option value="保誠 Prudential">保誠 Prudential</option>
                    <option value="宏利 Manulife">宏利 Manulife</option>
                    <option value="永明 Sun Life">永明 Sun Life</option>
                    <option value="富衛 FWD">富衛 FWD</option>
                    <option value="AXA 安盛">AXA 安盛</option>
                    <option value="中國人壽(海外)">中國人壽(海外)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.policyNum')}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
                    placeholder="e.g., 12345678"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 px-3 border"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('post.hidden')}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.name')}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., AIA Wealth Pro"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 px-3 border"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Values */}
            <div>
              <h3 className="text-lg font-bold text-prepro-dark mb-4 flex items-center gap-2 border-b pb-2">
                <DollarSign size={20} className="text-prepro-blue" /> {t('post.section.value')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.asking')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                        type="number" 
                        required
                        value={formData.askingPrice}
                        onChange={(e) => setFormData({...formData, askingPrice: e.target.value})}
                        onBlur={() => handleBlur('askingPrice')}
                        className={getInputClass('askingPrice', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 pl-7 pr-3 border')}
                    />
                  </div>
                  <FieldFeedback field="askingPrice" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.surrender')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                        type="number" 
                        required
                        value={formData.surrenderValue}
                        onChange={(e) => setFormData({...formData, surrenderValue: e.target.value})}
                        onBlur={() => handleBlur('surrenderValue')}
                        className={getInputClass('surrenderValue', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 pl-7 pr-3 border')}
                    />
                  </div>
                  <FieldFeedback field="surrenderValue" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.sumAssured')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                        type="number" 
                        required
                        value={formData.totalSumAssured}
                        onChange={(e) => setFormData({...formData, totalSumAssured: e.target.value})}
                        onBlur={() => handleBlur('totalSumAssured')}
                        className={getInputClass('totalSumAssured', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 pl-7 pr-3 border')}
                    />
                  </div>
                  <FieldFeedback field="totalSumAssured" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.premiums')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input 
                        type="number" 
                        required
                        value={formData.premiumsPaid}
                        onChange={(e) => setFormData({...formData, premiumsPaid: e.target.value})}
                        onBlur={() => handleBlur('premiumsPaid')}
                        className={getInputClass('premiumsPaid', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 pl-7 pr-3 border')}
                    />
                  </div>
                  <FieldFeedback field="premiumsPaid" />
                </div>
              </div>
            </div>

            {/* Section 3: Time & Growth */}
            <div>
              <h3 className="text-lg font-bold text-prepro-dark mb-4 flex items-center gap-2 border-b pb-2">
                <Calendar size={20} className="text-prepro-blue" /> {t('post.section.time')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.held')}</label>
                  <div className="relative">
                    <input 
                        type="number" 
                        required
                        value={formData.yearsHeld}
                        onChange={(e) => setFormData({...formData, yearsHeld: e.target.value})}
                        onBlur={() => handleBlur('yearsHeld')}
                        className={getInputClass('yearsHeld', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 px-3 border')}
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">{t('common.year')}</span>
                  </div>
                  <FieldFeedback field="yearsHeld" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.remaining')}</label>
                  <div className="relative">
                    <input 
                        type="number" 
                        required
                        value={formData.remainingYears}
                        onChange={(e) => {
                            const val = e.target.value;
                            const thisYear = new Date().getFullYear();
                            const newMaturity = val ? String(thisYear + Number(val)) : formData.maturityYear;
                            setFormData({
                                ...formData, 
                                remainingYears: val,
                                maturityYear: newMaturity
                            });
                        }}
                        onBlur={() => handleBlur('remainingYears')}
                        className={getInputClass('remainingYears', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 px-3 border')}
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">{t('common.year')}</span>
                  </div>
                  <FieldFeedback field="remainingYears" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.maturity')}</label>
                  <input 
                        type="number" 
                        placeholder="YYYY"
                        required
                        value={formData.maturityYear}
                        onChange={(e) => setFormData({...formData, maturityYear: e.target.value})}
                        onBlur={() => handleBlur('maturityYear')}
                        className={getInputClass('maturityYear', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 px-3 border')}
                    />
                  <FieldFeedback field="maturityYear" />
                </div>
              </div>

              {/* New Growth Rate Field */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp size={16} /> {t('post.label.growth')}
                     </label>
                     <span className="text-xs text-gray-500">{t('post.autocalc')}</span>
                  </div>
                  <div className="relative max-w-xs">
                    <input 
                        type="number" 
                        step="0.1"
                        required
                        value={formData.cashValueGrowthRate}
                        onChange={(e) => setFormData({...formData, cashValueGrowthRate: e.target.value})}
                        onBlur={() => handleBlur('cashValueGrowthRate')}
                        className={getInputClass('cashValueGrowthRate', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 px-3 border')}
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">% p.a.</span>
                  </div>
                  <FieldFeedback field="cashValueGrowthRate" />
                  <p className="text-xs text-gray-500 mt-2">
                      {t('post.hint.growth')}
                  </p>
              </div>

              <div className="mt-4">
                  <label className="flex items-center space-x-3 mb-4">
                    <input 
                        type="checkbox" 
                        checked={formData.isPaidUp}
                        onChange={(e) => setFormData({...formData, isPaidUp: e.target.checked})}
                        className="h-5 w-5 text-prepro-blue focus:ring-prepro-blue border-gray-300 rounded"
                    />
                    <span className="text-gray-700 font-medium">{t('post.checkbox.paidUp')}</span>
                  </label>

                  {/* Conditional Payment Fields */}
                  {!formData.isPaidUp && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.frequency')}</label>
                              <select 
                                value={formData.premiumFrequency}
                                onChange={(e) => setFormData({...formData, premiumFrequency: e.target.value})}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 px-3 border"
                              >
                                  <option value="annually">{t('post.frequency.annually')}</option>
                                  <option value="monthly">{t('post.frequency.monthly')}</option>
                                  <option value="quarterly">{t('post.frequency.quarterly')}</option>
                                  <option value="oneOff">{t('post.frequency.oneOff')}</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('post.label.amount')}</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input 
                                    type="number" 
                                    required={!formData.isPaidUp}
                                    value={formData.premiumAmount}
                                    onChange={(e) => setFormData({...formData, premiumAmount: e.target.value})}
                                    onBlur={() => handleBlur('premiumAmount')}
                                    className={getInputClass('premiumAmount', 'w-full border-gray-300 rounded-lg shadow-sm focus:ring-prepro-blue focus:border-prepro-blue py-2 pl-7 pr-3 border')}
                                />
                              </div>
                              <FieldFeedback field="premiumAmount" />
                          </div>
                      </div>
                  )}
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                {/* Validation Summary */}
                {hasErrors && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle size={16} /> {t('post.validation.fixErrors')}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-4">
                  <button 
                      type="button" 
                      onClick={() => navigate(currentUser.role === 'admin' ? '/admin' : '/marketplace')}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                      {t('common.cancel')}
                  </button>
                  <button 
                      type="submit" 
                      disabled={hasErrors}
                      className={`px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2 ${
                        hasErrors 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-prepro-blue text-white hover:bg-prepro-dark'
                      }`}
                  >
                      <CheckCircle size={18} /> 
                      {editId ? t('post.btn.update') : ((currentUser.role === 'agent' || currentUser.role === 'admin') ? t('post.btn.publish') : t('post.btn.submit'))}
                  </button>
                </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default PostProduct;