import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Activity, ShieldAlert, Heart, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

interface SymptomCheckerProps {
  setActiveTab: (tab: string) => void;
  setSelectedDiseaseName: (name: string) => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ setActiveTab, setSelectedDiseaseName }) => {
  const { t } = useLanguage();
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  
  const [localDiseases, setLocalDiseases] = useState<any[]>([]);

  // List of standard symptoms
  const availableSymptoms = [
    "Fever", "Cough", "Headache", "Fatigue", "Rash", 
    "Joint Pain", "Nausea", "Vomiting", "Breathing Difficulty"
  ];

  // Fetch local diseases for client fallback
  useEffect(() => {
    fetch('http://localhost:5000/api/diseases')
      .then(res => res.json())
      .then(data => setLocalDiseases(data))
      .catch(err => {
        console.warn("Using offline fallback to load diseases in symptom checker", err);
      });
  }, []);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleCheck = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    setHasChecked(true);

    try {
      const response = await fetch('http://localhost:5000/api/diseases/match-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.matches);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.warn("Symptom checker API failed, running client-side matching algorithm:", err);
      
      // CLIENT-SIDE FALLBACK MATCHING ALGORITHM
      const matches: any[] = [];
      const normalizedSelected = selectedSymptoms.map(s => s.toLowerCase().trim());
      
      // If we don't have local diseases, seed a few fallback records
      const databaseToUse = localDiseases.length > 0 ? localDiseases : [
        {
          name: "Dengue Fever",
          category: "Infectious Diseases",
          description: "A mosquito-borne viral disease caused by the dengue virus, transmitted primarily by female Aedes mosquitoes.",
          symptoms: ["High fever", "Severe headache", "Pain behind the eyes", "Joint and muscle pain", "Fatigue", "Nausea", "Vomiting", "Skin rash"],
          emergency_level: "High"
        },
        {
          name: "Malaria",
          category: "Infectious Diseases",
          description: "A life-threatening disease caused by Plasmodium parasites transmitted through infected mosquitoes.",
          symptoms: ["Fever", "Chills", "Sweating", "Headache", "Fatigue", "Nausea", "Vomiting", "Muscle aches"],
          emergency_level: "High"
        },
        {
          name: "Influenza (Flu)",
          category: "Respiratory Diseases",
          description: "A highly contagious viral infection of the respiratory tract.",
          symptoms: ["Fever", "Cough", "Sore throat", "Runny or stuffy nose", "Muscle or body aches", "Headache", "Fatigue"],
          emergency_level: "Medium"
        },
        {
          name: "COVID-19",
          category: "Infectious Diseases",
          description: "An infectious respiratory disease caused by the SARS-CoV-2 coronavirus.",
          symptoms: ["Fever", "Dry cough", "Shortness of breath", "Fatigue", "Loss of taste or smell", "Sore throat", "Congestion", "Body aches"],
          emergency_level: "High"
        }
      ];

      databaseToUse.forEach(disease => {
        let matchCount = 0;
        const diseaseSymptoms = disease.symptoms.map((s: string) => s.toLowerCase());

        normalizedSelected.forEach(sel => {
          const isMatched = diseaseSymptoms.some((ds: string) => ds.includes(sel) || sel.includes(ds));
          if (isMatched) {
            matchCount++;
          }
        });

        if (matchCount > 0) {
          const totalDiseaseSymptoms = disease.symptoms.length;
          const weight = (matchCount / totalDiseaseSymptoms) * 0.6 + (matchCount / selectedSymptoms.length) * 0.4;
          const confidence = Math.min(Math.round(weight * 100), 98);

          matches.push({
            id: disease.id || disease.name.replace(/\s+/g, '-').toLowerCase(),
            name: disease.name,
            category: disease.category,
            description: disease.description,
            matchedCount: matchCount,
            confidence,
            riskLevel: disease.emergency_level || "Medium"
          });
        }
      });

      matches.sort((a, b) => b.confidence - a.confidence || b.matchedCount - a.matchedCount);
      setResults(matches.slice(0, 10));
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (name: string) => {
    setSelectedDiseaseName(name);
    setActiveTab('library');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Disclaimer Warning */}
      <div className="mb-8 flex items-start space-x-3 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 p-4 rounded-xl dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 shadow-sm leading-relaxed">
        <ShieldAlert size={18} className="shrink-0 text-amber-500" />
        <div>
          <p className="font-bold text-amber-900 dark:text-amber-300 mb-0.5">Educational Purpose Only</p>
          <p>"{t('disclaimer')}"</p>
        </div>
      </div>

      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex rounded-xl bg-health-50 p-3 text-health-600 dark:bg-health-950/25 dark:text-health-450">
          <Activity size={24} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {t('symptomCheckerTitle')}
        </h1>
        <p className="text-sm text-slate-650 dark:text-slate-400 max-w-2xl mx-auto">
          {t('symptomCheckerSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column - Selectors (Col 5) */}
        <div className="md:col-span-5 glass-panel border border-slate-200/80 p-6 rounded-2xl shadow-md dark:border-slate-850">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
            Select Your Symptoms
          </h3>
          <div className="space-y-2.5">
            {availableSymptoms.map((symptom) => {
              const checked = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs font-semibold text-left transition-all ${
                    checked
                      ? 'border-health-500 bg-health-50 text-health-700 dark:bg-health-950/30 dark:text-health-400'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <span>{symptom}</span>
                  {checked && <CheckCircle2 size={16} className="text-health-600 shrink-0" />}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={handleCheck}
            disabled={selectedSymptoms.length === 0 || loading}
            className="w-full mt-6 rounded-xl bg-health-600 hover:bg-health-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold py-3 text-xs shadow-md shadow-health-200/30 transition-colors"
          >
            {loading ? t('loading') : t('checkHealthBtn')}
          </button>
        </div>

        {/* Right column - Results (Col 7) */}
        <div className="md:col-span-7 space-y-4">
          <div className="glass-panel border border-slate-200/80 p-6 rounded-2xl min-h-[380px] shadow-md dark:border-slate-850">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
              {t('possibleConditions')}
            </h3>

            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-3">
                <span className="typing-dots inline-flex items-center">
                  <span></span><span></span><span></span>
                </span>
                <p className="text-xs text-slate-400">Comparing inputs against 190+ public health profiles...</p>
              </div>
            ) : hasChecked && results.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-xs text-slate-500 font-semibold">No conditions matched your selected symptoms.</p>
                <p className="text-[10px] text-slate-400 max-w-sm mt-1">If you feel unwell, it is always recommended to consult a doctor, regardless of symptom matching results.</p>
              </div>
            ) : !hasChecked ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
                <HelpCircle size={36} className="mb-2 text-slate-300" />
                <p className="text-xs">Selected symptoms will appear here with calculated confidence metrics.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((match) => (
                  <div
                    key={match.name}
                    onClick={() => handleResultClick(match.name)}
                    className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:border-health-300 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 dark:bg-slate-950/10 hover:shadow transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-health-600 dark:group-hover:text-health-400">
                          {match.name}
                        </h4>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                          match.riskLevel === 'High' 
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-455'
                            : match.riskLevel === 'Medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-455'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-455'
                        }`}>
                          {match.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 max-w-[280px]">
                        {match.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end mt-3 sm:mt-0 space-x-4">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Confidence</p>
                        <p className="text-base font-extrabold text-health-600 dark:text-health-400">{match.confidence}%</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-health-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
