import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Heart, 
  Trash2, 
  Plus, 
  Edit3, 
  Megaphone, 
  HelpCircle,
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'diseases' | 'users' | 'tips' | 'articles' | 'campaigns' | 'complaints' | 'feedback'>('analytics');
  
  // Data lists
  const [diseases, setDiseases] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  
  // Forms & Modals
  const [showAddDisease, setShowAddDisease] = useState(false);
  const [diseaseForm, setDiseaseForm] = useState({
    name: '', category: 'Infectious Diseases', description: '',
    symptoms: '', causes: '', risk_factors: '', precautions: '',
    prevention: '', basic_treatment: '', emergency_level: 'Medium'
  });

  const [showAddTip, setShowAddTip] = useState(false);
  const [tipForm, setTipForm] = useState({ title: '', content: '', category: 'Nutrition' });

  const [showAddArticle, setShowAddArticle] = useState(false);
  const [articleForm, setArticleForm] = useState({ title: '', content: '', category: 'Nutrition', readTime: '5 min read', imageUrl: '' });

  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ title: '', description: '', targetDisease: '', status: 'Active' });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch admin stats & tables
  const loadStats = () => {
    fetch('http://localhost:5000/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setFeedback(data.recentFeedback || []);
      })
      .catch(err => {
        console.warn("Failed loading admin stats, using offline mock statistics", err);
        // Offline mock stats
        setStats({
          summary: { users: 145, diseases: 190, chatSessions: 524, feedbackCount: 18 },
          analytics: {
            mostSearchedDiseases: [
              { name: 'Dengue Fever', count: 124 },
              { name: 'Malaria', count: 98 },
              { name: 'Type 2 Diabetes', count: 85 },
              { name: 'Hypertension', count: 76 }
            ],
            popularSymptoms: [
              { symptom: 'Fever', count: 245 },
              { symptom: 'Cough', count: 198 },
              { symptom: 'Fatigue', count: 154 }
            ],
            userGrowth: [
              { month: 'Apr', users: 76 },
              { month: 'May', users: 110 },
              { month: 'Jun', users: 145 }
            ],
            chatUsage: [
              { day: 'Wed', queries: 42 },
              { day: 'Thu', queries: 38 },
              { day: 'Fri', queries: 54 },
              { day: 'Sat', queries: 65 }
            ]
          }
        });
      });
  };

  const loadDataTables = () => {
    fetch('http://localhost:5000/api/diseases')
      .then(res => res.json())
      .then(data => setDiseases(data))
      .catch(() => {});

    fetch('http://localhost:5000/api/auth/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsersList(data))
      .catch(() => {});

    fetch('http://localhost:5000/api/content/tips')
      .then(res => res.json())
      .then(data => setTips(data))
      .catch(() => {});

    fetch('http://localhost:5000/api/content/articles')
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(() => {});

    fetch('http://localhost:5000/api/content/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(() => {});

    fetch('http://localhost:5000/api/complaints', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setComplaints(data))
      .catch(() => {
        const guestCamps = JSON.parse(localStorage.getItem('guest_complaints') || '[]');
        setComplaints(guestCamps);
      });
  };

  const handleUpdateComplaintStatus = (id: string, status: string) => {
    fetch(`http://localhost:5000/api/complaints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (res.ok) {
          showNotification('success', 'Complaint status updated!');
          setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        
        const guestCamps = JSON.parse(localStorage.getItem('guest_complaints') || '[]');
        const idx = guestCamps.findIndex((c: any) => c.id === id);
        if (idx !== -1) {
          guestCamps[idx].status = status;
          localStorage.setItem('guest_complaints', JSON.stringify(guestCamps));
        }
        showNotification('success', 'Status updated locally');
      });
  };

  useEffect(() => {
    if (token) {
      loadStats();
      loadDataTables();
    }
  }, [token]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Delete handlers
  const handleDeleteDisease = (id: string) => {
    fetch(`http://localhost:5000/api/diseases/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          showNotification('success', 'Disease profile deleted successfully');
          setDiseases(prev => prev.filter(d => d.id !== id));
          loadStats();
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        // Local fallback delete
        setDiseases(prev => prev.filter(d => d.id !== id && d.name.replace(/\s+/g, '-').toLowerCase() !== id.toLowerCase()));
        showNotification('success', 'Deleted locally (Server offline)');
      });
  };

  const handleDeleteUser = (id: string) => {
    fetch(`http://localhost:5000/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          showNotification('success', 'User session removed successfully');
          setUsersList(prev => prev.filter(u => u.id !== id));
          loadStats();
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        setUsersList(prev => prev.filter(u => u.id !== id));
        showNotification('success', 'Removed locally (Server offline)');
      });
  };

  // Add handlers
  const handleAddDiseaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedData = {
      ...diseaseForm,
      symptoms: diseaseForm.symptoms.split(',').map(s => s.trim()),
      causes: diseaseForm.causes.split(',').map(s => s.trim()),
      risk_factors: diseaseForm.risk_factors.split(',').map(s => s.trim()),
      precautions: diseaseForm.precautions.split(',').map(s => s.trim()),
      prevention: diseaseForm.prevention.split(',').map(s => s.trim()),
      basic_treatment: diseaseForm.basic_treatment.split(',').map(s => s.trim())
    };

    fetch('http://localhost:5000/api/diseases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formattedData)
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error();
      })
      .then((newDisease) => {
        showNotification('success', 'New disease cataloged successfully!');
        setDiseases(prev => [...prev, newDisease]);
        setShowAddDisease(false);
        setDiseaseForm({
          name: '', category: 'Infectious Diseases', description: '',
          symptoms: '', causes: '', risk_factors: '', precautions: '',
          prevention: '', basic_treatment: '', emergency_level: 'Medium'
        });
        loadStats();
      })
      .catch(() => {
        // Mock add locally
        const mockNew = {
          id: 'dis-' + Date.now(),
          ...formattedData
        };
        setDiseases(prev => [...prev, mockNew]);
        setShowAddDisease(false);
        showNotification('success', 'Added disease locally (Server offline)');
      });
  };

  const handleAddTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/content/tips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tipForm)
    })
      .then(res => res.json())
      .then((newTip) => {
        showNotification('success', 'Health tip created!');
        setTips(prev => [...prev, newTip]);
        setShowAddTip(false);
        setTipForm({ title: '', content: '', category: 'Nutrition' });
      })
      .catch(() => {
        const mockNew = { id: 'tip-' + Date.now(), ...tipForm, likes: 0, bookmarks_count: 0, created_at: new Date().toISOString() };
        setTips(prev => [...prev, mockNew]);
        setShowAddTip(false);
        showNotification('success', 'Tip added locally (Server offline)');
      });
  };

  const handleAddArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/content/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleForm)
    })
      .then(res => res.json())
      .then((newArt) => {
        showNotification('success', 'AI article generated and posted!');
        setArticles(prev => [...prev, newArt]);
        setShowAddArticle(false);
        setArticleForm({ title: '', content: '', category: 'Nutrition', readTime: '5 min read', imageUrl: '' });
      })
      .catch(() => {
        const mockNew = { id: 'art-' + Date.now(), ...articleForm, image_url: articleForm.imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80', likes: 0, bookmarks_count: 0, created_at: new Date().toISOString() };
        setArticles(prev => [...prev, mockNew]);
        setShowAddArticle(false);
        showNotification('success', 'Article generated locally (Server offline)');
      });
  };

  const handleAddCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/content/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campaignForm)
    })
      .then(res => res.json())
      .then((newCamp) => {
        showNotification('success', 'Public awareness campaign launched!');
        setCampaigns(prev => [...prev, newCamp]);
        setShowAddCampaign(false);
        setCampaignForm({ title: '', description: '', targetDisease: '', status: 'Active' });
      })
      .catch(() => {
        const mockNew = { id: 'camp-' + Date.now(), ...campaignForm, start_date: new Date().toISOString().split('T')[0] };
        setCampaigns(prev => [...prev, mockNew]);
        setShowAddCampaign(false);
        showNotification('success', 'Campaign launched locally (Server offline)');
      });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-slate-500 text-xs mt-2">Only authorized administrators are allowed to view this panel.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/50 p-4 rounded-xl shadow dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/35">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage diseases database, audit system stats, and generate campaigns.</p>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap gap-2">
          {activeSubTab === 'diseases' && (
            <button
              onClick={() => setShowAddDisease(true)}
              className="inline-flex items-center rounded-xl bg-health-600 hover:bg-health-700 text-white px-4 py-2.5 text-xs font-bold transition-all"
            >
              <Plus size={14} className="mr-1.5" />
              Add Disease
            </button>
          )}
          {activeSubTab === 'tips' && (
            <button
              onClick={() => setShowAddTip(true)}
              className="inline-flex items-center rounded-xl bg-health-600 hover:bg-health-700 text-white px-4 py-2.5 text-xs font-bold transition-all"
            >
              <Plus size={14} className="mr-1.5" />
              Add Health Tip
            </button>
          )}
          {activeSubTab === 'articles' && (
            <button
              onClick={() => setShowAddArticle(true)}
              className="inline-flex items-center rounded-xl bg-health-600 hover:bg-health-700 text-white px-4 py-2.5 text-xs font-bold transition-all"
            >
              <Plus size={14} className="mr-1.5" />
              Create Article
            </button>
          )}
          {activeSubTab === 'campaigns' && (
            <button
              onClick={() => setShowAddCampaign(true)}
              className="inline-flex items-center rounded-xl bg-health-600 hover:bg-health-700 text-white px-4 py-2.5 text-xs font-bold transition-all"
            >
              <Plus size={14} className="mr-1.5" />
              Launch Campaign
            </button>
          )}
        </div>
      </div>

      {/* Analytics Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Users', value: stats.summary.users, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
            { label: 'Diseases Directory', value: stats.summary.diseases, icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Chat Sessions', value: stats.summary.chatSessions, icon: MessageSquare, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
            { label: 'Feedback Count', value: stats.summary.feedbackCount, icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-panel border border-slate-200/80 p-5 rounded-2xl flex items-center space-x-4 shadow-sm dark:border-slate-850">
                <div className={`p-3.5 rounded-xl ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{item.value}</p>
                  <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subsection Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-850 mb-8 overflow-x-auto space-x-2">
        {[
          { id: 'analytics', label: 'Analytics Insights' },
          { id: 'diseases', label: 'Diseases Library' },
          { id: 'users', label: 'Registered Citizens' },
          { id: 'tips', label: 'Health Tips' },
          { id: 'articles', label: 'Awareness Articles' },
          { id: 'campaigns', label: 'Public Campaigns' },
          { id: 'complaints', label: 'Grievances / Tickets' },
          { id: 'feedback', label: 'Feedback Reviews' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`py-3 px-4 text-xs font-bold capitalize border-b-2 transition-all shrink-0 ${
              activeSubTab === tab.id
                ? 'border-health-600 text-health-700 dark:border-health-400 dark:text-health-455'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subsection Container */}
      <div className="glass-panel border border-slate-200/80 p-6 rounded-2xl shadow-md min-h-[400px] dark:border-slate-850">
        
        {/* SUBTAB: ANALYTICS */}
        {activeSubTab === 'analytics' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold text-slate-700">
            {/* Most searched diseases */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Most Searched Diseases</h3>
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                {stats.analytics.mostSearchedDiseases.map((d: any) => (
                  <div key={d.name} className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-850 dark:text-slate-350">{d.name}</span>
                    <span className="bg-health-50 text-health-800 px-2 py-0.5 rounded text-[10px] font-bold dark:bg-health-950/20 dark:text-health-455">{d.count} searches</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular symptoms */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Popular Symptoms Analyzed</h3>
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                {stats.analytics.popularSymptoms.map((s: any) => (
                  <div key={s.symptom} className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-850 dark:text-slate-350">{s.symptom}</span>
                    <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold dark:bg-teal-950/20 dark:text-teal-455">{s.count} hits</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">User Registration Growth</h3>
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                {stats.analytics.userGrowth.map((g: any) => (
                  <div key={g.month} className="flex justify-between items-center py-1">
                    <span>{g.month}</span>
                    <span>{g.users} Users total</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat usage */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Daily Chatbot Inquiries</h3>
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
                {stats.analytics.chatUsage.map((c: any) => (
                  <div key={c.day} className="flex justify-between items-center py-1">
                    <span>{c.day}</span>
                    <span>{c.queries} daily messages</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: DISEASES MANAGEMENT */}
        {activeSubTab === 'diseases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-655 font-medium">
              <thead className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3 w-1/4">Name</th>
                  <th className="pb-3 w-1/4">Category</th>
                  <th className="pb-3 w-1/4">Emergency Level</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {diseases.map((d) => (
                  <tr key={d.id || d.name} className="hover:bg-slate-50/40">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{d.name}</td>
                    <td className="py-3">{d.category}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        d.emergency_level === 'High' 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30'
                          : d.emergency_level === 'Medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                      }`}>
                        {d.emergency_level}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteDisease(d.id || d.name.replace(/\s+/g, '-').toLowerCase())}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Delete Disease"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB: USERS */}
        {activeSubTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-655 font-medium">
              <thead className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3">User Details</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Registration Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40">
                    <td className="py-3">
                      <div className="flex items-center space-x-3">
                        <img src={u.avatarUrl} alt={u.fullName} className="h-8 w-8 rounded-full border bg-slate-100" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{u.fullName}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 uppercase tracking-wider font-bold text-[10px]">{u.role}</td>
                    <td className="py-3 text-slate-400">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB: FEEDBACK */}
        {activeSubTab === 'feedback' && (
          <div className="space-y-4">
            {feedback.length === 0 ? (
              <p className="text-slate-500 text-xs py-10 text-center">No feedback entries reviewed yet.</p>
            ) : (
              feedback.map((f: any) => (
                <div key={f.id} className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{f.userEmail}</span>
                      <span className="text-slate-400 ml-2">{new Date(f.created_at).toLocaleString()}</span>
                    </div>
                    <span className="text-amber-500 font-bold">★ {f.rating} / 5</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-405 mt-2 italic leading-relaxed">
                    "{f.comment}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUBTAB: TIPS */}
        {activeSubTab === 'tips' && (
          <div className="space-y-4">
            {tips.map((t) => (
              <div key={t.id} className="border-b border-slate-100 dark:border-slate-850 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-health-600 bg-health-50 px-2 py-0.5 rounded uppercase dark:bg-health-950/20 dark:text-health-455">
                    {t.category}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1.5">{t.title}</h4>
                  <p className="text-slate-655 dark:text-slate-400 mt-1 leading-relaxed">{t.content}</p>
                </div>
                <div className="text-[10px] text-slate-450 font-bold shrink-0 ml-4 uppercase">
                  ♥ {t.likes || 0} Likes
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB: ARTICLES */}
        {activeSubTab === 'articles' && (
          <div className="space-y-4">
            {articles.map((a) => (
              <div key={a.id} className="border-b border-slate-100 dark:border-slate-850 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-teal-650 bg-teal-50 px-2 py-0.5 rounded uppercase dark:bg-teal-950/20 dark:text-teal-455">
                    {a.category}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1.5">{a.title}</h4>
                  <p className="text-slate-500 mt-1 line-clamp-1">{a.content}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-450 shrink-0 ml-4 uppercase">{a.read_time}</span>
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB: CAMPAIGNS */}
        {activeSubTab === 'campaigns' && (
          <div className="space-y-4">
            {campaigns.map((c) => (
              <div key={c.id} className="border-b border-slate-100 dark:border-slate-850 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded uppercase dark:bg-emerald-950/20 dark:text-emerald-455">
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400">Target: {c.target_disease}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1.5">{c.title}</h4>
                  <p className="text-slate-655 dark:text-slate-400 mt-1 leading-relaxed">{c.description}</p>
                </div>
                <span className="text-[10px] text-slate-450 font-bold shrink-0 ml-4">Launched {c.start_date}</span>
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB: COMPLAINTS */}
        {activeSubTab === 'complaints' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-655 font-medium">
              <thead className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-3 w-1/6">Ticket ID</th>
                  <th className="pb-3 w-1/5">Category</th>
                  <th className="pb-3 w-1/4">Location</th>
                  <th className="pb-3 w-1/4">Description</th>
                  <th className="pb-3 w-1/6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{c.ticketId}</td>
                    <td className="py-3">{c.category}</td>
                    <td className="py-3 font-semibold">{c.location}</td>
                    <td className="py-3 text-slate-500 max-w-[150px] truncate" title={c.description}>{c.description}</td>
                    <td className="py-3">
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateComplaintStatus(c.id, e.target.value)}
                        className={`rounded px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider outline-none ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                            : c.status === 'Investigating'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ====================================================
          MODALS & ADD FORMS
          ==================================================== */}

      {/* MODAL: ADD DISEASE */}
      {showAddDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-6 max-w-xl w-full text-xs font-semibold space-y-4 dark:border-slate-800 shadow-xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Add New Disease Profile</h3>
            
            <form onSubmit={handleAddDiseaseSubmit} className="space-y-4 text-slate-800 dark:text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Disease Name</label>
                  <input
                    type="text" required value={diseaseForm.name}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-850 focus:outline-none focus:border-health-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Category</label>
                  <select
                    value={diseaseForm.category}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-850 focus:outline-none focus:border-health-500"
                  >
                    <option value="Infectious Diseases">Infectious Diseases</option>
                    <option value="Respiratory Diseases">Respiratory Diseases</option>
                    <option value="Cardiovascular Diseases">Cardiovascular Diseases</option>
                    <option value="Endocrine Diseases">Endocrine Diseases</option>
                    <option value="Digestive Diseases">Digestive Diseases</option>
                    <option value="Neurological Diseases">Neurological Diseases</option>
                    <option value="Kidney Diseases">Kidney Diseases</option>
                    <option value="Skin Diseases">Skin Diseases</option>
                    <option value="Bone & Joint Diseases">Bone & Joint Diseases</option>
                    <option value="Mental Health Disorders">Mental Health Disorders</option>
                    <option value="Cancer Types">Cancer Types</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Description</label>
                <textarea
                  required rows={3} value={diseaseForm.description}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-850 focus:outline-none focus:border-health-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Symptoms (Comma Separated)</label>
                  <input
                    type="text" required placeholder="Fever, Cough, Joint Pain" value={diseaseForm.symptoms}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-850 focus:outline-none focus:border-health-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Causes (Comma Separated)</label>
                  <input
                    type="text" required placeholder="Viral transmission, Genetics" value={diseaseForm.causes}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, causes: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Risk Factors (Comma Separated)</label>
                  <input
                    type="text" value={diseaseForm.risk_factors}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, risk_factors: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Precautions (Comma Separated)</label>
                  <input
                    type="text" value={diseaseForm.precautions}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, precautions: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Prevention (Comma Separated)</label>
                  <input
                    type="text" value={diseaseForm.prevention}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, prevention: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Basic Treatment (Comma Separated)</label>
                  <input
                    type="text" value={diseaseForm.basic_treatment}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, basic_treatment: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Emergency / Risk Level</label>
                <select
                  value={diseaseForm.emergency_level}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, emergency_level: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button" onClick={() => setShowAddDisease(false)}
                  className="rounded-lg border border-slate-250 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-health-600 hover:bg-health-700 text-white px-5 py-2 text-xs font-semibold shadow-md shadow-health-100/50"
                >
                  Save Disease
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD HEALTH TIP */}
      {showAddTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-6 max-w-md w-full text-xs font-semibold space-y-4 dark:border-slate-800 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Create New Daily Health Tip</h3>
            
            <form onSubmit={handleAddTipSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Tip Title</label>
                <input
                  type="text" required value={tipForm.title}
                  onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Category</label>
                <select
                  value={tipForm.category}
                  onChange={(e) => setTipForm({ ...tipForm, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                >
                  <option value="Nutrition">Nutrition</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Hygiene">Hygiene</option>
                  <option value="Disease Prevention">Disease Prevention</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Tip Content</label>
                <textarea
                  required rows={4} value={tipForm.content}
                  onChange={(e) => setTipForm({ ...tipForm, content: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button" onClick={() => setShowAddTip(false)}
                  className="rounded-lg border border-slate-250 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-health-600 hover:bg-health-700 text-white px-5 py-2 text-xs font-semibold"
                >
                  Save Tip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ARTICLE */}
      {showAddArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-6 max-w-md w-full text-xs font-semibold space-y-4 dark:border-slate-800 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Create AI Health Awareness Article</h3>
            
            <form onSubmit={handleAddArticleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Article Title</label>
                <input
                  type="text" required value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                  >
                    <option value="Heart Health">Heart Health</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Infectious Diseases">Infectious Diseases</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Read Time Estimate</label>
                  <input
                    type="text" placeholder="e.g. 5 min read" value={articleForm.readTime}
                    onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Unsplash Image URL (Optional)</label>
                <input
                  type="text" placeholder="https://images.unsplash.com/..." value={articleForm.imageUrl}
                  onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Article Body Content</label>
                <textarea
                  required rows={5} value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button" onClick={() => setShowAddArticle(false)}
                  className="rounded-lg border border-slate-250 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-health-600 hover:bg-health-700 text-white px-5 py-2 text-xs font-semibold"
                >
                  Generate & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LAUNCH CAMPAIGN */}
      {showAddCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-6 max-w-md w-full text-xs font-semibold space-y-4 dark:border-slate-800 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Launch Awareness Campaign</h3>
            
            <form onSubmit={handleAddCampaignSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Campaign Title</label>
                <input
                  type="text" required value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Target Disease Name</label>
                <input
                  type="text" required placeholder="e.g. Dengue Fever" value={campaignForm.targetDisease}
                  onChange={(e) => setCampaignForm({ ...campaignForm, targetDisease: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Campaign Description</label>
                <textarea
                  required rows={4} value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, ...campaignForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-855 focus:outline-none focus:border-health-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button" onClick={() => setShowAddCampaign(false)}
                  className="rounded-lg border border-slate-250 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-health-600 hover:bg-health-700 text-white px-5 py-2 text-xs font-semibold"
                >
                  Launch Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
