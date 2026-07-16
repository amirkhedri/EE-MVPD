import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default function Landing() {
  const { t, i18n } = useTranslation();
  
  // A small helper to flip the arrow icon based on language direction
  const isRtl = i18n.language === 'fa';

  return (
    <div className="min-h-screen bg-[#f0f7f9] relative flex flex-col items-center justify-center p-4">
      
      {/* Top Right Language Switcher */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
        <LanguageSwitcher />
      </div>

      <div className="max-w-5xl w-full space-y-12">
        
        {/* Header Section */}
        <div className="text-center flex flex-col items-center">
          <div className="border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600 mb-6 bg-white inline-flex items-center gap-2">
             <span className="text-brand-600">🛡️</span> {t('trust_badge')}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 flex gap-3 justify-center">
            {t('app_name')} {t('platform')}
          </h1>
          
          <p className="mt-6 text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t('landing_subtitle')}
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-3 gap-6 w-full">
          
          {/* Family Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="bg-[#3e6f7c] w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white">
              {/* Family Icon */}
              ♡
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">{t('family_title')}</h2>
            <p className="text-slate-500 text-sm flex-1 mb-6">{t('family_desc')}</p>
            <div className="flex gap-3">
              <Link to="/login" className="flex-1 py-2 text-center border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                {t('log_in')}
              </Link>
              <Link to="/signup" className="flex-1 py-2 text-center bg-[#3e6f7c] text-white rounded-lg text-sm font-medium hover:bg-[#2e5560]">
                {t('sign_up')}
              </Link>
            </div>
          </div>

          {/* Nurse Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="bg-[#4a72b0] w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white">
              {/* Stethoscope Icon */}
              🩺
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">{t('nurse_title')}</h2>
            <p className="text-slate-500 text-sm flex-1 mb-6">{t('nurse_desc')}</p>
            <div className="flex gap-3">
              <Link to="/login" className="flex-1 py-2 text-center border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                {t('log_in')}
              </Link>
              <Link to="/signup" className="flex-1 py-2 text-center bg-[#3e6f7c] text-white rounded-lg text-sm font-medium hover:bg-[#2e5560]">
                {t('sign_up')}
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="bg-[#1e293b] w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white">
              {/* Shield Icon */}
              ✓
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">{t('admin_title')}</h2>
            <p className="text-slate-500 text-sm flex-1 mb-6">{t('admin_desc')}</p>
            <div className="flex gap-3">
              <Link to="/login" className="w-full py-2 text-center border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                {t('log_in')}
              </Link>
            </div>
          </div>

        </div>

        {/* Footer Link */}
        <div className="text-center pt-8">
          <Link to="/demo" className="text-slate-600 font-medium hover:text-slate-900 flex items-center justify-center gap-2">
            {t('try_demo')}
            <span className="text-lg">{isRtl ? '←' : '→'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}