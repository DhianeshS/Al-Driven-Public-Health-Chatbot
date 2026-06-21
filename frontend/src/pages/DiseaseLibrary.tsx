import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, Heart, Share2, ShieldAlert, ArrowLeft, BookOpen, 
  Activity, AlertCircle, Apple, ShieldCheck, Info, Zap, 
  HelpCircle, Megaphone, FileText, ChevronDown, ChevronUp, 
  AlertTriangle, AlertOctagon, HeartPulse, Sparkles, ClipboardList
} from 'lucide-react';
import mockDiseases from '../data/diseases_data.json';

interface DiseaseLibraryProps {
  selectedDiseaseName: string;
  setSelectedDiseaseName: (name: string) => void;
}

// Category HSL Theme mappings for premium styling
const categoryThemes: Record<string, { bgGrad: string, text: string, border: string, badge: string, iconColor: string }> = {
  "Infectious Disease": {
    bgGrad: "from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-200/60 dark:border-teal-900/30",
    badge: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    iconColor: "text-teal-500"
  },
  "Respiratory Disease": {
    bgGrad: "from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200/60 dark:border-sky-900/30",
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    iconColor: "text-sky-500"
  },
  "Cardiovascular Disease": {
    bgGrad: "from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200/60 dark:border-rose-900/30",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    iconColor: "text-rose-500"
  },
  "Endocrine Disease": {
    bgGrad: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200/60 dark:border-amber-900/30",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    iconColor: "text-amber-500"
  },
  "Digestive Disease": {
    bgGrad: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200/60 dark:border-orange-900/30",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    iconColor: "text-orange-500"
  },
  "Neurological Disease": {
    bgGrad: "from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-200/60 dark:border-violet-900/30",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
    iconColor: "text-violet-500"
  },
  "Kidney Disease": {
    bgGrad: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200/60 dark:border-cyan-900/30",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
    iconColor: "text-cyan-500"
  },
  "Skin Disease": {
    bgGrad: "from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/20 dark:to-pink-950/20",
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    border: "border-fuchsia-200/60 dark:border-fuchsia-900/30",
    badge: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
    iconColor: "text-fuchsia-500"
  },
  "Bone and Joint Disease": {
    bgGrad: "from-lime-50 to-emerald-50 dark:from-lime-950/20 dark:to-emerald-950/20",
    text: "text-lime-700 dark:text-lime-400",
    border: "border-lime-200/60 dark:border-lime-900/30",
    badge: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
    iconColor: "text-lime-500"
  },
  "Mental Health Disorder": {
    bgGrad: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200/60 dark:border-purple-900/30",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    iconColor: "text-purple-500"
  },
  "Cancer": {
    bgGrad: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20",
    text: "text-rose-700 dark:text-rose-455",
    border: "border-rose-200/60 dark:border-rose-900/30",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    iconColor: "text-rose-500"
  }
};

