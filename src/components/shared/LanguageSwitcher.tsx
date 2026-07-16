import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fa' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="px-3 py-1 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors text-white"
    >
      {i18n.language === 'en' ? 'فارسی' : 'English'}
    </button>
  );
}