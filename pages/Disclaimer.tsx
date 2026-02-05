import React from 'react';
import { AlertTriangle, FileWarning, TrendingDown, ShieldAlert, Globe, Scale } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Disclaimer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-prepro-dark text-white py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('disclaimer.title')}</h1>
          <p className="text-gray-300 text-lg">
            {t('disclaimer.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl py-12">
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="lead text-xl text-gray-800 font-medium mb-8">
            {t('disclaimer.intro')}
          </p>

          {/* Section 1 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('disclaimer.s1.title')}</h2>
            </div>
            <p>
              {t('disclaimer.s1.content')}
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-prepro-blue">
                <FileWarning size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('disclaimer.s2.title')}</h2>
            </div>
            <p>
              <strong>{t('disclaimer.s2.content1')}</strong>
            </p>
            <p className="mt-2">
              {t('disclaimer.s2.content2')}
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-50 p-2 rounded-lg text-red-500">
                <TrendingDown size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('disclaimer.s3.title')}</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>{t('disclaimer.s3.li1')}</li>
              <li>{t('disclaimer.s3.li2')}</li>
              <li>{t('disclaimer.s3.li3')}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                <ShieldAlert size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('disclaimer.s4.title')}</h2>
            </div>
            <p>
              {t('disclaimer.s4.content')}
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-prepro-blue">
                <Globe size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('disclaimer.s5.title')}</h2>
            </div>
            <p>
              {t('disclaimer.s5.content')}
            </p>
          </section>

           {/* Section 6 */}
           <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-prepro-blue">
                <Scale size={24} />
              </div>
              <h2 className="text-2xl font-bold text-prepro-dark m-0">{t('disclaimer.s6.title')}</h2>
            </div>
            <p>
              {t('disclaimer.s6.content')}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;