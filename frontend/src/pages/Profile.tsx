import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Globe, Heart, Bookmark, Calendar, Check, Edit2 } from 'lucide-react';

interface ProfileProps {
  setActiveTab: (tab: string) => void;
  setSelectedDiseaseName: (name: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ setActiveTab, setSelectedDiseaseName }) => {
  const { user, bookmarks, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [editMode, setEditMode] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(user?.fullName || 'John');
  const [saving, setSaving] = useState(false);
  
  const [localDiseases, setLocalDiseases] = useState<any[]>([]);

  // Load all diseases for bookmark mapping
  useEffect(() => {
    fetch('http://localhost:5000/api/diseases')
      .then(res => res.json())
      .then(data => setLocalDiseases(data))
      .catch(err => {
        console.warn("Using offline fallback to load diseases in profile", err);
        // Offline backup: try loading from localStorage or keep empty
      });
  }, []);

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold">Please Log In</h2>
        <p className="text-slate-500 text-xs mt-2">You need to sign in to access your profile statistics.</p>
        <button
          onClick={() => setActiveTab('login')}
          className="mt-4 rounded-xl bg-health-600 px-5 py-2.5 text-xs font-bold text-white"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Get bookmarked diseases list
  const savedDiseaseBookmarks = bookmarks.filter(b => b.itemType === 'disease');
  const bookmarkedDiseases = localDiseases.filter(d => 
    savedDiseaseBookmarks.some(b => b.itemId === d.id || b.itemId === d.name.replace(/\s+/g, '-').toLowerCase())
  );

  const handleSave = async () => {
    setSaving(true);
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;
    const success = await updateProfile({
      fullName,
      preferredLang: language,
      avatarUrl: newAvatar
    });
    if (success) {
      setEditMode(false);
    }
    setSaving(false);
  };

  const handleLangChange = (lang: 'en' | 'ta' | 'hi') => {
    setLanguage(lang);
    updateProfile({ preferredLang: lang });
  };

  const formattedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'June 20, 2026';

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Card Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel border border-slate-200/80 p-6 rounded-2xl shadow-md text-center dark:border-slate-850">
            <div className="relative inline-block">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-28 w-28 rounded-full border-4 border-health-500 bg-slate-100 mx-auto shadow-sm"
              />
              {editMode && (
                <button
                  type="button"
                  onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                  className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 text-[10px] font-bold"
                  title="Randomize Avatar"
                >
                  Roll
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {editMode ? (
                <div className="flex gap-2 items-center justify-center">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-44 bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-1.5 bg-health-600 text-white rounded-lg hover:bg-health-700"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center justify-center">
                  <span>{user.fullName}</span>
                  <button onClick={() => setEditMode(true)} className="ml-1.5 text-slate-400 hover:text-slate-600">
                    <Edit2 size={12} />
                  </button>
                </h3>
              )}
              <p className="text-xs text-slate-500">{user.email}</p>
              <span className="inline-block rounded-full bg-health-100 text-health-800 dark:bg-health-950/40 dark:text-health-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                {user.role} Account
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              <Calendar size={14} className="text-health-500" />
              <span>Joined {formattedDate}</span>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-panel border border-slate-200/80 p-6 rounded-2xl shadow-md dark:border-slate-850">
            <h4 className="text-xs font-bold text-slate-450 uppercase mb-4 tracking-wider flex items-center">
              <Globe size={14} className="mr-1.5 text-health-500" />
              <span>Language Preference</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(['en', 'ta', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLangChange(lang)}
                  className={`rounded-lg py-2 text-xs font-semibold border ${
                    language === lang
                      ? 'border-health-500 bg-health-50 text-health-700 dark:bg-health-950/30 dark:text-health-400'
                      : 'border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  {lang === 'en' && 'English'}
                  {lang === 'ta' && 'தமிழ்'}
                  {lang === 'hi' && 'हिंदी'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Saved Diseases */}
          <div className="glass-panel border border-slate-200/80 p-6 rounded-2xl shadow-md dark:border-slate-850">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Heart className="mr-2 text-rose-500 fill-rose-500" size={20} />
              <span>Saved Diseases ({bookmarkedDiseases.length})</span>
            </h3>

            {bookmarkedDiseases.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl dark:border-slate-800">
                <p className="text-xs text-slate-500">No diseases saved yet.</p>
                <button
                  onClick={() => setActiveTab('library')}
                  className="mt-3 text-xs font-bold text-health-600 hover:underline"
                >
                  Browse Disease Library
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bookmarkedDiseases.map((disease) => (
                  <div
                    key={disease.name}
                    className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:border-health-200 cursor-pointer flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20"
                    onClick={() => {
                      setSelectedDiseaseName(disease.name);
                      setActiveTab('library');
                    }}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{disease.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{disease.category}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${
                      disease.emergency_level === 'High' 
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                        : disease.emergency_level === 'Medium'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    }`}>
                      {disease.emergency_level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other Bookmarked Items (Tips/Articles) */}
          <div className="glass-panel border border-slate-200/80 p-6 rounded-2xl shadow-md dark:border-slate-850">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Bookmark className="mr-2 text-health-600 fill-health-600" size={20} />
              <span>Saved Articles & Tips</span>
            </h3>

            {bookmarks.filter(b => b.itemType !== 'disease').length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl dark:border-slate-800">
                <p className="text-xs text-slate-500">No articles or health tips bookmarked yet.</p>
                <button
                  onClick={() => setActiveTab('tips')}
                  className="mt-3 text-xs font-bold text-health-600 hover:underline"
                >
                  Explore Tips & Articles
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarks
                  .filter(b => b.itemType !== 'disease')
                  .map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setActiveTab('tips')}
                      className="border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between hover:border-health-200 cursor-pointer bg-slate-50/50 dark:bg-slate-950/20"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-650 font-bold px-2 py-0.5 rounded uppercase">
                          {b.itemType}
                        </span>
                        <span className="text-xs font-semibold text-slate-850 dark:text-slate-350">
                          Saved {b.itemType === 'tip' ? 'Daily Health Alert' : 'Medical Awareness Article'}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
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
