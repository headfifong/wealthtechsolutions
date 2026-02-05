import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, DollarSign, CheckCircle, ArrowLeft, ArrowRight, Upload, Loader, RefreshCw, AlertTriangle, FileText } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleGenAI, Type } from "@google/genai";

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'buyer' | 'seller' | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  // OCR State
  const [ocrData, setOcrData] = useState<{name: string, dob: string, dateOfIssue: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register } = useMessaging();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Basic HK Phone Regex: 8 digits, starts with 2-9.
  const isHKPhone = (phone: string) => /^[2-9]\d{7}$/.test(phone);

  const handleNext = () => {
      // Validation for Step 2
      if (step === 2) {
          if (!formData.name || !formData.email || !formData.password) {
              alert(t('register.alert.fillFields'));
              return;
          }
          
          if (role === 'seller') {
              if (!formData.phone) {
                  alert(t('register.alert.phoneReq'));
                  return;
              }
              if (!isHKPhone(formData.phone)) {
                  alert(t('register.alert.phoneInvalid'));
                  return;
              }
          } else {
              // Buyer phone optional, but if entered, must be valid
              if (formData.phone && !isHKPhone(formData.phone)) {
                  alert(t('register.alert.phoneInvalid'));
                  return;
              }
          }
      }

      // Validation for Step 3 (Agreement)
      if (step === 3) {
          if (!agreed) {
              alert(t('register.agreement.accept'));
              return;
          }
      }

      setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      register(formData.name, role, formData.email, ocrData, formData.phone);
      navigate('/');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set preview
    setPreviewUrl(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setOcrData(null);

    try {
      const base64Data = await fileToBase64(file);
      
      const mimeType = file.type || 'image/jpeg';
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: "Analyze this image of a Hong Kong Permanent Identity Card. Extract the English Name (e.g., CHAN Tai Man), Date of Birth, and Date of Issue. If a field is not visible, use 'N/A'. Return JSON."
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Full English Name as shown on the ID card" },
              dob: { type: Type.STRING, description: "Date of Birth in DD-MM-YYYY format" },
              dateOfIssue: { type: Type.STRING, description: "Date of Issue in DD-MM-YYYY format" }
            },
            required: ["name", "dob", "dateOfIssue"]
          }
        }
      });

      let text = response.text;
      if (text) {
        if (text.trim().startsWith('```')) {
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        const result = JSON.parse(text);
        setOcrData(result);
        
        if (!formData.name && result.name && result.name !== 'N/A') {
          setFormData(prev => ({ ...prev, name: result.name }));
        }
      } else {
          throw new Error("No response text from AI model.");
      }
    } catch (error: any) {
      console.error("OCR Error:", error);
      alert(`${t('register.verify.failed')}: ${error.message}`);
      setOcrData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Progress Bar */}
        <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-prepro-blue' : 'text-gray-400'}`}>1. {t('register.step1')}</span>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-prepro-blue' : 'text-gray-400'}`}>2. {t('register.step2')}</span>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-prepro-blue' : 'text-gray-400'}`}>3. {t('register.step3')}</span>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${step >= 4 ? 'text-prepro-blue' : 'text-gray-400'}`}>4. {t('register.step4')}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-prepro-blue transition-all duration-500 ease-out"
                    style={{ width: `${step * 25}%` }}
                ></div>
            </div>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-xl sm:px-10 border border-gray-100">
          <div className="mb-6 text-center">
             <Shield size={40} className="mx-auto text-prepro-dark mb-4" />
             <h2 className="text-2xl font-bold text-gray-900">
                {step === 1 && t('register.step1')}
                {step === 2 && t('register.step2')}
                {step === 3 && t('register.agreement.title')}
                {step === 4 && t('register.verify.title')}
             </h2>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                  onClick={() => setRole('buyer')}
                  className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${role === 'buyer' ? 'border-prepro-blue bg-blue-50 ring-1 ring-prepro-blue' : 'border-gray-200 hover:border-prepro-blue/50'}`}
               >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-prepro-blue">
                     <DollarSign size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{t('register.buyerTitle')}</h3>
                  <p className="text-sm text-gray-500 mt-2">{t('register.buyerDesc')}</p>
               </button>

               <button 
                  onClick={() => setRole('seller')}
                  className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${role === 'seller' ? 'border-prepro-blue bg-blue-50 ring-1 ring-prepro-blue' : 'border-gray-200 hover:border-prepro-blue/50'}`}
               >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-prepro-blue">
                     <User size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{t('register.sellerTitle')}</h3>
                  <p className="text-sm text-gray-500 mt-2">{t('register.sellerDesc')}</p>
               </button>

               <div className="col-span-1 md:col-span-2 mt-6">
                 <button 
                    onClick={handleNext}
                    disabled={!role}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-prepro-dark hover:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                    {t('common.next')} <ArrowRight size={16} className="ml-2" />
                 </button>
               </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
             <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <div>
                   <label className="block text-sm font-medium text-gray-700">
                     {t('register.name')}
                   </label>
                   <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">{t('login.email')}</label>
                   <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">
                      {t('register.phone')} {role === 'buyer' && <span className="text-gray-400 font-normal">{t('register.phoneOptional')}</span>}
                   </label>
                   <input 
                      type="tel" 
                      required={role === 'seller'}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder={t('register.ph.phone')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">{t('login.password')}</label>
                   <input 
                      type="password" 
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm"
                   />
                </div>
                
                <div className="flex gap-4 mt-6">
                    <button 
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                        {t('common.back')}
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-prepro-dark hover:bg-gray-800 focus:outline-none"
                    >
                        {t('common.next')}
                    </button>
                </div>
             </form>
          )}

          {/* Step 3: User Agreement */}
          {step === 3 && (
            <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-80 overflow-y-auto">
                    <div className="space-y-6">
                        {role === 'buyer' ? (
                            <>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">{t('register.agreement.buyer.t1')}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t('register.agreement.buyer.c1')}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">{t('register.agreement.buyer.t2')}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t('register.agreement.buyer.c2')}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">{t('register.agreement.buyer.t3')}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t('register.agreement.buyer.c3')}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">{t('register.agreement.seller.t1')}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t('register.agreement.seller.c1')}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">{t('register.agreement.seller.t2')}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t('register.agreement.seller.c2')}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">{t('register.agreement.seller.t3')}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t('register.agreement.seller.c3')}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="agreement"
                            name="agreement"
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="focus:ring-prepro-blue h-4 w-4 text-prepro-blue border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="agreement" className="font-medium text-gray-700 select-none cursor-pointer">
                            {t('register.agreement.accept')}
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button 
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                        {t('common.back')}
                    </button>
                    <button 
                        type="button"
                        onClick={handleNext}
                        disabled={!agreed}
                        className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-prepro-dark hover:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('common.next')}
                    </button>
                </div>
            </div>
          )}

          {/* Step 4: Verification */}
          {step === 4 && (
            <div className="space-y-6">
                {role === 'seller' ? (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Shield className="h-5 w-5 text-yellow-600" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">{t('register.verify.hkid')}</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>{t('register.verify.hkidDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    
                    {!previewUrl ? (
                        <div 
                            onClick={triggerUpload}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                            <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-prepro-blue transition-colors" />
                            <p className="mt-2 text-sm text-gray-600 font-medium">{t('register.uploadID')}</p>
                            <p className="text-xs text-gray-400">{t('register.uploadHint')}</p>
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-gray-700">{t('register.verify.uploaded')}</span>
                                <button onClick={triggerUpload} className="text-xs text-prepro-blue hover:underline flex items-center gap-1">
                                    <RefreshCw size={12} /> {t('register.verify.reupload')}
                                </button>
                            </div>
                            <img src={previewUrl} alt="ID Preview" className="w-full h-48 object-cover rounded-md mb-4 bg-gray-100" />
                            
                            {isAnalyzing ? (
                                <div className="text-center py-4 text-prepro-blue animate-pulse">
                                    <Loader className="animate-spin h-6 w-6 mx-auto mb-2" />
                                    <span className="text-sm font-bold">{t('register.analyzing')}</span>
                                </div>
                            ) : ocrData ? (
                                <div className="bg-green-50 border border-green-200 rounded-md p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-green-700 mb-2">
                                        <CheckCircle size={16} />
                                        <span className="text-sm font-bold">{t('register.success')}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="block text-xs text-gray-500">{t('register.ocr.name')}</label>
                                            <input 
                                                value={ocrData.name} 
                                                onChange={(e) => setOcrData({...ocrData, name: e.target.value})}
                                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500">{t('register.ocr.dob')}</label>
                                            <input 
                                                value={ocrData.dob} 
                                                onChange={(e) => setOcrData({...ocrData, dob: e.target.value})}
                                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-red-500 text-sm flex items-center justify-center gap-2 bg-red-50 p-4 rounded-lg border border-red-100">
                                    <AlertTriangle size={16} /> 
                                    {t('register.verify.failed')}
                                </div>
                            )}
                        </div>
                    )}
                  </>
                ) : (
                    <div className="text-center py-10">
                         <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                         </div>
                         <h3 className="text-lg font-medium text-gray-900">{t('register.verify.ready')}</h3>
                         <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                            {t('register.verify.buyerReady')}
                         </p>
                    </div>
                )}

                <div className="flex gap-4 mt-8">
                    <button 
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                        {t('common.back')}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={role === 'seller' && !ocrData}
                        className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-prepro-blue hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle size={18} className="mr-2" />
                        {t('register.complete')}
                    </button>
                </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;