export const DiseaseLibrary: React.FC<DiseaseLibraryProps> = ({ 
  selectedDiseaseName, 
  setSelectedDiseaseName 
}) => {
  const { t } = useLanguage();
  const { user, bookmarks, toggleBookmark } = useAuth();
  
  const [diseases, setDiseases] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [activeDetailDisease, setActiveDetailDisease] = useState<any | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'symptoms' | 'causes' | 'prevention' | 'treatment' | 'faqs'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Load diseases
  useEffect(() => {
    fetch('http://localhost:5000/api/diseases')
      .then(res => res.json())
      .then(data => {
        setDiseases(data);
        const cats = ['All', ...new Set(data.map((d: any) => d.category))] as string[];
        setCategories(cats);
      })
      .catch(err => {
        console.warn("Using offline fallback to load disease library data", err);
        setDiseases(mockDiseases);
        const cats = ['All', ...new Set(mockDiseases.map((d: any) => d.category))] as string[];
        setCategories(cats);
      });
  }, []);

  // Listen to outer selection
  useEffect(() => {
    if (selectedDiseaseName && diseases.length > 0) {
      const match = diseases.find(d => d.name.toLowerCase() === selectedDiseaseName.toLowerCase());
      if (match) {
        setActiveDetailDisease(match);
        setDetailTab('overview');
        setOpenFaqIdx(null);
      }
    }
  }, [selectedDiseaseName, diseases]);

  const handleDiseaseClick = (disease: any) => {
    setActiveDetailDisease(disease);
    setSelectedDiseaseName(disease.name);
    setDetailTab('overview');
    setOpenFaqIdx(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setActiveDetailDisease(null);
    setSelectedDiseaseName('');
  };

  const handleShare = () => {
    if (!activeDetailDisease) return;
    const url = `${window.location.origin}?disease=${encodeURIComponent(activeDetailDisease.name)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isSaved = activeDetailDisease && user
    ? bookmarks.some(b => b.itemType === 'disease' && b.itemId === activeDetailDisease.id)
    : false;

  // Filter list supporting detailed search criteria
  const filteredDiseases = diseases.filter(d => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    
    const q = searchQuery.toLowerCase();
    const nameMatch = d.name && d.name.toLowerCase().includes(q);
    const catMatch = d.category && d.category.toLowerCase().includes(q);
    const descMatch = (d.description && d.description.toLowerCase().includes(q)) || 
                      (d.short_description && d.short_description.toLowerCase().includes(q)) ||
                      (d.overview && d.overview.toLowerCase().includes(q));
    
    const symptomsMatch = d.symptoms && d.symptoms.some((s: string) => s.toLowerCase().includes(q));
    
    const rfArrayMatch = d.risk_factors && d.risk_factors.some((r: string) => r.toLowerCase().includes(q));
    const rfDetailMatch = d.risk_factors_detail && Object.values(d.risk_factors_detail).some((val: any) => 
      val && String(val).toLowerCase().includes(q)
    );
    
    const matchesSearch = nameMatch || catMatch || descMatch || symptomsMatch || rfArrayMatch || rfDetailMatch;
    return matchesCategory && matchesSearch;
  });

  const popularDiseases = diseases.slice(0, 4);

  // Get active styling details based on selected category
  const theme = activeDetailDisease 
    ? (categoryThemes[activeDetailDisease.category] || categoryThemes["Infectious Disease"])
    : categoryThemes["Infectious Disease"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Disclaimer banner */}
      <div className="mb-8 flex items-start space-x-3 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 p-4 rounded-xl dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 shadow-sm leading-relaxed">
        <ShieldAlert size={18} className="shrink-0 text-amber-500" />
        <div>
          <p className="font-bold text-amber-900 dark:text-amber-300 mb-0.5">Educational Purpose Only</p>
          <p>"{t('disclaimer') || 'This information is provided for educational and disease awareness purposes only. Always consult a healthcare professional.'}"</p>
        </div>
      </div>

      {activeDetailDisease ? (
        /* Disease Details Panel */
        <div className={`glass-panel border border-slate-200/80 rounded-2xl shadow-lg p-6 dark:border-slate-850 transition-all duration-500`}>
          <button
            onClick={handleBackToList}
            className="inline-flex items-center text-xs font-bold text-health-600 hover:text-health-700 mb-6 transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            <span>Back to Directory</span>
          </button>

          {/* Premium Header Card */}
          <div className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-r ${theme.bgGrad} p-6 mb-6 shadow-sm`}>
            <div className="absolute right-4 top-4 opacity-5 dark:opacity-10 pointer-events-none">
              <Sparkles size={120} className={theme.text} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div className="space-y-2.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${theme.badge}`}>
                    {activeDetailDisease.category}
                  </span>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                    activeDetailDisease.emergency_level === 'High' 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      : activeDetailDisease.emergency_level === 'Medium'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}>
                    {activeDetailDisease.emergency_level} Risk Level
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeDetailDisease.name}
                </h2>
                <p className="text-xs font-medium text-slate-650 dark:text-slate-300 leading-relaxed italic border-l-2 border-slate-300 dark:border-slate-700 pl-3">
                  {activeDetailDisease.short_description || activeDetailDisease.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                {user ? (
                  <button
                    onClick={() => toggleBookmark('disease', activeDetailDisease.id)}
                    className={`flex items-center space-x-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all shadow-sm ${
                      isSaved
                        ? 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/20'
                        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <Heart size={14} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 italic font-semibold mr-2 bg-slate-50 dark:bg-slate-950/20 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    Log in to save
                  </span>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-all shadow-sm"
                >
                  <Share2 size={14} />
                  <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details tab selector */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 my-6 overflow-x-auto space-x-2 scrollbar-none">
            {([
              { key: 'overview', label: 'Overview', icon: <BookOpen size={14} /> },
              { key: 'symptoms', label: 'Symptoms & Risks', icon: <Activity size={14} /> },
              { key: 'causes', label: 'Causes & Diet', icon: <FileText size={14} /> },
              { key: 'prevention', label: 'Prevention & Life', icon: <ShieldCheck size={14} /> },
              { key: 'treatment', label: 'Treatment & Recovery', icon: <HeartPulse size={14} /> },
              { key: 'faqs', label: 'FAQs & Awareness', icon: <HelpCircle size={14} /> }
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDetailTab(tab.key)}
                className={`flex items-center space-x-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  detailTab === tab.key
                    ? 'border-health-600 text-health-700 dark:border-health-450 dark:text-health-450'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="space-y-6 text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium transition-all duration-300">
            
            {/* OVERVIEW TAB */}
            {detailTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <div className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center">
                        <BookOpen size={16} className="text-health-600 mr-2 shrink-0" />
                        Disease Overview
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        {activeDetailDisease.overview || "No overview available."}
                      </p>
                    </div>

                    <div className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                        <Activity size={16} className="text-health-600 mr-2 shrink-0" />
                        Diagnosis Methods
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Physical Examination</span>
                          <span className="text-slate-600 dark:text-slate-400">{activeDetailDisease.diagnosis_methods?.physical_exam || "Visual check and vital assessment."}</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Laboratory Tests</span>
                          <span className="text-slate-600 dark:text-slate-400">{activeDetailDisease.diagnosis_methods?.laboratory_tests || "Blood or fluid panel tests."}</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Imaging Tests</span>
                          <span className="text-slate-600 dark:text-slate-400">{activeDetailDisease.diagnosis_methods?.imaging_tests || "X-ray or CT scans if necessary."}</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                          <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Screening Procedures</span>
                          <span className="text-slate-600 dark:text-slate-400">{activeDetailDisease.diagnosis_methods?.screening || "Standard risk factor assessment."}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Related Diseases */}
                    <div className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                        <Sparkles size={16} className="text-health-600 mr-2" />
                        Related Diseases
                      </h4>
                      <div className="space-y-2">
                        {activeDetailDisease.related_diseases?.map((relName: string, idx: number) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              const match = diseases.find(d => d.name.toLowerCase() === relName.toLowerCase());
                              if (match) handleDiseaseClick(match);
                            }}
                            className="p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-950/30 hover:border-health-400 cursor-pointer hover:shadow-sm transition-all text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center justify-between"
                          >
                            <span>{relName}</span>
                            <span className="text-[10px] text-health-600 dark:text-health-450">&rarr;</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Risk assessment */}
                    <div className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                        Disclaimer
                      </h4>
                      <p className="text-[11px] leading-relaxed text-slate-500 italic dark:text-slate-400">
                        {activeDetailDisease.disclaimer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SYMPTOMS & RISKS TAB */}
            {detailTab === 'symptoms' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Early Symptoms */}
                  <div className="border border-amber-100 dark:border-amber-900/20 p-5 rounded-2xl bg-amber-50/20 dark:bg-amber-950/5">
                    <h5 className="text-xs font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center">
                      <Info size={16} className="mr-2" />
                      Early Warning Signs
                    </h5>
                    <ul className="space-y-2">
                      {(activeDetailDisease.symptoms_detail?.early || []).map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Symptoms */}
                  <div className="border border-emerald-100 dark:border-emerald-900/20 p-5 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/5">
                    <h5 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center">
                      <Activity size={16} className="mr-2" />
                      Common Symptoms
                    </h5>
                    <ul className="space-y-2">
                      {(activeDetailDisease.symptoms_detail?.common || activeDetailDisease.symptoms || []).map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Severe Symptoms */}
                  <div className="border border-rose-100 dark:border-rose-900/20 p-5 rounded-2xl bg-rose-50/20 dark:bg-rose-950/5">
                    <h5 className="text-xs font-extrabold text-rose-800 dark:text-rose-455 uppercase tracking-wider mb-3 flex items-center">
                      <AlertOctagon size={16} className="mr-2" />
                      Severe Symptoms
                    </h5>
                    <ul className="space-y-2">
                      {(activeDetailDisease.symptoms_detail?.severe || []).map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span className="font-semibold text-rose-900 dark:text-rose-350">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                    <AlertTriangle size={16} className="text-health-600 mr-2 shrink-0" />
                    Target Risk Factors
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Age-Related Risks</span>
                      <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.risk_factors_detail?.age || "Age specific risk guidelines."}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Lifestyle Risks</span>
                      <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.risk_factors_detail?.lifestyle || "Lifestyle factors (e.g., diet, exercise)."}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Family History</span>
                      <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.risk_factors_detail?.family_history || "Genetic or family inheritance risks."}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Medical Conditions & Environment</span>
                      <p className="text-slate-650 dark:text-slate-400">
                        {activeDetailDisease.risk_factors_detail?.medical_conditions || "Co-existing medical triggers."} {activeDetailDisease.risk_factors_detail?.environmental}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Complications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                    <h5 className="text-xs font-bold text-rose-800 dark:text-rose-455 uppercase tracking-wider mb-2">Complications if Untreated</h5>
                    <p className="text-slate-600 dark:text-slate-400">{activeDetailDisease.complications?.untreated || "Risk of disease progression."}</p>
                  </div>
                  <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Long-Term Health Effects</h5>
                    <p className="text-slate-600 dark:text-slate-400">{activeDetailDisease.complications?.long_term || "Persistent chronic health consequences."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CAUSES & DIET TAB */}
            {detailTab === 'causes' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Causes details */}
                  <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center">
                      <FileText size={16} className="text-health-600 mr-2" />
                      Disease Causes
                    </h4>
                    <div className="space-y-3">
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-900 dark:text-slate-350 block mb-0.5">Primary Causes</span>
                        <p className="text-slate-600 dark:text-slate-400">{activeDetailDisease.causes_detail?.primary || activeDetailDisease.causes?.[0] || "Primary clinical causes."}</p>
                      </div>
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-900 dark:text-slate-350 block mb-0.5">Secondary Triggers</span>
                        <p className="text-slate-600 dark:text-slate-400">{activeDetailDisease.causes_detail?.secondary || "Secondary disease vectors."}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-350 block mb-0.5">Environmental & Genetic Factors</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {activeDetailDisease.causes_detail?.environmental} {activeDetailDisease.causes_detail?.genetic}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Diet */}
                  <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center">
                      <Apple size={16} className="text-health-600 mr-2" />
                      Dietary Recommendations
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Foods to Eat */}
                      <div className="p-4 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/20">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400 block mb-2">Foods to Eat</span>
                        <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                          {(activeDetailDisease.recommended_diet?.eat || []).map((food: string, idx: number) => (
                            <li key={idx}>{food}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Foods to Avoid */}
                      <div className="p-4 rounded-xl bg-rose-50/20 dark:bg-rose-950/5 border border-rose-100 dark:border-rose-900/20">
                        <span className="font-bold text-rose-800 dark:text-rose-455 block mb-2">Foods to Avoid</span>
                        <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                          {(activeDetailDisease.recommended_diet?.avoid || []).map((food: string, idx: number) => (
                            <li key={idx}>{food}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREVENTION & LIFESTYLE TAB */}
            {detailTab === 'prevention' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Prevention Details */}
                  <div className="md:col-span-2 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center">
                      <ShieldCheck size={16} className="text-health-600 mr-2" />
                      Preventative Guidelines
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Hygiene Practices</span>
                        <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.prevention_detail?.hygiene || "Cleanliness and sterilization procedures."}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Lifestyle Adaptations</span>
                        <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.prevention_detail?.lifestyle || "Lifestyle changes to avoid virus/condition."}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Vaccinations</span>
                        <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.prevention_detail?.vaccination || "Clinical immunization status details."}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Diet & Exercise</span>
                        <p className="text-slate-650 dark:text-slate-400">
                          {activeDetailDisease.prevention_detail?.dietary} {activeDetailDisease.prevention_detail?.exercise}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center">
                      <Info size={16} className="text-health-600 mr-2" />
                      Precautions
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-white dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-900 dark:text-slate-350 block mb-0.5">Daily Precautions</span>
                        <p className="text-slate-600 dark:text-slate-400">{activeDetailDisease.precautions_detail?.daily || activeDetailDisease.precautions?.[0]}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-900 dark:text-slate-350 block mb-0.5">Travel & Community Precautions</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {activeDetailDisease.precautions_detail?.travel} {activeDetailDisease.precautions_detail?.community}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lifestyle recommendations */}
                <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                    <Zap size={16} className="text-health-600 mr-2" />
                    Lifestyle Recommendations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                      <span className="font-extrabold text-health-700 dark:text-health-450 block mb-1">Exercise</span>
                      <span className="text-slate-600 dark:text-slate-455">{activeDetailDisease.lifestyle_recommendations?.exercise}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                      <span className="font-extrabold text-health-700 dark:text-health-455 block mb-1">Sleep</span>
                      <span className="text-slate-600 dark:text-slate-455">{activeDetailDisease.lifestyle_recommendations?.sleep}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                      <span className="font-extrabold text-health-700 dark:text-health-455 block mb-1">Stress Management</span>
                      <span className="text-slate-600 dark:text-slate-455">{activeDetailDisease.lifestyle_recommendations?.stress_management}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                      <span className="font-extrabold text-health-700 dark:text-health-455 block mb-1">Hydration</span>
                      <span className="text-slate-600 dark:text-slate-455">{activeDetailDisease.lifestyle_recommendations?.hydration}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TREATMENT & RECOVERY TAB */}
            {detailTab === 'treatment' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Basic treatment details */}
                  <div className="md:col-span-8 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 space-y-5">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center">
                      <HeartPulse size={16} className="text-health-600 mr-2" />
                      Treatment Plan
                    </h4>
                    <div className="space-y-4">
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">First-line Treatment</span>
                        <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.treatment_detail?.first_line || activeDetailDisease.basic_treatment?.[0]}</p>
                      </div>
                      <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Home Care Measures</span>
                        <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.treatment_detail?.home_care || activeDetailDisease.basic_treatment?.[1]}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-300 block mb-1">Clinical / Medical Management</span>
                        <p className="text-slate-650 dark:text-slate-400">{activeDetailDisease.treatment_detail?.medical || "Requires consulting standard clinic routines."}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recovery and management tips */}
                  <div className="md:col-span-4 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center">
                      <ClipboardList size={16} className="text-health-600 mr-2" />
                      Recovery & Management
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-900 dark:text-slate-350 block mb-1">Expected Recovery</span>
                        <p className="text-slate-600 dark:text-slate-400">{activeDetailDisease.recovery_management?.expected_recovery}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-900 dark:text-slate-350 block mb-1">Long-Term Tips</span>
                        <p className="text-slate-600 dark:text-slate-400">{activeDetailDisease.recovery_management?.long_term_tips}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consult and Emergency warning blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* When to consult */}
                  <div className="border border-amber-100 bg-amber-50/15 dark:bg-amber-950/5 dark:border-amber-900/30 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center">
                      <AlertTriangle size={18} className="mr-2 text-amber-500 shrink-0" />
                      When to Consult a Doctor
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                      {activeDetailDisease.when_to_consult}
                    </p>
                  </div>

                  {/* Emergency warnings */}
                  <div className="border border-rose-100 bg-rose-50/15 dark:bg-rose-950/5 dark:border-rose-900/30 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-455 uppercase tracking-wider mb-3 flex items-center">
                      <AlertOctagon size={18} className="mr-2 text-rose-500 shrink-0" />
                      Emergency Warning Signs (Seek Immediate Care)
                    </h4>
                    <p className="text-rose-900 dark:text-rose-350 font-bold leading-relaxed">
                      {activeDetailDisease.emergency_warning_signs}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FAQS & AWARENESS TAB */}
            {detailTab === 'faqs' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* 5 FAQs Accordion (Col 2) */}
                  <div className="lg:col-span-2 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center">
                      <HelpCircle size={16} className="text-health-600 mr-2" />
                      Frequently Asked Questions (FAQ)
                    </h4>
                    <div className="space-y-2">
                      {activeDetailDisease.faqs?.map((faq: { question: string, answer: string }, idx: number) => {
                        const isOpen = openFaqIdx === idx;
                        return (
                          <div 
                            key={idx} 
                            className="border border-slate-100 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-950/30 overflow-hidden transition-all"
                          >
                            <button
                              onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between p-4 text-xs font-bold text-left text-slate-850 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                            >
                              <span>{faq.question}</span>
                              {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </button>
                            {isOpen && (
                              <div className="p-4 pt-0 border-t border-slate-50 dark:border-slate-900/30 text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Public health awareness tips */}
                  <div className="border border-slate-100 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center">
                      <Megaphone size={16} className="text-health-600 mr-2" />
                      Public Health Awareness Tips
                    </h4>
                    <div className="space-y-3">
                      {activeDetailDisease.awareness_tips?.map((tip: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-health-50 text-[10px] font-extrabold text-health-600 dark:bg-health-950/30 dark:text-health-455">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-350">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Disease Listing View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Filters (Col 3) */}
          <div className="lg:col-span-3 glass-panel border border-slate-200/80 p-6 rounded-2xl shadow-md dark:border-slate-850">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
              Disease Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full rounded-xl py-2 px-3.5 text-left text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-health-50 text-health-700 dark:bg-health-950/40 dark:text-health-455'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-350'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Listing & Search (Col 9) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search diseases by name, symptoms, category, and risk factors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3.5 text-xs bg-white dark:bg-slate-900 dark:border-slate-850 dark:text-white focus:outline-none focus:border-health-500 shadow-sm"
              />
            </div>

            {/* Popular Diseases Highlight */}
            {searchQuery === '' && selectedCategory === 'All' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Popular Diseases Checked</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {popularDiseases.map((d) => (
                    <div
                      key={d.name}
                      onClick={() => handleDiseaseClick(d)}
                      className="border border-slate-200 dark:border-slate-800 hover:border-health-300 rounded-xl p-3 bg-white dark:bg-slate-900 cursor-pointer shadow-sm hover:shadow transition-all text-center group"
                    >
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-350 group-hover:text-health-600 dark:group-hover:text-health-400">{d.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">{d.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main grid list */}
            <div className="glass-panel border border-slate-200/80 p-6 rounded-2xl shadow-md min-h-[350px] dark:border-slate-850">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Disease Directory ({filteredDiseases.length})
                </h3>
              </div>

              {filteredDiseases.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xs text-slate-500 font-semibold">No diseases matched your criteria.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Try refining your search keyword or checking a different category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredDiseases.map((disease) => {
                    const cardTheme = categoryThemes[disease.category] || categoryThemes["Infectious Disease"];
                    return (
                      <div
                        key={disease.name}
                        onClick={() => handleDiseaseClick(disease)}
                        className="border border-slate-100 dark:border-slate-800 hover:border-health-250 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/20 hover:shadow cursor-pointer transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] font-bold uppercase ${cardTheme.text}`}>{disease.category}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                              disease.emergency_level === 'High' 
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30'
                                : disease.emergency_level === 'Medium'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                            }`}>
                              {disease.emergency_level}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-health-600 dark:group-hover:text-health-400">
                            {disease.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {disease.short_description || disease.description}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-semibold text-health-600 dark:text-health-455">View Profile &rarr;</span>
                          <span>{disease.symptoms?.length || 0} Symptoms</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
