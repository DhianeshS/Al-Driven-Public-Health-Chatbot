import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Bookmark, Share2, Search, FileText, Activity, ShieldAlert } from 'lucide-react';
import mockTips from '../data/health_tips.json';
import mockArticles from '../data/articles.json';

export const TipsAndArticles: React.FC = () => {
  const { t } = useLanguage();
  const { user, bookmarks, toggleBookmark } = useAuth();
  
  const [activeView, setActiveView] = useState<'tips' | 'articles'>('tips');
  const [tips, setTips] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  
  const [tipCategory, setTipCategory] = useState('All');
  const [artCategory, setArtCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeArticleDetail, setActiveArticleDetail] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    fetch('http://localhost:5000/api/content/tips')
      .then(res => res.json())
      .then(data => setTips(data))
      .catch(err => {
        console.warn("Using offline fallback to load health tips", err);
        setTips(mockTips);
      });

    fetch('http://localhost:5000/api/content/articles')
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(err => {
        console.warn("Using offline fallback to load health articles", err);
        setArticles(mockArticles);
      });
  }, []);

  const handleLikeTip = (id: string) => {
    fetch(`http://localhost:5000/api/content/tips/${id}/like`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setTips(prev => prev.map(t => t.id === id ? { ...t, likes: data.likes } : t));
      })
      .catch(() => {
        // Local state like
        setTips(prev => prev.map(t => t.id === id ? { ...t, likes: (t.likes || 0) + 1 } : t));
      });
  };

  const handleLikeArticle = (id: string) => {
    fetch(`http://localhost:5000/api/content/articles/${id}/like`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setArticles(prev => prev.map(a => a.id === id ? { ...a, likes: data.likes } : a));
      })
      .catch(() => {
        // Local state like
        setArticles(prev => prev.map(a => a.id === id ? { ...a, likes: (a.likes || 0) + 1 } : a));
      });
  };

  const handleShare = (type: 'tip' | 'article', id: string, title: string) => {
    const url = `${window.location.origin}?${type}=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);

    // Call share api to log metrics
    fetch(`http://localhost:5000/api/content/${type}s/${id}/share`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (type === 'tip') {
          setTips(prev => prev.map(t => t.id === id ? { ...t, shares: data.shares } : t));
        } else {
          setArticles(prev => prev.map(a => a.id === id ? { ...a, shares: data.shares } : a));
        }
      })
      .catch(() => {});
  };

  const tipCategories = ['All', 'Nutrition', 'Fitness', 'Mental Health', 'Hygiene', 'Disease Prevention'];
  const artCategories = ['All', 'Heart Health', 'Diabetes', 'Mental Health', 'Nutrition', 'Infectious Diseases'];

  const filteredTips = tips.filter(t => {
    const matchesCat = tipCategory === 'All' || t.category === tipCategory;
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredArticles = articles.filter(a => {
    const matchesCat = artCategory === 'All' || a.category === artCategory;
    const matchesQuery = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Disclaimer warning */}
      <div className="mb-8 flex items-start space-x-3 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 p-4 rounded-xl dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 shadow-sm leading-relaxed">
        <ShieldAlert size={18} className="shrink-0 text-amber-500" />
        <div>
          <p className="font-bold text-amber-900 dark:text-amber-300 mb-0.5">Educational Purpose Only</p>
          <p>"{t('disclaimer')}"</p>
        </div>
      </div>

      {activeArticleDetail ? (
        /* Detailed Article View */
        <div className="glass-panel border border-slate-200/80 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto shadow-lg dark:border-slate-850">
          <button
            onClick={() => setActiveArticleDetail(null)}
            className="text-xs font-bold text-health-600 hover:underline mb-6"
          >
            &larr; Back to Health Library
          </button>
          
          <img
            src={activeArticleDetail.image_url}
            alt={activeArticleDetail.title}
            className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm border border-slate-100 dark:border-slate-800"
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              <span>Category: {activeArticleDetail.category}</span>
              <span>{activeArticleDetail.read_time}</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {activeArticleDetail.title}
            </h2>

            <div className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-medium pt-3 space-y-4">
              {activeArticleDetail.content.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex justify-between items-center">
              <div className="flex items-center space-x-3 text-xs font-semibold">
                <button
                  onClick={() => handleLikeArticle(activeArticleDetail.id)}
                  className="flex items-center space-x-1 text-slate-500 hover:text-rose-500"
                >
                  <Heart size={14} className="hover:fill-rose-500" />
                  <span>{activeArticleDetail.likes || 0}</span>
                </button>
                {user ? (
                  <button
                    onClick={() => toggleBookmark('article', activeArticleDetail.id)}
                    className="flex items-center space-x-1 text-slate-500 hover:text-health-600"
                  >
                    <Bookmark
                      size={14}
                      className={bookmarks.some(b => b.itemType === 'article' && b.itemId === activeArticleDetail.id) ? 'fill-health-600 text-health-600' : ''}
                    />
                    <span>Save</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Log in to save</span>
                )}
              </div>
              <button
                onClick={() => handleShare('article', activeArticleDetail.id, activeArticleDetail.title)}
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                <Share2 size={14} />
                <span>{copiedLink === activeArticleDetail.id ? 'Copied!' : 'Share Link'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* List Mode tabs */
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex space-x-2">
              <button
                onClick={() => { setActiveView('tips'); setSearchQuery(''); }}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                  activeView === 'tips'
                    ? 'bg-health-600 text-white shadow-health-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                Daily Health Tips
              </button>
              <button
                onClick={() => { setActiveView('articles'); setSearchQuery(''); }}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                  activeView === 'articles'
                    ? 'bg-health-600 text-white shadow-health-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                Awareness Articles
              </button>
            </div>

            {/* Local page search bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={activeView === 'tips' ? "Search daily tips..." : "Search articles..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none focus:border-health-500 shadow-sm"
              />
            </div>
          </div>

          {activeView === 'tips' ? (
            /* Health Tips Section */
            <div className="space-y-6">
              {/* Category selector */}
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {tipCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTipCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-colors shrink-0 ${
                      tipCategory === cat
                        ? 'bg-health-100 text-health-800 dark:bg-health-950/40 dark:text-health-455'
                        : 'border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTips.map((tip) => {
                  const isSaved = user && bookmarks.some(b => b.itemType === 'tip' && b.itemId === tip.id);
                  return (
                    <div
                      key={tip.id}
                      className="glass-panel border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between shadow-sm dark:border-slate-850"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-health-600 bg-health-50 px-2 py-0.5 rounded uppercase dark:bg-health-950/20 dark:text-health-455">
                            {tip.category}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(tip.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{tip.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{tip.content}</p>
                      </div>

                      {/* Interaction footer */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex justify-between items-center text-slate-500">
                        <div className="flex items-center space-x-3 text-[11px] font-bold">
                          <button
                            onClick={() => handleLikeTip(tip.id)}
                            className="flex items-center space-x-1 hover:text-rose-500"
                          >
                            <Heart size={14} className="hover:fill-rose-500" />
                            <span>{tip.likes || 0}</span>
                          </button>
                          {user ? (
                            <button
                              onClick={() => toggleBookmark('tip', tip.id)}
                              className="flex items-center space-x-1 hover:text-health-600"
                            >
                              <Bookmark
                                size={14}
                                className={isSaved ? 'fill-health-600 text-health-600' : ''}
                              />
                              <span>Save</span>
                            </button>
                          ) : (
                            <span className="text-[9px] text-slate-450 italic font-medium">Log in to save</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleShare('tip', tip.id, tip.title)}
                          className="flex items-center space-x-1.5 hover:text-slate-800 dark:hover:text-slate-300"
                          title="Share"
                        >
                          <Share2 size={14} />
                          <span className="text-[10px] font-bold">{copiedLink === tip.id ? 'Copied!' : 'Share'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Health Articles Section */
            <div className="space-y-6">
              {/* Category selector */}
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {artCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setArtCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-colors shrink-0 ${
                      artCategory === cat
                        ? 'bg-health-100 text-health-800 dark:bg-health-950/40 dark:text-health-455'
                        : 'border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Articles Grid List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArticles.map((art) => {
                  const isSaved = user && bookmarks.some(b => b.itemType === 'article' && b.itemId === art.id);
                  return (
                    <div
                      key={art.id}
                      className="glass-panel border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow dark:border-slate-850"
                    >
                      <img
                        src={art.image_url}
                        alt={art.title}
                        className="w-full md:w-44 h-48 md:h-full object-cover border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-100"
                      />
                      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            <span>{art.category}</span>
                            <span>{art.read_time}</span>
                          </div>
                          <h4
                            onClick={() => setActiveArticleDetail(art)}
                            className="text-sm font-extrabold text-slate-900 dark:text-white hover:text-health-600 cursor-pointer line-clamp-2 leading-snug"
                          >
                            {art.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-medium">
                            {art.content}
                          </p>
                        </div>

                        <div className="border-t border-slate-50 dark:border-slate-850/60 pt-3 flex justify-between items-center text-slate-500">
                          <div className="flex items-center space-x-3 text-[10px] font-bold">
                            <button
                              onClick={() => handleLikeArticle(art.id)}
                              className="flex items-center space-x-1 hover:text-rose-500"
                            >
                              <Heart size={13} className="hover:fill-rose-500" />
                              <span>{art.likes || 0}</span>
                            </button>
                            {user ? (
                              <button
                                onClick={() => toggleBookmark('article', art.id)}
                                className="flex items-center space-x-1 hover:text-health-600"
                              >
                                <Bookmark
                                  size={13}
                                  className={isSaved ? 'fill-health-600 text-health-600' : ''}
                                />
                                <span>Save</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 italic">Login to save</span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleShare('article', art.id, art.title)}
                            className="flex items-center space-x-1 hover:text-slate-800"
                            title="Share"
                          >
                            <Share2 size={13} />
                            <span className="text-[9px] font-bold">{copiedLink === art.id ? 'Copied!' : 'Share'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
