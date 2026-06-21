import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Sun, Moon, Globe, LogOut, Shield, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'chat', label: t('chat') },
    { id: 'symptoms', label: t('symptoms') },
    { id: 'library', label: t('library') },
    { id: 'tips', label: t('tips') },
  ];

  if (user && user.role === 'admin') {
    navItems.push({ id: 'admin', label: t('admin') });
  }

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'hi', name: 'हिंदी' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/85 dark:bg-slate-900/80 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-health-600 text-white shadow-md shadow-health-200/50 dark:shadow-health-950/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </span>
            <span className="ml-3 text-lg font-bold tracking-tight text-slate-800 dark:text-white sm:block hidden">
              Health<span className="text-health-600">AI</span> Portal
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-health-50 text-health-700 dark:bg-health-950/40 dark:text-health-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                title="Select Language"
              >
                <Globe size={18} />
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>
              
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full rounded-md px-3 py-1.5 text-left text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        language === lang.code ? 'text-health-600 dark:text-health-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile / Auth */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full border-2 border-health-500 bg-slate-100"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold leading-none">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="rounded-full p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  title={t('logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleNavClick('login')}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white px-3 py-1.5"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="rounded-lg bg-health-600 hover:bg-health-700 text-white px-4 py-2 text-sm font-semibold shadow-md shadow-health-200/50 dark:shadow-none transition-all duration-200"
                >
                  {t('signup')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button onClick={toggleTheme} className="rounded-full p-2 text-slate-500 dark:text-slate-400">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pb-4 pt-2 dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-top-5 duration-200">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-health-50 text-health-700 dark:bg-health-950/40 dark:text-health-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {/* Mobile Languages */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Select Language</p>
              <div className="flex space-x-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`rounded-md px-3 py-1 text-xs font-medium border ${
                      language === lang.code
                        ? 'border-health-500 bg-health-50 text-health-600 dark:bg-health-950/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile User Profile / Auth */}
            {user ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center space-x-3 text-slate-700 dark:text-slate-300"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-9 w-9 rounded-full border border-health-500 bg-slate-100"
                  />
                  <div>
                    <p className="text-sm font-semibold">{user.fullName}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10"
                >
                  <LogOut size={16} />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 py-2.5 text-center text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="w-full rounded-lg bg-health-600 py-2.5 text-center text-sm font-semibold text-white"
                >
                  {t('signup')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
