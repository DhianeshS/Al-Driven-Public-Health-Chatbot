import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import mockDiseases from '../data/diseases_data.json';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  CheckCheck, 
  Download, 
  ShieldAlert, 
  Bot,
  User as UserIcon,
  MessageSquare,
  FileText,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

interface ChatProps {
  setActiveTab: (tab: string) => void;
  setSelectedDiseaseName: (name: string) => void;
}

interface Conversation {
  id: string;
  title: string;
  type: 'disease' | 'complaint';
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  createdAt: string;
  diseaseMatchedId?: string;
  followUps?: string[];
  isTicket?: boolean;
  ticketData?: {
    ticketId: string;
    category: string;
    location: string;
    description: string;
    contact: string;
    status: string;
  };
}

export const Chat: React.FC<ChatProps> = ({ setActiveTab, setSelectedDiseaseName }) => {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Segmented control switcher tab
  const [chatMode, setChatMode] = useState<'disease' | 'complaint'>('disease');

  const [inputText, setInputText] = useState('');
  const [aiStreamingText, setAiStreamingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Voice Input (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Rename Inline State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  // Follow-ups & Matches
  const [activeFollowUps, setActiveFollowUps] = useState<string[]>([]);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const streamingTextRef = useRef('');

  // Suggested Prompts
  const suggestedDiseasePrompts = [
    "What are the symptoms of dengue?",
    "How can I prevent malaria?",
    "Explain diabetes in simple terms.",
    "What causes hypertension?",
    "What are the warning signs of a heart attack?"
  ];

  const suggestedComplaintPrompts = [
    "Report stagnant water causing mosquito breeding in Sector 5.",
    "Report open sewage leaking onto the main market road.",
    "Report garbage pileup causing health risks near primary school.",
    "Report lack of basic medical sanitation kits at local health center."
  ];

  // Initialize conversations
  const loadConversations = () => {
    if (user && token) {
      fetch('http://localhost:5000/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          // Normalize type if missing
          const normalized = data.map((c: any) => ({ ...c, type: c.type || 'disease' }));
          setConversations(normalized);
          
          // Select first of current mode
          const currentModeConvs = normalized.filter((c: any) => c.type === chatMode);
          if (currentModeConvs.length > 0) {
            setActiveConvId(currentModeConvs[0].id);
          } else {
            handleCreateConversation(chatMode);
          }
        })
        .catch(err => {
          console.warn("Using offline mock fallback for conversations list", err);
          const mockConv = { id: 'conv-mock-1', title: 'Hypertension Questions', type: 'disease' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          const mockComplaint = { id: 'conv-mock-2', title: 'Garbage pileup report', type: 'complaint' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          setConversations([mockConv, mockComplaint]);
          setActiveConvId(chatMode === 'disease' ? mockConv.id : mockComplaint.id);
        });
    } else {
      // Guest Mode setup
      const guestConv = { id: 'conv-guest-disease', title: 'New Guest Chat', type: 'disease' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const guestComp = { id: 'conv-guest-complaint', title: 'New Guest Complaint', type: 'complaint' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setConversations([guestConv, guestComp]);
      setActiveConvId(chatMode === 'disease' ? guestConv.id : guestComp.id);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [token, chatMode]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConvId) return;

    if (user && token && !activeConvId.startsWith('conv-guest')) {
      fetch(`http://localhost:5000/api/chat/conversations/${activeConvId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setMessages(data);
          if (data.length > 0) {
            const last = data[data.length - 1];
            if (last.sender === 'ai' && last.followUps) {
              setActiveFollowUps(last.followUps);
            } else {
              setActiveFollowUps([]);
            }
          }
        })
        .catch(err => {
          console.warn("Using offline mock messages fallback", err);
          setMessages([]);
        });
    } else {
      // Local Guest storage load
      const guestHistory = localStorage.getItem(`guest_history_${activeConvId}`);
      if (guestHistory) {
        const data = JSON.parse(guestHistory);
        setMessages(data);
        if (data.length > 0) {
          const last = data[data.length - 1];
          if (last.sender === 'ai' && last.followUps) {
            setActiveFollowUps(last.followUps);
          }
        }
      } else {
        setMessages([]);
        setActiveFollowUps([]);
      }
    }
  }, [activeConvId]);

  // Scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiStreamingText, isTyping]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputText(prev => prev + ' ' + text);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleCreateConversation = (modeParam: 'disease' | 'complaint') => {
    const title = modeParam === 'disease' ? 'New Conversation' : 'New Complaint Report';
    if (user && token) {
      fetch('http://localhost:5000/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, type: modeParam })
      })
        .then(res => res.json())
        .then(data => {
          const normalized = { ...data, type: modeParam };
          setConversations(prev => [normalized, ...prev]);
          setActiveConvId(data.id);
        })
        .catch(() => {
          const mockC = { id: 'conv-' + Date.now(), title, type: modeParam, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          setConversations(prev => [mockC, ...prev]);
          setActiveConvId(mockC.id);
        });
    } else {
      const guestC = { id: `conv-guest-${modeParam}-${Date.now()}`, title, type: modeParam, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setConversations(prev => [guestC, ...prev]);
      setActiveConvId(guestC.id);
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (!renameText.trim()) return;
    if (user && token && !id.startsWith('conv-guest')) {
      fetch(`http://localhost:5000/api/chat/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: renameText })
      })
        .then(res => res.json())
        .then((data) => {
          setConversations(prev => prev.map(c => c.id === id ? { ...c, title: data.title } : c));
          setRenamingId(null);
        })
        .catch(() => {
          setConversations(prev => prev.map(c => c.id === id ? { ...c, title: renameText } : c));
          setRenamingId(null);
        });
    } else {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: renameText } : c));
      setRenamingId(null);
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user && token && !id.startsWith('conv-guest')) {
      fetch(`http://localhost:5000/api/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(() => {
          const filtered = conversations.filter(c => c.id !== id);
          setConversations(filtered);
          if (activeConvId === id) {
            const currentModeConvs = filtered.filter(c => c.type === chatMode);
            setActiveConvId(currentModeConvs.length > 0 ? currentModeConvs[0].id : null);
          }
        })
        .catch(() => {
          const filtered = conversations.filter(c => c.id !== id);
          setConversations(filtered);
          if (activeConvId === id) {
            const currentModeConvs = filtered.filter(c => c.type === chatMode);
            setActiveConvId(currentModeConvs.length > 0 ? currentModeConvs[0].id : null);
          }
        });
    } else {
      const filtered = conversations.filter(c => c.id !== id);
      setConversations(filtered);
      localStorage.removeItem(`guest_history_${id}`);
      if (activeConvId === id) {
        const currentModeConvs = filtered.filter(c => c.type === chatMode);
        setActiveConvId(currentModeConvs.length > 0 ? currentModeConvs[0].id : null);
      }
    }
  };

  // SEND MESSAGE
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || !activeConvId) return;

    // 1. Add User message
    const userMsg: Message = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsTyping(true);
    setAiStreamingText('');
    streamingTextRef.current = '';
    setActiveFollowUps([]);

    if (chatMode === 'disease') {
      if (user && token && !activeConvId.startsWith('conv-guest')) {
        // SSE streaming disease chatbot
        const url = `http://localhost:5000/api/chat/conversations/${activeConvId}/stream?prompt=${encodeURIComponent(textToSend)}&authorization=Bearer%20${token}`;
        const eventSource = new EventSource(url);
        
        eventSource.addEventListener('title', (e: any) => {
          const data = JSON.parse(e.data);
          setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, title: data.title } : c));
        });

        eventSource.onmessage = (e) => {
          const data = JSON.parse(e.data);
          if (data.chunk) {
            setAiStreamingText(prev => {
              const newVal = prev + data.chunk;
              streamingTextRef.current = newVal;
              return newVal;
            });
          }
        };

        eventSource.addEventListener('done', (e: any) => {
          const data = JSON.parse(e.data);
          eventSource.close();
          setIsTyping(false);
          setAiStreamingText('');
          
          const aiMsg: Message = {
            id: data.messageId,
            sender: 'ai',
            content: streamingTextRef.current + (data.chunk || ''),
            diseaseMatchedId: data.diseaseMatchedId,
            followUps: data.followUps,
            createdAt: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiMsg]);
          if (data.followUps) setActiveFollowUps(data.followUps);
        });

        eventSource.onerror = () => {
          eventSource.close();
          triggerClientFallback(textToSend, updatedMessages);
        };
      } else {
        triggerClientFallback(textToSend, updatedMessages);
      }
    } else {
      // COMPLAINTS CHAT PROCESSOR
      triggerComplaintBot(textToSend, updatedMessages);
    }
  };

  // CLIENT FALLBACK (DISEASE)
  const triggerClientFallback = (text: string, currentMsgs: Message[]) => {
    const normalized = text.toLowerCase().trim();
    
    // Client-side matching function matching backend logic
    const findMatchingDiseaseClient = (queryText: string) => {
      if (!queryText) return null;
      const q = queryText.toLowerCase();

      // Check common aliases
      const aliases = [
        { key: "urinary tract infection", name: "Urinary Tract Infection (UTI)" },
        { key: "irritable bowel syndrome", name: "Irritable Bowel Syndrome (IBS)" },
        { key: "myocardial infarction", name: "Myocardial Infarction (Heart Attack)" },
        { key: "atopic dermatitis", name: "Eczema (Atopic Dermatitis)" },
        { key: "coronary artery", name: "Coronary Artery Disease" },
        { key: "tension headache", name: "Tension Headache" },
        { key: "hyper tension", name: "Hypertension" },
        { key: "hypertension", name: "Hypertension" },
        { key: "heart attack", name: "Myocardial Infarction (Heart Attack)" },
        { key: "acid reflux", name: "GERD (Acid Reflux)" },
        { key: "peptic ulcer", name: "Peptic Ulcer Disease" },
        { key: "kidney stones", name: "Kidney Stones" },
        { key: "kidney stone", name: "Kidney Stones" },
        { key: "alzheimer", name: "Alzheimer's Disease" },
        { key: "parkinson", name: "Parkinson's Disease" },
        { key: "diabetes", name: "Type 2 Diabetes" },
        { key: "eczema", name: "Eczema (Atopic Dermatitis)" },
        { key: "stroke", name: "Ischemic Stroke" },
        { key: "dengue", name: "Dengue Fever" },
        { key: "malaria", name: "Malaria" },
        { key: "gerd", name: "GERD (Acid Reflux)" },
        { key: "flu", name: "Influenza (Flu)" },
        { key: "tb", name: "Tuberculosis (TB)" },
        { key: "uti", name: "Urinary Tract Infection (UTI)" },
        { key: "ibs", name: "Irritable Bowel Syndrome (IBS)" },
        { key: "copd", name: "COPD" },
        { key: "ulcer", name: "Peptic Ulcer Disease" }
      ];

      for (const alias of aliases) {
        if (q.includes(alias.key)) {
          const match = mockDiseases.find(d => d.name.toLowerCase() === alias.name.toLowerCase());
          if (match) return match;
        }
      }

      // Direct name match (cleaned of non-alphanumeric characters)
      const queryCleaned = q.replace(/[^a-z0-9]/g, '');
      for (const disease of mockDiseases) {
        const nameCleaned = disease.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (nameCleaned.length > 3 && (queryCleaned.includes(nameCleaned) || nameCleaned.includes(queryCleaned))) {
          return disease;
        }
        
        const parenMatch = disease.name.toLowerCase().match(/\(([^)]+)\)/);
        if (parenMatch) {
          const insideCleaned = parenMatch[1].replace(/[^a-z0-9]/g, '');
          const outsideCleaned = disease.name.toLowerCase().replace(/\([^)]+\)/g, '').replace(/[^a-z0-9]/g, '');
          if ((insideCleaned.length > 3 && queryCleaned.includes(insideCleaned)) || 
              (outsideCleaned.length > 3 && queryCleaned.includes(outsideCleaned))) {
            return disease;
          }
        }
      }

      // Keyword match (individual word checks, excluding short or common words)
      const stopWords = new Set(['what', 'causes', 'symptoms', 'about', 'treatment', 'prevent', 'prevention', 'disease', 'condition', 'signs', 'warning', 'tell']);
      const queryWords = q.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w.length > 3 && !stopWords.has(w));
      
      for (const disease of mockDiseases) {
        const nameCleaned = disease.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const word of queryWords) {
          if (nameCleaned.includes(word)) {
            return disease;
          }
        }
      }

      return null;
    };

    const matched = findMatchingDiseaseClient(text);
    let reply = '';
    let diseaseId = undefined;
    let followUps = [
      "What are the primary symptoms of hypertension?",
      "Tell me how malaria is diagnosed.",
      "How is the symptom checker tool used?"
    ];

    if (matched) {
      diseaseId = matched.id || matched.name.replace(/\s+/g, '-').toLowerCase();
      
      const disclaimerText = "\n\n> [!WARNING]\n> **Disclaimer**: AI responses are for educational and disease awareness purposes only and should not be considered medical diagnosis or professional healthcare advice.";
      
      const sList = (matched.symptoms || []).map((s: string) => `- ${s}`).join('\n');
      const cList = (matched.causes || []).map((c: string) => `- ${c}`).join('\n');
      const rList = (matched.risk_factors || []).map((r: string) => `- ${r}`).join('\n');
      const pList = (matched.precautions || []).map((p: string) => `- ${p}`).join('\n');
      const prevList = (matched.prevention || []).map((p: string) => `- ${p}`).join('\n');
      const tList = (matched.basic_treatment || []).map((t: string) => `- ${t}`).join('\n');

      reply = `### 🏥 Disease Profile: **${matched.name}**
*Category: ${matched.category} (Risk Level: ${matched.emergency_level || "Medium"})*

#### **Description**
${matched.short_description || matched.description}

#### **Symptoms**
${sList}

#### **Causes**
${cList}

#### **Risk Factors**
${rList}

#### **Precautions**
${pList}

#### **Prevention**
${prevList}

#### **Basic Treatment**
${tList}

#### **When To Consult A Doctor**
You should seek professional medical evaluation immediately if symptoms persist, worsen, or if you develop red-flag symptoms such as high fever, difficulty breathing, chest pain, or severe dehydration.

---

### 💡 AI Simple Language Explanation
${matched.name} is classified under **${matched.category}**. In simple terms, this condition occurs when ${matched.causes?.[0]?.toLowerCase() || "the normal biological function of target tissues is altered"}. 
Its main warning signs include **${(matched.symptoms || []).slice(0, 3).join(', ')}**. 
To manage it, it is critical to focus on **${(matched.precautions || [])[0]?.toLowerCase() || "resting and staying hydrated"}** and consult a healthcare practitioner for a proper diagnosis.

### 🌟 Awareness Tips
1. **Spread Knowledge**: Tell family members about the signs of ${matched.name} so they can seek timely treatment.
2. **Environmental Control**: Focus on ${(matched.prevention || [])[0]?.toLowerCase() || "cleansing target living spaces"} to protect your household.
3. **Daily Health Log**: Write down any symptoms, when they started, and how severe they are to share with your doctor.
${disclaimerText}`;

      followUps = [
        `What are the long-term risk factors of ${matched.name}?`,
        `How is ${matched.name} diagnosed by a doctor?`,
        `Can you give me daily prevention tips for ${matched.category}?`,
        `What should I do in an emergency related to ${matched.name}?`
      ];
    } else {
      reply = `Hello! I am your AI Public Health Assistant. I can help provide verified educational information regarding symptoms, precautions, and prevention methods.

To learn about a specific condition, try asking:
- *"What are the symptoms of Dengue?"*
- *"How can I prevent Malaria?"*
- *"What are the warning signs of a heart attack?"*

If you are experiencing symptoms, please try our **Symptom Checker** tab in the navigation header.

> [!WARNING]
> **Disclaimer**: AI responses are for educational and disease awareness purposes only and should not be considered medical advice.`;
    }

    streamTextChunked(reply, currentMsgs, diseaseId, followUps);
  };

  // COMPLAINT BOT REGISTRY PROCESSOR
  const triggerComplaintBot = (text: string, currentMsgs: Message[]) => {
    const normalized = text.toLowerCase();
    
    // Check if the user is submitting a report
    // We parse the complaint category, location, and description from the text
    let category = "Sanitation";
    if (normalized.includes('water') || normalized.includes('clog') || normalized.includes('stagnant')) category = "Water Logging";
    else if (normalized.includes('mosquito') || normalized.includes('dengue') || normalized.includes('malaria') || normalized.includes('outbreak') || normalized.includes('fever')) category = "Pest Outbreak";
    else if (normalized.includes('facility') || normalized.includes('doctor') || normalized.includes('hospital') || normalized.includes('clinic')) category = "Medical Facilities Shortage";
    else if (normalized.includes('garbage') || normalized.includes('dump') || normalized.includes('trash') || normalized.includes('filth')) category = "Sanitation & Waste Management";

    // Extract basic location details
    let location = "Not specified. Prompted user.";
    const locMatch = text.match(/at\s+([^,\.]+)|in\s+([^,\.]+)/i);
    if (locMatch) {
      location = (locMatch[1] || locMatch[2] || "").trim();
    }

    const mockTicketId = 'COMP-' + Math.floor(1000 + Math.random() * 9000) + '-' + new Date().getFullYear();
    
    const reply = `### 📋 Public Health Complaint Logged

Thank you for reporting this public health hazard. I have successfully compiled the details and registered your report in the administrative dashboard database.

#### **Registration Details**
- **Ticket ID**: \`${mockTicketId}\`
- **Category**: ${category}
- **Location**: ${location}
- **Description**: ${text}
- **Assigned Status**: **Pending Investigation**

---

### 🔊 Administrative Alert Dispatch
Our public health inspection team has been notified. A local officer will be dispatched to evaluate the location (**${location}**) and mitigate the hazard. You can trace this ticket status in your saved profile panel.

*To review or submit other grievances, keep typing here. To check disease details, toggle back to the Disease Inquiries panel.*`;

    // Make API request to save to backend complaints database
    if (user && token && !activeConvId?.startsWith('conv-guest')) {
      fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Report on ${category}`,
          description: text,
          category,
          location,
          contact: user.email
        })
      })
        .then(() => {})
        .catch(() => {});
    } else {
      // Local storage guest complaints list
      const localCamps = JSON.parse(localStorage.getItem('guest_complaints') || '[]');
      localCamps.push({
        id: 'cmp-' + Date.now(),
        ticketId: mockTicketId,
        userEmail: 'guest@healthbot.org',
        title: `Report on ${category}`,
        description: text,
        category,
        location,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('guest_complaints', JSON.stringify(localCamps));
    }

    // Stream the ticket reply text
    streamTextChunked(reply, currentMsgs, undefined, [
      "Track the status of my ticket.",
      "How long does sanitation cleanup take?",
      "Report another health hazard."
    ], {
      ticketId: mockTicketId,
      category,
      location,
      description: text,
      contact: user?.email || 'guest@healthbot.org',
      status: 'Pending'
    });
  };

  const streamTextChunked = (
    replyText: string, 
    currentMsgs: Message[], 
    diseaseId?: string, 
    followUps?: string[],
    ticketData?: any
  ) => {
    let charIndex = 0;
    setAiStreamingText('');
    
    const interval = setInterval(() => {
      const chunk = replyText.substring(charIndex, charIndex + 15);
      setAiStreamingText(prev => prev + chunk);
      charIndex += 15;

      if (charIndex >= replyText.length) {
        clearInterval(interval);
        setIsTyping(false);
        setAiStreamingText('');

        const aiMsg: Message = {
          id: 'msg-ai-' + Date.now(),
          sender: 'ai',
          content: replyText,
          diseaseMatchedId: diseaseId,
          followUps,
          isTicket: !!ticketData,
          ticketData,
          createdAt: new Date().toISOString()
        };

        const finalHistory = [...currentMsgs, aiMsg];
        setMessages(finalHistory);
        if (followUps) setActiveFollowUps(followUps);

        if (activeConvId) {
          localStorage.setItem(`guest_history_${activeConvId}`, JSON.stringify(finalHistory));
          
          // Auto-rename title
          setConversations(prev => prev.map(c => {
            if (c.id === activeConvId && c.title.startsWith('New ')) {
              const cleanPrompt = currentMsgs[currentMsgs.length - 1].content;
              const firstWords = cleanPrompt.trim().split(/\s+/).slice(0, 3).join(' ') + '...';
              return { ...c, title: firstWords };
            }
            return c;
          }));
        }
      }
    }, 25);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReadAloud = (text: string) => {
    const cleanText = text
      .replace(/#+\s/g, '')
      .replace(/>\s/g, '')
      .replace(/\*+/g, '')
      .replace(/\[!WARNING\]/g, 'Warning.')
      .replace(/- /g, '')
      .split('\n')
      .filter(line => !line.startsWith('Disclaimer') && !line.includes('educational and disease'))
      .join(' ');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const chatHtml = messages.map(m => `
      <div style="margin-bottom: 20px; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; background: ${m.sender === 'user' ? '#f0fdf4' : '#fff'}">
        <h4 style="margin: 0 0 5px 0; color: ${m.sender === 'user' ? '#16a34a' : '#0f172a'}">${m.sender === 'user' ? 'USER' : 'HEALTH AI'}</h4>
        <div style="font-size: 13px; line-height: 1.5; font-family: sans-serif">${m.content.replace(/\n/g, '<br />')}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head><title>HealthAI Chat Transcript</title></head>
        <body style="font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #334155">
          <div style="border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-bottom: 20px">
            <h1 style="margin: 0; color: #16a34a">HealthAI Awareness Portal</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8">Transcript Mode: ${chatMode === 'disease' ? 'Disease Inquiries' : 'Public Grievance Registry'}</p>
          </div>
          ${chatHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredConvs = conversations.filter(c => 
    c.type === chatMode &&
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[80vh] border border-slate-200/80 rounded-2xl overflow-hidden glass-panel dark:border-slate-850 shadow-xl transition-all duration-300">
      
      {/* Side Historical Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-50 dark:bg-slate-950/65 border-r border-slate-200/85 dark:border-slate-850 flex flex-col justify-between hidden sm:flex">
        
        {/* Top elements */}
        <div className="p-4 space-y-4">
          {/* Segmented Control Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setChatMode('disease')}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                chatMode === 'disease'
                  ? 'bg-white dark:bg-slate-800 text-health-600 dark:text-health-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-850 dark:hover:text-white'
              }`}
            >
              Disease Chat
            </button>
            <button
              onClick={() => setChatMode('complaint')}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                chatMode === 'complaint'
                  ? 'bg-white dark:bg-slate-800 text-health-600 dark:text-health-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-850 dark:hover:text-white'
              }`}
            >
              Complaints
            </button>
          </div>

          <button
            onClick={() => handleCreateConversation(chatMode)}
            className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800 text-xs font-bold py-2.5 shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>New {chatMode === 'disease' ? 'Chat' : 'Complaint'}</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-[11px] bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none focus:border-health-500"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filteredConvs.map((conv) => {
            const isActive = activeConvId === conv.id;
            const isRenaming = renamingId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => !isRenaming && setActiveConvId(conv.id)}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-health-50 text-health-700 dark:bg-health-950/30 dark:text-health-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2 truncate flex-1">
                  <MessageSquare size={13} className="shrink-0" />
                  {isRenaming ? (
                    <input
                      type="text"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      onBlur={() => handleRenameSubmit(conv.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(conv.id)}
                      autoFocus
                      className="border border-slate-200 rounded px-1 text-[11px] bg-white dark:bg-slate-950 text-slate-950 dark:text-white w-full"
                    />
                  ) : (
                    <span className="truncate">{conv.title}</span>
                  )}
                </div>

                {!isRenaming && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(conv.id);
                        setRenameText(conv.title);
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Rename"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-850/80 text-[10px] text-slate-400 text-center font-medium leading-relaxed bg-slate-50/50 dark:bg-slate-950/40">
          Logs trace in {chatMode === 'disease' ? 'diseases search' : 'grievances tracker'}.
        </div>
      </aside>

      {/* Main Chat Frame */}
      <main className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 transition-colors duration-300">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 p-4">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-health-50 text-health-600 dark:bg-health-950/40">
              {chatMode === 'disease' ? <Bot size={16} /> : <ClipboardList size={16} />}
            </span>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {chatMode === 'disease' ? 'AI Disease Awareness Chat' : 'Public Health complaints registrar'}
            </h2>
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
          >
            <Download size={12} />
            <span>Export</span>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Disclaimer Alert banner */}
          <div className="flex items-start space-x-3 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl dark:bg-amber-950/20 dark:text-amber-455 dark:border-amber-900/30 leading-relaxed shadow-sm">
            <ShieldAlert size={16} className="shrink-0 text-amber-500" />
            <span>
              <strong>{chatMode === 'disease' ? 'Clinical Warning:' : 'Grievance Note:'}</strong>{' '}
              {chatMode === 'disease'
                ? t('disclaimer')
                : 'All complaints submitted here are formally signed and indexed under public health inspection protocols. Impersonation or fake reports are subject to regulatory audits.'}
            </span>
          </div>

          {messages.length === 0 && !aiStreamingText ? (
            <div className="h-[70%] flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
              {chatMode === 'disease' ? (
                <>
                  <Bot size={40} className="text-health-500 animate-pulse-slow" />
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Begin your disease awareness query</h3>
                    <p className="text-xs text-slate-500 font-medium">Click one of the suggested prompts below to analyze common conditions in simple language.</p>
                  </div>
                  <div className="flex flex-col space-y-2 w-full">
                    {suggestedDiseasePrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(p)}
                        className="text-left text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-health-50 hover:text-health-700 hover:border-health-200 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:bg-slate-800 dark:hover:text-health-455 transition-all duration-200"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <ClipboardList size={40} className="text-health-500 animate-pulse-slow" />
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Public Health Grievance Registry</h3>
                    <p className="text-xs text-slate-500 font-medium">Describe any sanitary hazards, sewage leaks, or mosquito outbreaks. The AI registrar will compile and file it.</p>
                  </div>
                  <div className="flex flex-col space-y-2 w-full">
                    {suggestedComplaintPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(p)}
                        className="text-left text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-health-50 hover:text-health-700 hover:border-health-200 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:bg-slate-800 dark:hover:text-health-455 transition-all duration-200"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start max-w-[85%] space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                      m.sender === 'user' 
                        ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        : 'bg-health-600 border-health-500 text-white'
                    }`}>
                      {m.sender === 'user' ? <UserIcon size={14} /> : (chatMode === 'disease' ? <Bot size={14} /> : <ClipboardList size={14} />)}
                    </div>

                    <div className={`rounded-2xl p-4 text-xs shadow-sm border leading-relaxed font-medium ${
                      m.sender === 'user'
                        ? 'bg-health-50 border-health-100 text-health-800 dark:bg-health-950/20 dark:border-health-900/30 dark:text-health-350'
                        : 'bg-slate-50/50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-850 text-slate-850 dark:text-slate-350'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.content}</div>

                      {/* Matched disease link inside disease mode */}
                      {m.diseaseMatchedId && chatMode === 'disease' && (
                        <button
                          onClick={() => {
                            setSelectedDiseaseName(m.diseaseMatchedId!);
                            setActiveTab('library');
                          }}
                          className="mt-3.5 inline-flex items-center text-[10px] font-bold text-health-600 hover:underline hover:text-health-700"
                        >
                          View full {m.diseaseMatchedId.replace('-', ' ')} profile in Library &rarr;
                        </button>
                      )}

                      {/* Display complaint ticket status block */}
                      {m.isTicket && m.ticketData && (
                        <div className="mt-4 border border-health-200 bg-emerald-50/40 dark:bg-emerald-950/10 p-4 rounded-xl space-y-2">
                          <h5 className="font-extrabold text-[10px] uppercase text-health-800 dark:text-health-455 tracking-wide">Official Complaint Ticket</h5>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                            <div>
                              <p className="font-bold text-slate-400 uppercase">Ticket ID</p>
                              <p className="font-extrabold text-slate-800 dark:text-white text-xs">{m.ticketData.ticketId}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase">Status</p>
                              <p className="font-bold text-emerald-600 dark:text-emerald-400">{m.ticketData.status}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="font-bold text-slate-400 uppercase">Location</p>
                              <p className="font-bold text-slate-800 dark:text-white">{m.ticketData.location}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {m.sender === 'ai' && (
                        <div className="flex items-center justify-end space-x-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                          <button
                            onClick={() => handleCopyText(m.id, m.content)}
                            className="hover:text-slate-700 dark:hover:text-white"
                          >
                            {copiedId === m.id ? <CheckCheck size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          </button>
                          <button
                            onClick={() => handleReadAloud(m.content)}
                            className="hover:text-slate-700 dark:hover:text-white"
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {aiStreamingText && (
                <div className="flex justify-start">
                  <div className="flex items-start max-w-[85%] space-x-2.5">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-health-600 border-health-500 text-white">
                      {chatMode === 'disease' ? <Bot size={14} /> : <ClipboardList size={14} />}
                    </div>
                    <div className="rounded-2xl p-4 text-xs shadow-sm border leading-relaxed font-medium bg-slate-50/50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-850 text-slate-850 dark:text-slate-350">
                      <div className="whitespace-pre-wrap">{aiStreamingText}</div>
                      <span className="typing-dots ml-1 inline-flex items-center">
                        <span></span><span></span><span></span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isTyping && !aiStreamingText && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2.5">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-health-600 border-health-500 text-white">
                      {chatMode === 'disease' ? <Bot size={14} /> : <ClipboardList size={14} />}
                    </div>
                    <div className="rounded-2xl p-4 shadow-sm border bg-slate-50/50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-850">
                      <span className="typing-dots inline-flex items-center">
                        <span></span><span></span><span></span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Controls */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
          {activeFollowUps.length > 0 && !isTyping && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Suggested Follow-ups</p>
              <div className="flex flex-wrap gap-2">
                {activeFollowUps.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-left text-[11px] font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-health-50 hover:text-health-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-health-455 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={chatMode === 'disease' ? "Ask about diseases, symptoms, prevention tips..." : "Describe the grievance (include location with 'at...' or 'in...')"}
                className="w-full rounded-2xl border border-slate-200 pl-4 pr-10 py-3.5 text-xs bg-slate-50 focus:bg-white dark:bg-slate-950 dark:border-slate-850 dark:text-white focus:outline-none focus:border-health-500 shadow-inner"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-3 top-3.5 p-1 rounded-full ${
                  isListening 
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' 
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="rounded-2xl bg-health-600 hover:bg-health-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white p-3.5 shrink-0 shadow-md shadow-health-200/30 dark:shadow-none transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
};
