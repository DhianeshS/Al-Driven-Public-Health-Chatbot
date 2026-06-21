const { readTable } = require('./db');

// Healthcare Disclaimer
const DISCLAIMER = "\n\n> [!WARNING]\n> **Disclaimer**: AI responses are for educational and disease awareness purposes only and should not be considered medical diagnosis or professional healthcare advice.";

// List of suggested follow-ups
const GENERAL_FOLLOW_UPS = [
  "How can I check my symptoms using the Symptom Checker?",
  "What is the difference between a cold and influenza?",
  "Where can I find daily health tips for prevention?",
  "What are the warning signs of a medical emergency?"
];

/**
 * Searches the database for matching diseases based on text query.
 */
function findMatchingDisease(text) {
  const diseases = readTable('diseases');
  if (!text) return null;
  const normalized = text.toLowerCase();

  // 1. Check common aliases first (ordered by length descending to match longest first)
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
    if (normalized.includes(alias.key)) {
      const match = diseases.find(d => d.name.toLowerCase() === alias.name.toLowerCase());
      if (match) return match;
    }
  }

  // 2. Direct name match (cleaned of non-alphanumeric characters)
  const queryCleaned = normalized.replace(/[^a-z0-9]/g, '');
  for (const disease of diseases) {
    const nameCleaned = disease.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (nameCleaned.length > 3 && (queryCleaned.includes(nameCleaned) || nameCleaned.includes(queryCleaned))) {
      return disease;
    }
    
    // Check parenthesis aliases if present, e.g. "Heart Attack" inside "Myocardial Infarction (Heart Attack)"
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

  // 3. Keyword match (individual word checks, excluding short or common words)
  const stopWords = new Set(['what', 'causes', 'symptoms', 'about', 'treatment', 'prevent', 'prevention', 'disease', 'condition', 'signs', 'warning', 'tell']);
  const queryWords = normalized.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w.length > 3 && !stopWords.has(w));
  
  for (const disease of diseases) {
    const nameCleaned = disease.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const word of queryWords) {
      if (nameCleaned.includes(word)) {
        return disease;
      }
    }
  }

  return null;
}

/**
 * Generates a response structure for a disease.
 */
function generateDiseaseMarkdown(disease) {
  return `### 🏥 Disease Profile: **${disease.name}**
*Category: ${disease.category} (Risk Level: ${disease.emergency_level})*

#### **Description**
${disease.description}

#### **Symptoms**
${disease.symptoms.map(s => `- ${s}`).join('\n')}

#### **Causes**
${disease.causes.map(c => `- ${c}`).join('\n')}

#### **Risk Factors**
${disease.risk_factors.map(r => `- ${r}`).join('\n')}

#### **Precautions**
${disease.precautions.map(p => `- ${p}`).join('\n')}

#### **Prevention**
${disease.prevention.map(p => `- ${p}`).join('\n')}

#### **Basic Treatment**
${disease.basic_treatment.map(t => `- ${t}`).join('\n')}

#### **When To Consult A Doctor**
You should seek professional medical evaluation immediately if symptoms persist, worsen, or if you develop red-flag symptoms such as high fever, difficulty breathing, chest pain, or severe dehydration.

---

### 💡 AI Simple Language Explanation
${disease.name} is classified under **${disease.category}**. In simple terms, this condition occurs when ${disease.causes[0].toLowerCase()}. 
Its main warning signs include **${disease.symptoms.slice(0, 3).join(', ')}**. 
To manage it, it is critical to focus on **${disease.precautions[0].toLowerCase()}** and consult a healthcare practitioner for a proper diagnosis.

### 🌟 Awareness Tips
1. **Spread Knowledge**: Tell family members about the signs of ${disease.name} so they can seek timely treatment.
2. **Environmental Control**: Focus on ${disease.prevention[0].toLowerCase()} to protect your household.
3. **Daily Health Log**: Write down any symptoms, when they started, and how severe they are to share with your doctor.
${DISCLAIMER}`;
}

/**
 * Generate a conversational response when no direct disease matches.
 */
function generateConversationalReply(text, history = []) {
  const normalized = text.toLowerCase();
  
  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
    return `Hello! I am your AI Public Health Assistant. 

I can help you:
1. Learn about **diseases** (e.g. "What causes hypertension?").
2. Check potential conditions with the **Symptom Checker** tab.
3. View **daily health tips** or read detailed **health articles**.

What would you like to discuss today? Ensure you remember that I am here for educational purposes only.
${DISCLAIMER}`;
  }

  if (normalized.includes('symptom') || normalized.includes('cough') || normalized.includes('fever') || normalized.includes('headache')) {
    return `It sounds like you are inquiring about symptoms. 

To check potential conditions based on multiple symptoms, please visit our interactive **Symptom Checker** in the navigation bar. 
Common causes of symptoms like cough, headache, or fever include:
- **Influenza (Flu)** (Respiratory viral infection)
- **COVID-19** (SARS-CoV-2 infection)
- **Acute Bronchitis** (Bronchial inflammation)
- **Common Cold** (Mild upper respiratory viral infection)

Please remember that these suggestions are educational. It is crucial to monitor your state and seek professional guidance if symptoms are severe.
${DISCLAIMER}`;
  }

  // Generic healthcare reply
  return `Thank you for reaching out. As an AI-powered public health assistant, I'm here to provide educational information about disease prevention, risk factors, and awareness.

To find detailed info on a specific illness, try asking:
- *"What are the symptoms of Dengue?"*
- *"How can I prevent Malaria?"*
- *"Explain Diabetes in simple terms."*

If you're feeling unwell, write down your specific symptoms or use our **Symptom Checker**.
${DISCLAIMER}`;
}

/**
 * Generates follow-up questions based on query.
 */
function getFollowUpQuestions(disease) {
  if (disease) {
    return [
      `What are the long-term risk factors of ${disease.name}?`,
      `How is ${disease.name} diagnosed by a doctor?`,
      `Can you give me daily prevention tips for ${disease.category}?`,
      `What should I do in an emergency related to ${disease.name}?`
    ];
  }
  return GENERAL_FOLLOW_UPS;
}

/**
 * Generate a conversation title from user's first prompt.
 */
function generateTitle(prompt) {
  const matched = findMatchingDisease(prompt);
  if (matched) {
    return `About ${matched.name}`;
  }

  const words = prompt.trim().split(/\s+/);
  if (words.length <= 4) return prompt;
  return words.slice(0, 4).join(' ') + '...';
}

/**
 * Simulated stream response creator.
 * Yields chunks of text over time.
 */
function streamResponse(prompt, history, onChunk, onComplete) {
  const matched = findMatchingDisease(prompt);
  let responseText = '';
  
  if (matched) {
    responseText = generateDiseaseMarkdown(matched);
  } else {
    responseText = generateConversationalReply(prompt, history);
  }

  const followUps = getFollowUpQuestions(matched);
  
  // Emulate streaming by splitting response by characters/words
  let index = 0;
  const interval = setInterval(() => {
    // Send a small chunk of words/chars
    const chunkSize = Math.min(15, responseText.length - index);
    const chunk = responseText.substring(index, index + chunkSize);
    index += chunkSize;
    
    if (chunk) {
      onChunk(chunk);
    }
    
    if (index >= responseText.length) {
      clearInterval(interval);
      onComplete({
        fullText: responseText,
        followUps,
        diseaseId: matched ? matched.id : null
      });
    }
  }, 25);
}

module.exports = {
  findMatchingDisease,
  generateDiseaseMarkdown,
  generateConversationalReply,
  getFollowUpQuestions,
  generateTitle,
  streamResponse
};
