import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  MessageSquare, 
  Activity, 
  BookOpen, 
  FileText, 
  ArrowRight, 
  Users, 
  Search, 
  CheckCircle, 
  Send, 
  HelpCircle, 
  Star,
  ShieldAlert
} from 'lucide-react';

interface LandingProps {
  setActiveTab: (tab: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ setActiveTab }) => {
  const { t } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // FAQ Accordion State
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // AI Demo State
  const [demoPrompt, setDemoPrompt] = useState('');
  const [demoReply, setDemoReply] = useState('');
  const [demoTyping, setDemoTyping] = useState(false);

  const stats = [
    { label: "Queries Answered", value: "25,000+", icon: MessageSquare },
    { label: "Diseases Cataloged", value: "190+", icon: BookOpen },
    { label: "Registered Citizens", value: "15,000+", icon: Users },
    { label: "Prevention Campaigns", value: "3 Active", icon: Activity }
  ];

  const features = [
    {
      title: "Intelligent Health Assistant",
      desc: "Chat naturally in English, Tamil, or Hindi about symptoms, causes, and preventative measures.",
      icon: MessageSquare,
      tab: "chat",
      color: "bg-emerald-500 text-white"
    },
    {
      title: "Interactive Symptom Checker",
      desc: "Select what you feel to identify potential underlying conditions, risk levels, and guidelines.",
      icon: Activity,
      tab: "symptoms",
      color: "bg-teal-500 text-white"
    },
    {
      title: "Comprehensive Disease Library",
      desc: "Browse a detailed directory of 190+ diseases with verified clinical information and emergency guidelines.",
      icon: BookOpen,
      tab: "library",
      color: "bg-emerald-600 text-white"
    },
    {
      title: "AI Health Articles & Tips",
      desc: "Access bite-sized daily hygiene reminders and detailed medical articles written by public health systems.",
      icon: FileText,
      tab: "tips",
      color: "bg-teal-600 text-white"
    }
  ];

  const categories = [
    "Infectious Diseases", "Respiratory Diseases", "Cardiovascular Diseases", 
    "Endocrine Diseases", "Digestive Diseases", "Neurological Diseases",
    "Kidney Diseases", "Skin Diseases", "Bone & Joint Diseases", 
    "Mental Health Disorders", "Cancer Types"
  ];

  const testimonials = [
    {
      name: "Dr. Arvind Swamy",
      role: "Public Health Director, National Health Service",
      text: "This platform is a milestone for public health. By offering clear, multilingual disease awareness, it bridges the gap in primary health education.",
      stars: 5,
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Arvind"
    },
    {
      name: "Meera Patel",
      role: "Community Health Advocate",
      text: "The Symptom Checker helped my family understand warning signs of Dengue early. Having explanations in Hindi and Tamil makes it accessible to everyone.",
      stars: 5,
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Meera"
    }
  ];

  const faqs = [
    {
      q: "Can the chatbot diagnose diseases?",
      a: "No, this chatbot is exclusively for educational and disease awareness purposes. It helps you understand symptoms, precautions, and when to seek emergency help. Always consult a healthcare professional for clinical diagnoses."
    },
    {
      q: "Which languages are supported?",
      a: "The portal fully supports English, Tamil (தமிழ்), and Hindi (हिंदी). You can toggle between these at the top of the screen to translate the chatbot and all articles."
    },
    {
      q: "How does the Symptom Checker work?",
      a: "You select a combination of symptoms (e.g. fever, joint pain, rash). The system matches them against our database of 190+ conditions and outputs a confidence score along with the emergency risk level (Low, Medium, High)."
    },
    {
      q: "Is my medical search history private?",
      a: "Yes. All conversations are private and secured. If you are registered, you can access your saved chat history. You can also delete or rename chats in your history sidebar at any time."
    }
  ];

  const handleDemoClick = (prompt: string) => {
    setDemoPrompt(prompt);
    setDemoTyping(true);
    setDemoReply('');

    let replyText = '';
    if (prompt.includes('dengue')) {
      replyText = "Dengue Fever is an infectious disease spread by Aedes mosquitoes. Primary symptoms include high fever, severe headache, behind-the-eye pain, and joint pain. Precautions: Use mosquito nets, eliminate standing water, and stay hydrated. Emergency risk: High. Consult a doctor if bleeding or persistent vomiting occurs.";
    } else if (prompt.includes('malaria')) {
      replyText = "Malaria is a mosquito-borne illness caused by Plasmodium parasites. Symptoms include cyclic high fever, sweating, and chills. Prevention relies on vector control, bed nets, and antimalarial medications.";
    } else if (prompt.includes('diabetes')) {
      replyText = "Diabetes occurs when the body has high blood glucose. Type 1 is an autoimmune condition requiring insulin, while Type 2 involves insulin resistance managed through diet, exercise, and oral meds.";
    }

    let charIndex = 0;
    const interval = setInterval(() => {
      setDemoReply(prev => prev + replyText.charAt(charIndex));
      charIndex++;
      if (charIndex >= replyText.length) {
        clearInterval(interval);
        setDemoTyping(false);
      }
    }, 20);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-health-50/50 via-white to-white dark:from-slate-900/30 dark:via-slate-950 dark:to-slate-950 py-20 lg:py-28 transition-colors duration-300">
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-health-200/40 blur-3xl dark:bg-health-950/20" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 rounded-full bg-health-100/60 px-3 py-1 text-xs font-semibold text-health-800 dark:bg-health-950/50 dark:text-health-400">
                <CheckCircle size={14} className="text-health-600" />
                <span>Verified Public Health Portal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Your AI-Powered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-health-600 to-teal-500">
                  Public Health Assistant
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
                Learn about diseases, symptoms, prevention methods, and healthy living through AI-powered conversations. Available in English, தமிழ், and हिंदी.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="inline-flex items-center justify-center rounded-xl bg-health-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-health-200/50 hover:bg-health-700 hover:shadow-xl dark:shadow-none transition-all duration-200"
                >
                  {t('startChatting')}
                  <ArrowRight size={18} className="ml-2" />
                </button>
                <button
                  onClick={() => setActiveTab('library')}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  {t('exploreDiseases')}
                </button>
              </div>
            </div>

            {/* Right Interactive AI Demo */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-2xl border border-slate-200/80 p-6 shadow-xl dark:border-slate-850">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-wide uppercase text-slate-400">Interactive Demo</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold px-2 py-0.5 rounded">Try a Prompt</span>
                </div>
                
                {/* Demo suggested chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    "What are the symptoms of dengue?",
                    "How can I prevent malaria?",
                    "Explain diabetes in simple terms."
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDemoClick(p)}
                      className="text-left text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-health-50 hover:text-health-700 hover:border-health-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-health-400 dark:hover:border-health-950 transition-all duration-200"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Simulated chat container */}
                <div className="h-44 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 p-4 overflow-y-auto text-xs space-y-3 font-mono">
                  {demoPrompt && (
                    <div className="text-right">
                      <span className="inline-block bg-health-600 text-white rounded-lg px-3 py-1.5 font-medium max-w-[80%]">
                        {demoPrompt}
                      </span>
                    </div>
                  )}
                  {(demoReply || demoTyping) && (
                    <div className="text-left">
                      <div className="inline-block bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-lg p-3 max-w-[90%] text-slate-700 dark:text-slate-350 leading-relaxed shadow-sm">
                        {demoReply}
                        {demoTyping && (
                          <span className="typing-dots ml-1 inline-flex items-center">
                            <span></span><span></span><span></span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {!demoPrompt && (
                    <div className="h-full flex items-center justify-center text-center text-slate-400 dark:text-slate-600 font-sans">
                      <p>Click one of the suggested prompts above to see how our smart healthcare AI works instantly.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-white dark:bg-slate-950 border-y border-slate-200/60 dark:border-slate-900/60 py-10 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center justify-center text-center p-4">
                  <div className="mb-2 rounded-xl bg-health-50 p-3 text-health-600 dark:bg-health-950/20 dark:text-health-400">
                    <Icon size={24} />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Cards Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Professional Public Health Modules
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our clinical educational system provides multiple avenues for citizens to review, analyze, and learn about disease safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab(feat.tab)}
                  className="glass-panel premium-card rounded-2xl p-6 cursor-pointer flex flex-col justify-between h-72 border border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-4">
                    <div className={`inline-flex rounded-xl p-3 ${feat.color}`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                  <div className="inline-flex items-center text-xs font-bold text-health-600 dark:text-health-400 hover:text-health-700 mt-4 group">
                    <span>Explore Module</span>
                    <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disease Categories Section */}
      <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Disease Classifications
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Explore illnesses categorized by bodily systems and transmission vectors. Our database houses extensive preventative guidelines for each.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab('library')}
                className="rounded-full border border-slate-200/80 bg-slate-50 hover:bg-health-50 hover:text-health-700 hover:border-health-200 px-5 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 dark:hover:text-health-400 transition-all duration-150"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Endorsed by Experts, Built for Citizens
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-panel rounded-2xl p-6 border border-slate-200/70 dark:border-slate-800 shadow-md flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center mt-6">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full border border-health-500 bg-slate-100" />
                  <div className="ml-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border-b border-slate-200 dark:border-slate-800 pb-4"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="flex w-full items-center justify-between text-left py-3 font-bold text-slate-800 dark:text-slate-200 hover:text-health-600 dark:hover:text-health-400"
                >
                  <span className="text-sm">{faq.q}</span>
                  <HelpCircle size={16} className="text-slate-400 shrink-0 ml-2" />
                </button>
                {faqOpen === idx && (
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Newsletter Subscription Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Newsletter (Col 5) */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Stay Informed</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Subscribe to our newsletter to receive real-time public health announcements, outbreak details, and verified disease prevention tips directly in your inbox.
              </p>

              {newsletterSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/50 p-4 rounded-xl text-xs font-semibold">
                  Thank you! You have successfully registered for our newsletter alerts.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-xs w-full focus:outline-none focus:border-health-500 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-health-600 hover:bg-health-700 text-white px-5 py-3 text-xs font-bold shrink-0 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Contact Form (Col 7) */}
            <div className="lg:col-span-7">
              <div className="glass-panel rounded-2xl border border-slate-200/80 p-6 shadow-md dark:border-slate-850">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Contact Public Health Admin</h3>
                
                {contactSuccess ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/50 p-4 rounded-xl text-xs font-semibold">
                    Your inquiry has been successfully sent! Our administrative team will review it.
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="rounded-lg border border-slate-200 px-3 py-2 w-full text-xs bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none focus:border-health-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="rounded-lg border border-slate-200 px-3 py-2 w-full text-xs bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none focus:border-health-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Message</label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="rounded-lg border border-slate-200 px-3 py-2 w-full text-xs bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none focus:border-health-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-health-600 dark:hover:bg-health-700 px-5 py-3 text-xs font-bold transition-colors"
                    >
                      <Send size={14} className="mr-2" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
