import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Phone, CheckCircle, Upload, RefreshCw, Loader, ArrowRight } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleGenAI, Type } from "@google/genai";

const Verification: React.FC = () => {
  const { currentUser, updateUser } = useMessaging();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/marketplace';

  // State
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [ocrData, setOcrData] = useState<{name: string, dob: string, dateOfIssue: string} | null>(currentUser?.kycData || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHKPhone = (phone: string) => /^[2-9]\d{7}$/.test(phone);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
            { inlineData: { mimeType: mimeType, data: base64Data } },
            { text: "Analyze this image of a Hong Kong Permanent Identity Card. Extract the English Name (e.g., CHAN Tai Man), Date of Birth, and Date of Issue. If a field is not visible, use 'N/A'. Return JSON." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              dob: { type: Type.STRING },
              dateOfIssue: { type: Type.STRING }
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
      }
    } catch (error: any) {
      console.error("OCR Error:", error);
      alert(`${t('verify.error.ocr')}: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
      if (!isHKPhone(phone)) {
          alert(t('verify.error.phone'));
          return;
      }
      if (!ocrData) {
          alert(t('verify.error.missing'));
          return;
      }

      if (currentUser) {
          updateUser(currentUser.id, {
              phone: phone,
              kycData: ocrData
          });
          alert(t('verify.success.alert'));
          navigate(redirectPath);
      }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  if (!currentUser) {
      navigate('/login');
      return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-prepro-blue mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">{t('verify.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('verify.desc')}
          </p>
        </div>

        <div className="space-y-6">
            {/* Phone Verification */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <Phone size={18} className="text-gray-500" />
                    <label className="block text-sm font-medium text-gray-700">{t('verify.label.phone')}</label>
                </div>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('register.ph.phone')}
                    className="w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-prepro-blue focus:border-prepro-blue sm:text-sm border"
                />
            </div>

            {/* HKID Verification */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <Shield size={18} className="text-gray-500" />
                    <label className="block text-sm font-medium text-gray-700">{t('verify.label.hkid')}</label>
                </div>
                
                {/* Upload Logic */}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                {!previewUrl && !ocrData ? (
                    <div onClick={triggerUpload} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 cursor-pointer transition-colors">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">{t('verify.upload.hint')}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{t('verify.upload.subhint')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {previewUrl && (
                            <div className="relative">
                                <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-md opacity-80" />
                                <button onClick={triggerUpload} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white">
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        )}
                        
                        {isAnalyzing ? (
                            <div className="text-center text-prepro-blue text-sm font-bold flex items-center justify-center gap-2">
                                <Loader className="animate-spin" size={16} /> {t('verify.analyzing')}
                            </div>
                        ) : ocrData ? (
                            <div className="bg-green-100 text-green-800 text-xs p-2 rounded-md flex items-center gap-2">
                                <CheckCircle size={14} /> {t('verify.success')}: {ocrData.name}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-prepro-blue hover:bg-prepro-dark focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {t('verify.btn.submit')} <ArrowRight size={16} className="ml-2" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Verification;