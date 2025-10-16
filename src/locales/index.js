import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './translations/de.json';
import en from './translations/en.json';
import es from './translations/es.json';
import fil from './translations/fil.json';
import hi from './translations/hi.json';
import pt from './translations/pt.json';

const resources = {
  en: {
    translation: en
  },
  de: {
    translation: de
  },
  es: {
    translation: es
  },
  fil: {
    translation: fil
  },
  hi: {
    translation: hi
  },
  pt: {
    translation: pt
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'de', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // react already does escaping
    },
    
    // Optional: Add namespace support
    defaultNS: 'translation',
    ns: ['translation']
  });

export default i18n;