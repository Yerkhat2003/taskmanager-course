import { useTranslation } from 'react-i18next';

function Header({ currentPage, onPageChange, onMenuToggle, darkMode, onToggleDarkMode, onExport }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  const handleNavigation = (page) => {
    onPageChange(page);
  };

  return (
    <header className="bg-slate-800 dark:bg-slate-900 text-white px-2 sm:px-4 py-2 sm:py-3 sticky top-0 z-50 shadow-md border-b border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink">
          <button
            onClick={onMenuToggle}
            className="text-white hover:text-gray-300 transition-colors p-1 flex-shrink-0"
            aria-label="Toggle menu"
            title={t('header.toggleMenu')}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 className="text-base sm:text-2xl font-bold truncate">TaskNest</h1>
          <span className="hidden sm:inline text-gray-300 text-sm">
            Ваш центр управления задачами
          </span>
        </div>
        <nav className="flex items-center gap-0.5 sm:gap-2 md:gap-2 flex-shrink-0">
          <div className="relative group">
            <button
              className="px-1.5 sm:px-3 py-1 sm:py-2 rounded-md text-[10px] sm:text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              title={t('header.language')}
              aria-label={t('header.language')}
              onMouseEnter={(e) => {
                const menu = e.currentTarget.nextElementSibling;
                if (menu) menu.classList.remove('opacity-0', 'invisible');
              }}
              onMouseLeave={(e) => {
                const menu = e.currentTarget.nextElementSibling;
                if (menu) menu.classList.add('opacity-0', 'invisible');
              }}
            >
              {i18n.language.toUpperCase()}
            </button>
            <div 
              className="absolute right-0 mt-2 w-32 bg-slate-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
              onMouseEnter={(e) => e.currentTarget.classList.remove('opacity-0', 'invisible')}
              onMouseLeave={(e) => e.currentTarget.classList.add('opacity-0', 'invisible')}
            >
              <button
                onClick={() => changeLanguage('ru')}
                className={`w-full text-left px-3 py-2 text-sm rounded-t-md hover:bg-slate-600 transition-colors ${
                  i18n.language === 'ru' ? 'bg-slate-600' : ''
                }`}
              >
                🇷🇺 Русский
              </button>
              <button
                onClick={() => changeLanguage('kk')}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-600 transition-colors ${
                  i18n.language === 'kk' ? 'bg-slate-600' : ''
                }`}
              >
                🇰🇿 Қазақша
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full text-left px-3 py-2 text-sm rounded-b-md hover:bg-slate-600 transition-colors ${
                  i18n.language === 'en' ? 'bg-slate-600' : ''
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>
          <button
            onClick={onExport}
            className="hidden sm:flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            title={t('header.export')}
            aria-label={t('header.export')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden md:inline">{t('header.export')}</span>
          </button>
          <button
            onClick={onToggleDarkMode}
            className="px-1.5 sm:px-3 py-1 sm:py-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
            title={darkMode ? t('header.lightMode') : t('header.darkMode')}
            aria-label={darkMode ? t('header.lightMode') : t('header.darkMode')}
          >
            {darkMode ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleNavigation("tasks")}
            className={`transition-colors duration-200 px-1.5 sm:px-3 py-1 sm:py-2 rounded-md text-[10px] sm:text-sm ${
              currentPage === "tasks"
                ? "text-white bg-slate-700"
                : "text-gray-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            {t('header.tasks')}
          </button>
          <button
            onClick={() => handleNavigation("boards")}
            className={`transition-colors duration-200 px-1.5 sm:px-3 py-1 sm:py-2 rounded-md text-[10px] sm:text-sm ${
              currentPage === "boards"
                ? "text-white bg-slate-700"
                : "text-gray-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            {t('header.boards')}
          </button>
          <button
            onClick={() => handleNavigation("userform")}
            className={`transition-colors duration-200 px-1.5 sm:px-4 py-1 sm:py-2 rounded-md border text-[10px] sm:text-sm ${
              currentPage === "userform"
                ? "text-white bg-slate-700 border-slate-500"
                : "text-gray-300 hover:text-white hover:bg-slate-700 border-slate-600 hover:border-slate-500"
            }`}
          >
            {t('header.profile')}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
