import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 dark:bg-slate-950 dark:text-slate-500 border-t border-slate-800 transition-colors duration-300">
      {/* Disclaimer Banner */}
      <div className="bg-health-950/70 border-b border-health-900/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-3">
          <div className="flex items-center space-x-3 text-health-400">
            <Shield className="h-5 w-5 shrink-0" />
            <p className="text-xs font-semibold tracking-wide uppercase">Medical Disclaimer</p>
          </div>
          <p className="text-xs text-health-200/90 font-medium max-w-4xl text-center sm:text-left leading-relaxed">
            "{t('disclaimer')}"
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-600 font-bold text-sm shadow shadow-health-700">
                H
              </span>
              <span className="ml-2.5 text-base font-bold tracking-tight">
                Health<span className="text-health-500">AI</span> Awareness
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              Empowering communities with verified disease information, symptom awareness, and preventative healthcare insights driven by safe AI tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Quick Navigation</h3>
            <ul className="space-y-2 text-xs">
              {['home', 'chat', 'symptoms', 'library', 'tips'].map((tab) => (
                <li key={tab}>
                  <button
                    onClick={() => setActiveTab(tab)}
                    className="hover:text-health-400 transition-colors uppercase font-medium"
                  >
                    {t(tab)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Disease Groups</h3>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('library')} className="hover:text-health-400 transition-colors">Infectious Diseases</button></li>
              <li><button onClick={() => setActiveTab('library')} className="hover:text-health-400 transition-colors">Respiratory Conditions</button></li>
              <li><button onClick={() => setActiveTab('library')} className="hover:text-health-400 transition-colors">Cardiovascular Health</button></li>
              <li><button onClick={() => setActiveTab('library')} className="hover:text-health-400 transition-colors">Mental Health Disorders</button></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support Contact</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Mail size={14} className="text-health-500" />
                <span>support@healthai-portal.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={14} className="text-health-500" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={14} className="text-health-500" />
                <span>Global Health HQ, Sector 5, SF</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            &copy; 2026 HealthAI Awareness Portal. All rights reserved. Managed under global public health guidelines.
          </p>
          <div className="flex space-x-4 text-xs font-semibold">
            <a href="#" className="hover:text-health-400">Privacy Policy</a>
            <span className="text-slate-800">|</span>
            <a href="#" className="hover:text-health-400">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
