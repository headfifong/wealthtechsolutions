import React from 'react';
import { Shield, Lock, Eye, FileText, Server, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-prepro-dark text-white py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('privacy.title')}</h1>
          <p className="text-gray-300 text-lg">
            {t('privacy.date')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl py-12">
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="lead text-xl text-gray-800 font-medium mb-8">
            {t('privacy.intro')}
          </p>

          {/* Section 1 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-prepro-blue">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('privacy.s1.title')}</h2>
            </div>
            <p>{t('privacy.s1.desc')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('privacy.s1.li1')}</li>
              <li>{t('privacy.s1.li2')}</li>
              <li>{t('privacy.s1.li3')}</li>
              <li>{t('privacy.s1.li4')}</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-prepro-blue">
                <Eye size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('privacy.s2.title')}</h2>
            </div>
            <p>{t('privacy.s2.desc')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('privacy.s2.li1')}</li>
              <li>{t('privacy.s2.li2')}</li>
              <li>{t('privacy.s2.li3')}</li>
              <li>{t('privacy.s2.li4')}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-prepro-blue">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('privacy.s3.title')}</h2>
            </div>
            <p>
              {t('privacy.s3.desc')}
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('privacy.s3.li1')}</li>
              <li>{t('privacy.s3.li2')}</li>
              <li>{t('privacy.s3.li3')}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-prepro-blue">
                <Server size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('privacy.s4.title')}</h2>
            </div>
            <p>{t('privacy.s4.desc')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('privacy.s4.li1')}</li>
              <li>{t('privacy.s4.li2')}</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-prepro-blue">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('privacy.s5.title')}</h2>
            </div>
            <p>{t('privacy.s5.desc')}</p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-4">
                <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                        <Shield size={18} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{t('privacy.s5.li1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Shield size={18} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{t('privacy.s5.li2')}</span>
                    </li>
                </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 pt-8 mt-12">
            <h2 className="text-2xl font-bold text-prepro-dark mb-4">{t('privacy.contact.title')}</h2>
            <div className="bg-prepro-dark text-white p-6 rounded-xl inline-block w-full md:w-auto min-w-[300px]">
                <p className="font-bold mb-2">{t('app.name')}</p>
                <p className="text-sm text-gray-300 mb-1">{t('privacy.contact.to')}</p>
                <p className="text-sm text-gray-300 mb-1">{t('privacy.contact.email')}</p>
                <p className="text-sm text-gray-300">{t('privacy.contact.addr')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;