import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enWebsite from './locales/en/website.json';
import enCommon from './locales/en/common.json';

import idAuth from './locales/id/auth.json';
import idDashboard from './locales/id/dashboard.json';
import idWebsite from './locales/id/website.json';
import idCommon from './locales/id/common.json';

const resources = {
  en: {
    auth: enAuth,
    dashboard: enDashboard,
    website: enWebsite,
    common: enCommon,
  },
  id: {
    auth: idAuth,
    dashboard: idDashboard,
    website: idWebsite,
    common: idCommon,
  }
};

// Retrieve saved language from localStorage or default to ID
const savedLang = localStorage.getItem('lb_lang') || 'id';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'id',
    // We bind default namespace to 'dashboard' just in case, but we explicit target 'auth:key' in components
    defaultNS: 'dashboard',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
