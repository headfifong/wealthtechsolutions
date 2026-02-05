import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-prepro-dark text-gray-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-xl font-bold mb-4">{t('app.name')}</h3>
            <p className="mb-4 text-sm leading-relaxed max-w-sm">
              {t('footer.desc')}
            </p>
            <div className="flex space-x-4 mt-6">
               <span className="text-xs border border-gray-500 px-2 py-1 rounded">{t('footer.licence')}</span>
               <span className="text-xs border border-gray-500 px-2 py-1 rounded">{t('footer.iso')}</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-prepro-blue transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/marketplace" className="hover:text-prepro-blue transition-colors">{t('footer.marketplace')}</Link></li>
              <li><Link to="/analysis" className="hover:text-prepro-blue transition-colors">{t('footer.analysis')}</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-prepro-blue transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/disclaimer" className="hover:text-prepro-blue transition-colors">{t('footer.disclaimer')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-prepro-blue" />
                <span>{t('footer.emailAddr')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-prepro-blue" />
                <span>{t('footer.phoneNum')}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-prepro-blue mt-1 flex-shrink-0" />
                <span className="whitespace-pre-line">{t('footer.address')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-8 text-center text-xs text-gray-500">
          <p className="mb-2">
            {t('footer.important')}
          </p>
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;