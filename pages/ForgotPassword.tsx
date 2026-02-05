import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Key, CheckCircle, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useLanguage } from '../context/LanguageContext';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { users } = useMessaging();
  const { t } = useLanguage();
  
  // State for steps: 1 = Verify, 2 = Reset
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form State
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Constants
  const MOCK_VALID_CODE = "123456"; // Hardcoded for POC

  // Step 1: Send Verification Code
  const handleSendCode = () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    // Simulate API Check
    setTimeout(() => {
      const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!userExists) {
        setError(t('forgot.error.email'));
        setIsLoading(false);
        return;
      }

      setIsCodeSent(true);
      setSuccessMsg(t('forgot.success.sent').replace('{email}', email).replace('{code}', MOCK_VALID_CODE));
      setIsLoading(false);
    }, 1000);
  };

  // Step 1: Verify Code and Proceed
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verificationCode !== MOCK_VALID_CODE) {
      setError(t('forgot.error.code'));
      return;
    }

    setSuccessMsg(null);
    setStep(2);
  };

  // Step 2: Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
        setError(t('forgot.error.length'));
        return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('forgot.error.match'));
      return;
    }

    setIsLoading(true);

    // Simulate Server Update
    setTimeout(() => {
      setIsLoading(false);
      alert(t('forgot.success.reset'));
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="bg-prepro-dark text-white p-3 rounded-xl shadow-lg hover:bg-gray-800 transition-colors">
            <Shield size={40} />
          </Link>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-prepro-dark">
          {step === 1 ? t('forgot.title1') : t('forgot.title2')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 ? t('forgot.subtitle1') : t('forgot.subtitle2')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-lg sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
              <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={20} />
              <p className="text-sm text-green-700">{successMsg}</p>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1 FORM */
            <form className="space-y-6" onSubmit={handleVerifySubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('forgot.label.email')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={isCodeSent}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-prepro-blue focus:border-prepro-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder={t('forgot.ph.email')}
                  />
                  {!isCodeSent && (
                      <div className="absolute inset-y-0 right-0 flex items-center">
                          <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={!email || isLoading}
                            className="h-full px-3 py-0 bg-gray-50 text-prepro-blue text-xs font-bold border-l border-gray-300 rounded-r-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isLoading ? t('forgot.btn.sending') : t('forgot.btn.send')}
                          </button>
                      </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  {t('forgot.label.code')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="focus:ring-prepro-blue focus:border-prepro-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder={t('forgot.ph.code')}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!email || !verificationCode}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-prepro-dark hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-prepro-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t('forgot.btn.next')} <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2 FORM */
            <form className="space-y-6" onSubmit={handleResetPassword}>
               <div>
                <label htmlFor="newPass" className="block text-sm font-medium text-gray-700">
                  {t('forgot.label.newPass')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPass"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="focus:ring-prepro-blue focus:border-prepro-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder={t('forgot.ph.newPass')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPass" className="block text-sm font-medium text-gray-700">
                  {t('forgot.label.confirmPass')}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPass"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="focus:ring-prepro-blue focus:border-prepro-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder={t('forgot.ph.confirmPass')}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-prepro-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-prepro-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? t('forgot.btn.submitting') : t('forgot.btn.submit')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('forgot.remember')}
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
                <Link to="/login" className="font-medium text-prepro-blue hover:text-prepro-dark">
                    {t('forgot.back')}
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;