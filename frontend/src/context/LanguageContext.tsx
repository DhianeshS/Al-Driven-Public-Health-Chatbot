import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta' | 'hi';

interface TranslationDict {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: TranslationDict = {
  // Navigation
  home: { en: "Home", ta: "முகப்பு", hi: "मुख्य पृष्ठ" },
  chat: { en: "AI Assistant", ta: "AI உதவியாளர்", hi: "एआई सहायक" },
  symptoms: { en: "Symptom Checker", ta: "அறிகுறி சரிபார்ப்பு", hi: "लक्षण जांचकर्ता" },
  library: { en: "Disease Library", ta: "நோய் நூலகம்", hi: "रोग पुस्तकालय" },
  tips: { en: "Health Tips", ta: "ஆரோக்கிய குறிப்புகள்", hi: "स्वास्थ्य सुझाव" },
  admin: { en: "Admin Panel", ta: "நிர்வாக குழு", hi: "प्रशासनिक पैनल" },
  login: { en: "Log In", ta: "உள்நுழைக", hi: "लॉग इन करें" },
  signup: { en: "Sign Up", ta: "பதிவு செய்க", hi: "साइन अप करें" },
  logout: { en: "Log Out", ta: "வெளியேறுக", hi: "लॉग आउट" },
  profile: { en: "Profile", ta: "சுயவிவரம்", hi: "प्रोफ़ाइल" },

  // Hero Section
  heroTitle: { en: "Your AI-Powered Public Health Assistant", ta: "உங்களின் AI-இயங்கும் பொது சுகாதார உதவியாளர்", hi: "आपका एआई-संचालित सार्वजनिक स्वास्थ्य सहायक" },
  heroSubtitle: { en: "Learn about diseases, symptoms, prevention methods, and healthy living through AI-powered conversations.", ta: "AI-இயங்கும் உரையாடல்கள் மூலம் நோய்கள், அறிகுறிகள், தடுப்பு முறைகள் மற்றும் ஆரோக்கியமான வாழ்க்கை முறை பற்றி அறிந்து கொள்ளுங்கள்.", hi: "एआई-संचालित बातचीत के माध्यम से बीमारियों, लक्षणों, रोकथाम के तरीकों और स्वस्थ जीवन के बारे में जानें।" },
  startChatting: { en: "Start Chatting", ta: "உரையாடலைத் தொடங்கு", hi: "बातचीत शुरू करें" },
  exploreDiseases: { en: "Explore Diseases", ta: "நோய்களை ஆராயுங்கள்", hi: "बीमारियों का अन्वेषण करें" },

  // Disclaimer
  disclaimer: {
    en: "AI responses are for educational and disease awareness purposes only and should not be considered medical diagnosis or professional healthcare advice.",
    ta: "AI பதில்கள் கல்வி மற்றும் நோய் விழிப்புணர்வு நோக்கங்களுக்காக மட்டுமே, மருத்துவ கண்டறிதல் அல்லது தொழில்முறை சுகாதார ஆலோசனையாக கருதப்படக்கூடாது.",
    hi: "एआई प्रतिक्रियाएं केवल शैक्षिक और रोग जागरूकता उद्देश्यों के लिए हैं और इन्हें चिकित्सा निदान या पेशेवर स्वास्थ्य देखभाल सलाह नहीं माना जाना चाहिए।"
  },

  // Common UI Texts
  loading: { en: "Loading...", ta: "ஏற்றப்படுகிறது...", hi: "लोड हो रहा है..." },
  searchPlaceholder: { en: "Search...", ta: "தேடுக...", hi: "खोजें..." },
  save: { en: "Save", ta: "சேமி", hi: "सहेजें" },
  share: { en: "Share", ta: "பகிர்", hi: "साझा करें" },
  liked: { en: "Liked", ta: "விரும்பப்பட்டது", hi: "पसंद किया" },
  copy: { en: "Copy", ta: "நகலெடு", hi: "कॉपी करें" },
  copied: { en: "Copied!", ta: "நகலெடுக்கப்பட்டது!", hi: "कॉपी किया गया!" },
  regenerate: { en: "Regenerate", ta: "மீண்டும் உருவாக்கு", hi: "पुनरुत्पादित करें" },
  emergency: { en: "Emergency Level", ta: "அவசர நிலை", hi: "आपातकालीन स्तर" },
  suggestedPrompts: { en: "Suggested Prompts", ta: "பரிந்துரைக்கப்பட்ட கேள்விகள்", hi: "सुझाए गए संकेत" },
  followUpQuestions: { en: "Follow-up Questions", ta: "தொடர் கேள்விகள்", hi: "अनुवर्ती प्रश्न" },

  // Symptom Checker Page
  symptomCheckerTitle: { en: "Interactive Symptom Checker", ta: "ஊடாடும் அறிகுறி சரிபார்ப்பு", hi: "इंटरैक्टिव लक्षण जांचकर्ता" },
  symptomCheckerSub: { en: "Select the symptoms you are experiencing to analyze potential conditions. This is not a diagnosis.", ta: "சாத்தியமான நோய்களை பகுப்பாய்வு செய்ய உங்கள் அறிகுறிகளைத் தேர்ந்தெடுக்கவும். இது ஒரு மருத்துவ கண்டறிதல் அல்ல.", hi: "संभावित स्थितियों का विश्लेषण करने के लिए अपने लक्षणों का चयन करें। यह कोई निदान नहीं है।" },
  checkHealthBtn: { en: "Analyze Symptoms", ta: "அறிகுறிகளை பகுப்பாய்வு செய்க", hi: "लक्षणों का विश्लेषण करें" },
  confidenceScore: { en: "Confidence Score", ta: "நம்பிக்கை மதிப்பெண்", hi: "आत्मविश्वास स्कोर" },
  riskLevel: { en: "Risk Level", ta: "ஆபத்து நிலை", hi: "जोखिम स्तर" },
  possibleConditions: { en: "Possible Conditions", ta: "சாத்தியமான நோய்கள்", hi: "संभावित स्थितियाँ" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'ta' || saved === 'hi') return saved;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
