import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { Chat } from './pages/Chat';
import { SymptomChecker } from './pages/SymptomChecker';
import { DiseaseLibrary } from './pages/DiseaseLibrary';
import { TipsAndArticles } from './pages/TipsAndArticles';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedDiseaseName, setSelectedDiseaseName] = useState('');

  // Handle URL parameters on load (e.g. for sharing links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const diseaseParam = params.get('disease');
    const tipParam = params.get('tip');
    const articleParam = params.get('article');

    if (diseaseParam) {
      setSelectedDiseaseName(diseaseParam);
      setActiveTab('library');
    } else if (tipParam || articleParam) {
      setActiveTab('tips');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <Landing setActiveTab={setActiveTab} />
        )}
        
        {activeTab === 'chat' && (
          <Chat setActiveTab={setActiveTab} setSelectedDiseaseName={setSelectedDiseaseName} />
        )}
        
        {activeTab === 'symptoms' && (
          <SymptomChecker setActiveTab={setActiveTab} setSelectedDiseaseName={setSelectedDiseaseName} />
        )}
        
        {activeTab === 'library' && (
          <DiseaseLibrary 
            selectedDiseaseName={selectedDiseaseName} 
            setSelectedDiseaseName={setSelectedDiseaseName} 
          />
        )}
        
        {activeTab === 'tips' && (
          <TipsAndArticles />
        )}
        
        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
        
        {activeTab === 'profile' && (
          <Profile setActiveTab={setActiveTab} setSelectedDiseaseName={setSelectedDiseaseName} />
        )}

        {activeTab === 'login' && (
          <Auth initialMode="login" onSuccess={() => setActiveTab('home')} />
        )}

        {activeTab === 'signup' && (
          <Auth initialMode="signup" onSuccess={() => setActiveTab('home')} />
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
