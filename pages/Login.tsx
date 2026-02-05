import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, UserCheck, Tag, Briefcase, Settings } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useLanguage } from '../context/LanguageContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useMessaging();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email);
    if (user) {
      if (user.role === 'admin') {
          navigate('/admin');
      } else {
          navigate('/dashboard');
      }
    } else {
      alert(t('common.error'));
    }
  };

  const handleDemoLogin = (role: 'buyer' | 'seller' | 'agent' | 'admin') => {
    const user = login(role);
    if (user) {
      if (user.role === 'admin') {
          navigate('/admin');
      } else {
          navigate('/dashboard');
      }
    } else {
       alert(t('common.error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-prepro-dark text-white p-3 rounded-xl shadow-lg">
            <Shield size={40} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-prepro-dark">
          {t('login.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('login.subtitle')}{' '}
          <Link to="/register" className="font-medium text-prepro-blue hover:text-prepro-dark">
            {t('login.registerNow')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('login.email')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-prepro-blue focus:border-prepro-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('login.password')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-prepro-blue focus:border-prepro-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-prepro-blue focus:ring-prepro-blue border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {t('login.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-prepro-blue hover:text-prepro-dark">
                  {t('login.forgotPassword')}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-prepro-dark hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-prepro-dark transition-colors"
              >
                {t('login.btnLogin')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('login.pocChannel')}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleDemoLogin('buyer')}
                    className="w-full inline-flex justify-center items-center py-2 px-4 border border-blue-200 rounded-md shadow-sm bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                    <User size={16} className="mr-2" />
                    {t('login.buyer')}
                </button>
                <button
                    onClick={() => {
                        const user = login('verified@dev.com');
                        if (user) navigate('/dashboard');
                    }}
                    className="w-full inline-flex justify-center items-center py-2 px-4 border border-green-200 text-green-700 rounded-md shadow-sm bg-green-50 text-sm font-medium hover:bg-green-100 transition-colors"
                >
                    <UserCheck size={16} className="mr-2" />
                    {t('login.buyerVerified')}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleDemoLogin('seller')}
                    className="w-full inline-flex justify-center items-center py-2 px-4 border border-orange-200 rounded-md shadow-sm bg-orange-50 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
                >
                    <Tag size={16} className="mr-2" />
                    {t('login.seller')}
                </button>
                 <button
                  onClick={() => handleDemoLogin('agent')}
                  className="w-full inline-flex justify-center items-center py-2 px-4 border border-purple-200 rounded-md shadow-sm bg-purple-50 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <Briefcase size={16} className="mr-2" />
                  {t('login.agent')}
                </button>
              </div>
              <div className="grid grid-cols-1">
                 <button
                  onClick={() => handleDemoLogin('admin')}
                  className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-400 rounded-md shadow-sm bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Settings size={16} className="mr-2" />
                  {t('login.admin')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;