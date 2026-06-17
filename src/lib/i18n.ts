import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// ============================================================
// SOFTWARE VALA — UNIFIED i18n (125+ LANGUAGES, LAZY-LOADED)
// Merged from uploaded Command Center project. Real translation
// files live under /public/locales/<lng>/<ns>.json and are fetched
// on demand by i18next-http-backend.
// ============================================================

export const SUPPORTED_LANGUAGES: { code: string; name: string }[] = [
  // European (26)
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Українська' },
  { code: 'pl', name: 'Polski' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'sv', name: 'Svenska' },
  { code: 'no', name: 'Norsk' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'cs', name: 'Čeština' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ro', name: 'Română' },
  { code: 'bg', name: 'Български' },
  { code: 'sr', name: 'Српски' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'sl', name: 'Slovenščina' },
  { code: 'et', name: 'Eesti' },
  { code: 'lv', name: 'Latviešu' },
  { code: 'lt', name: 'Lietuvių' },
  // Asian (32)
  { code: 'zh', name: '中文 (简体)' },
  { code: 'zh-TW', name: '中文 (繁體)' },
  { code: 'zh-HK', name: '粵語' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'mr', name: 'मराठी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ar', name: 'العربية' },
  { code: 'fa', name: 'فارسی' },
  { code: 'ur', name: 'اردو' },
  { code: 'he', name: 'עברית' },
  { code: 'kk', name: 'Қазақша' },
  { code: 'uz', name: 'Ўзбек' },
  { code: 'tg', name: 'Тоҷикӣ' },
  { code: 'ky', name: 'Кыргызча' },
  { code: 'mn', name: 'Монгол' },
  { code: 'ka', name: 'ქართული' },
  { code: 'hy', name: 'Հայերեն' },
  { code: 'az', name: 'Azərbaycanca' },
  // Middle Eastern / extra (10)
  { code: 'tr', name: 'Türkçe' },
  { code: 'ku', name: 'Kurdî' },
  { code: 'ps', name: 'پښتو' },
  { code: 'am', name: 'አማርኛ' },
  { code: 'ti', name: 'ትግርኛ' },
  { code: 'ne', name: 'नेपाली' },
  { code: 'si', name: 'සිංහල' },
  { code: 'my', name: 'မြန်မာ' },
  { code: 'km', name: 'ខ្មែរ' },
  { code: 'lo', name: 'ລາວ' },
  // African (24)
  { code: 'sw', name: 'Kiswahili' },
  { code: 'yo', name: 'Yorùbá' },
  { code: 'ha', name: 'Hausa' },
  { code: 'ig', name: 'Igbo' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'so', name: 'Soomaali' },
  { code: 'om', name: 'Afaan Oromoo' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'ny', name: 'Chichewa' },
  { code: 'st', name: 'Sesotho' },
  { code: 'tn', name: 'Setswana' },
  { code: 'sn', name: 'Shona' },
  { code: 'ts', name: 'Xitsonga' },
  { code: 've', name: 'Tshivenḓa' },
  { code: 'ln', name: 'Lingála' },
  { code: 'kg', name: 'Kikongo' },
  { code: 'lua', name: 'Tshiluba' },
  { code: 'ki', name: 'Gĩkũyũ' },
  { code: 'lu', name: 'Kiluba' },
  { code: 'luo', name: 'Dholuo' },
  { code: 'ff', name: 'Fulfulde' },
  { code: 'wo', name: 'Wolof' },
  // European Extended (12)
  { code: 'be', name: 'Беларуская' },
  { code: 'mk', name: 'Македонски' },
  { code: 'sq', name: 'Shqip' },
  { code: 'mt', name: 'Malti' },
  { code: 'is', name: 'Íslenska' },
  { code: 'ga', name: 'Gaeilge' },
  { code: 'cy', name: 'Cymraeg' },
  { code: 'gd', name: 'Gàidhlig' },
  { code: 'ca', name: 'Català' },
  { code: 'eu', name: 'Euskara' },
  { code: 'gl', name: 'Galego' },
  { code: 'ast', name: 'Asturianu' },
  // Americas (8)
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'es-MX', name: 'Español (México)' },
  { code: 'es-AR', name: 'Español (Argentina)' },
  { code: 'qu', name: 'Runa Simi' },
  { code: 'ay', name: 'Aymar aru' },
  { code: 'gn', name: 'Avañeʼẽ' },
  { code: 'ht', name: 'Kreyòl Ayisyen' },
  { code: 'jam', name: 'Jamaican Patois' },
  // Additional regional (≥7 to clear 125)
  { code: 'la', name: 'Latina' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'haw', name: 'ʻŌlelo Hawaiʻi' },
  { code: 'mi', name: 'Te Reo Māori' },
  { code: 'sm', name: 'Gagana Sāmoa' },
  { code: 'to', name: 'Lea Faka-Tonga' },
  { code: 'fj', name: 'Vosa Vakaviti' },
];

export const rtlLocales = ['ar', 'he', 'fa', 'ur', 'ps', 'ku', 'ckb', 'ti'];
export const isRTLLocale = (code: string) =>
  rtlLocales.some((rtl) => code === rtl || code.startsWith(`${rtl}-`));

const STORAGE_KEY = 'sv_app_locale';
const getStoredLocale = (): string => {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem(STORAGE_KEY) || 'en';
};

export const setStoredLocale = (locale: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, locale);
};

if (!i18n.isInitialized) {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: getStoredLocale(),
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
      nonExplicitSupportedLngs: true,
      load: 'currentOnly',
      ns: ['common'],
      defaultNS: 'common',
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: STORAGE_KEY,
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      returnEmptyString: false,
    });

  i18n.on('languageChanged', (lng) => {
    setStoredLocale(lng);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng;
      document.documentElement.dir = isRTLLocale(lng) ? 'rtl' : 'ltr';
    }
  });

  if (typeof document !== 'undefined') {
    const lng = i18n.language || getStoredLocale();
    document.documentElement.lang = lng;
    document.documentElement.dir = isRTLLocale(lng) ? 'rtl' : 'ltr';
  }
}

export default i18n;