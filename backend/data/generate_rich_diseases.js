const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, 'diseases_data.json');
const OUTPUT_PATH = path.join(__dirname, 'diseases_data.json');

// Define the 11 target categories
const CATEGORY_MAPPING = {
  "Infectious Diseases": "Infectious Disease",
  "Respiratory Diseases": "Respiratory Disease",
  "Cardiovascular Diseases": "Cardiovascular Disease",
  "Endocrine Diseases": "Endocrine Disease",
  "Digestive Diseases": "Digestive Disease",
  "Neurological Diseases": "Neurological Disease",
  "Kidney Diseases": "Kidney Disease",
  "Skin Diseases": "Skin Disease",
  "Bone & Joint Diseases": "Bone and Joint Disease",
  "Mental Health Disorders": "Mental Health Disorder",
  "Cancer Types": "Cancer",
  // Standardize potential singulars/other formats
  "Infectious Disease": "Infectious Disease",
  "Respiratory Disease": "Respiratory Disease",
  "Cardiovascular Disease": "Cardiovascular Disease",
  "Endocrine Disease": "Endocrine Disease",
  "Digestive Disease": "Digestive Disease",
  "Neurological Disease": "Neurological Disease",
  "Kidney Disease": "Kidney Disease",
  "Skin Disease": "Skin Disease",
  "Bone and Joint Disease": "Bone and Joint Disease",
  "Mental Health Disorder": "Mental Health Disorder",
  "Cancer": "Cancer"
};

// Primary database entries list
let rawDiseases = [];
try {
  rawDiseases = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
  console.log(`Loaded ${rawDiseases.length} raw diseases.`);
} catch (e) {
  console.error("Could not load original diseases_data.json, creating fallback", e);
  process.exit(1);
}

// Category-based detailed generation templates
const CATEGORY_TEMPLATES = {
  "Infectious Disease": {
    overview: (name) => `${name} is an infectious disease caused by pathogenic microorganisms, such as bacteria, viruses, parasites, or fungi. The disease can be spread, directly or indirectly, from one person to another. It typically affects the body by inducing inflammatory responses, fever, and cellular damage in target tissues as the immune system attempts to clear the invading pathogen.`,
    causes: (name) => ({
      primary: `Infection with the specific pathogen responsible for ${name}.`,
      secondary: "Close contact with infected individuals or bodily fluids.",
      environmental: "Contaminated surfaces, poor sanitation, standing water, or vector-dense environments.",
      genetic: "No direct genetic cause, but host genetic factors can influence immune susceptibility and disease severity."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Low-grade fever", "Mild fatigue or body aches", "Loss of appetite", "Slight chills"],
      common: symptoms.length > 0 ? symptoms : ["Fever", "Fatigue", "Headache", "Nausea"],
      severe: ["Persistent high fever (>103°F/39.5°C)", "Shortness of breath", "Severe vomiting or dehydration", "Confusion or lethargy"]
    }),
    risk_factors_detail: {
      age: "Infants, young children, and older adults are at a higher risk of severe disease due to weaker immune systems.",
      lifestyle: "Poor hand hygiene, crowded living conditions, and lack of immunization or vaccine updates.",
      family_history: "No direct inheritance, but family sharing of living spaces increases household exposure.",
      medical_conditions: "Immunocompromised states, chronic illness (diabetes, kidney disease), or active chemotherapy.",
      environmental: "Traveling to endemic regions, poor community sanitation, or exposure to disease vectors (mosquitoes, ticks)."
    },
    complications: {
      untreated: "Sepsis, organ failure, severe dehydration, or chronic disability.",
      long_term: "Post-viral fatigue, tissue scarring (such as lung scarring in pneumonia), or prolonged joint stiffness."
    },
    prevention_detail: {
      lifestyle: "Maintain a robust immune system through balanced nutrition and proper rest.",
      hygiene: "Wash hands with soap and water frequently; sanitize surfaces regularly; cover mouth when coughing.",
      vaccination: "Keep vaccinations up to date, including annual boosters or disease-specific immunizations.",
      dietary: "Eat immune-supportive foods rich in vitamins C, D, and Zinc.",
      exercise: "Maintain moderate, regular physical activity to boost baseline cardiovascular and immune health."
    },
    precautions_detail: {
      daily: "Sanitize shared objects, stay home when exhibiting symptoms, and practice physical distancing during outbreaks.",
      travel: "Obtain travel vaccinations, drink bottled or purified water, and use insect repellent in tropical zones.",
      community: "Support local health campaigns, respect isolation protocols, and notify local health boards of outbreaks."
    },
    treatment_detail: {
      first_line: "Adequate hydration, complete bed rest, and over-the-counter fever reducers.",
      home_care: "Use oral rehydration solutions, cool damp cloths for fever, and rest in a well-ventilated room.",
      medical: "Antibiotics (if bacterial), antivirals (if viral), or intravenous fluid replacement for severe dehydration."
    },
    when_to_consult: "Consult a doctor if fever lasts longer than 3 days, symptoms worsen progressively, or if you develop a new rash or persistent cough.",
    emergency_warning_signs: "Seek emergency care immediately for difficulty breathing, chest pain, blue lips or face, confusion, or inability to stay awake.",
    diagnosis_methods: {
      physical_exam: "Evaluation of vital signs, throat examination, listening to lung sounds, and checking for swollen lymph nodes.",
      laboratory_tests: "Complete Blood Count (CBC), polymerase chain reaction (PCR) tests, rapid antigen testing, or blood/urine cultures.",
      imaging_tests: "Chest X-ray for respiratory involvement; CT scans in rare instances of localized deep tissue infection.",
      screening: "Targeted testing during community outbreaks or screening of high-risk close contacts."
    },
    recommended_diet: {
      eat: ["Clear broths and light soups", "Oral rehydration salts (ORS) dissolved in water", "Bananas, rice, applesauce, and toast (BRAT diet)", "Citrus fruits and leafy greens"],
      avoid: ["Fried, greasy, or heavily spiced foods", "Sugary sodas or processed sweets", "Alcohol and caffeinated drinks", "Undercooked meats or unpasteurized dairy"]
    },
    lifestyle_recommendations: {
      exercise: "Strict rest during the febrile stage. Avoid heavy workouts until 7-10 days after all symptoms clear.",
      sleep: "Ensure 8-10 hours of sleep per night to facilitate cellular repair and antibody production.",
      stress_management: "Minimize screen time and physical exertion; engage in quiet reading or meditation.",
      hydration: "Consume at least 2.5 to 3 liters of fluids daily, including water, diluted juices, and warm herbal tea."
    },
    recovery_management: {
      expected_recovery: "Most acute infectious illnesses resolve within 1 to 2 weeks, though energy levels can take longer to return.",
      long_term_tips: "Gradually reintroduce physical exercise. Maintain hygiene practices to prevent reinfection or secondary infections."
    },
    faqs: (name) => [
      { question: `Is ${name} contagious?`, answer: `Many forms of this condition can spread from person to person through respiratory droplets, direct contact, or contaminated surfaces. Practice proper hygiene to prevent transmission.` },
      { question: `Can antibiotics treat ${name}?`, answer: `Antibiotics are only effective if the underlying pathogen is bacterial. Viral, fungal, or parasitic variants require antivirals, antifungals, or specific antiparasitic drugs.` },
      { question: `How long is the recovery period for ${name}?`, answer: "Most patients begin recovery within a few days to two weeks with proper rest, fluids, and standard medical management." },
      { question: `What is the best way to prevent contracting ${name}?`, answer: "Vaccination, frequent handwashing, sanitizing shared surfaces, and avoiding close contact with active cases are the most effective preventive measures." },
      { question: `Should I isolate myself if I have ${name}?`, answer: "Yes, isolating yourself from family and the public is highly recommended during the active phase of symptoms to prevent spreading the infection." }
    ],
    awareness_tips: [
      "Wash hands thoroughly for at least 20 seconds with soap and running water.",
      "Stay up-to-date with recommended immunizations to build herd immunity.",
      "Cover your coughs and sneezes with an elbow or disposable tissue."
    ]
  },

  "Respiratory Disease": {
    overview: (name) => `${name} is a disease affecting the respiratory system, which includes the nasal passages, bronchi, and lungs. It is characterized by airway obstruction, inflammation, or damage to lung tissue. It compromises the body's capacity to exchange oxygen and carbon dioxide, leading to breathing difficulties and fatigue.`,
    causes: (name) => ({
      primary: `Inflammation or chronic irritation of the airway structures, often linked to exposure or immune reaction in ${name}.`,
      secondary: "Infection of the bronchial tree or lung tissue.",
      environmental: "Exposure to tobacco smoke, air pollution, chemical fumes, mold, or dust.",
      genetic: "Inherited traits affecting lung function, airway sensitivity, or conditions like Alpha-1 antitrypsin deficiency."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Mild shortness of breath during exertion", "Dry throat or occasional throat clearing", "Slight tightness in chest", "Mild fatigue"],
      common: symptoms.length > 0 ? symptoms : ["Cough", "Shortness of breath", "Wheezing", "Chest discomfort"],
      severe: ["Severe breathlessness even at rest", "Inability to speak in full sentences", "Cyanosis (bluish color in lips/nails)", "Rapid shallow breathing"]
    }),
    risk_factors_detail: {
      age: "Young children with developing airways and older adults with age-related lung decline are most vulnerable.",
      lifestyle: "Active smoking, history of vaping, lack of cardiovascular fitness, and working in dusty or poorly ventilated spaces.",
      family_history: "Genetic predisposition to asthma, allergies, or chronic obstructive lung diseases.",
      medical_conditions: "Heart disease, chronic allergies, gastroesophageal reflux disease (GERD), or history of respiratory infections.",
      environmental: "Living in highly polluted urban environments, exposure to secondhand smoke, or burning biomass fuels indoors."
    },
    complications: {
      untreated: "Respiratory failure, chronic hypoxia, pulmonary hypertension, or heart strain (cor pulmonale).",
      long_term: "Permanent decline in lung function, reliance on supplemental oxygen, and elevated susceptibility to severe pneumonia."
    },
    prevention_detail: {
      lifestyle: "Quit smoking immediately and avoid all forms of vapor or smoke inhalation.",
      hygiene: "Wash hands to prevent respiratory viruses; use air filters; wash bedding regularly to control dust mites.",
      vaccination: "Receive annual influenza vaccines and pneumococcal shots to shield vulnerable lung tissues.",
      dietary: "Eat foods rich in antioxidants and Omega-3 fatty acids to help damp down systemic airway inflammation.",
      exercise: "Engage in controlled cardio workouts (like walking or cycling) to strengthen respiratory muscles."
    },
    precautions_detail: {
      daily: "Check local air quality index; use rescue inhalers or medications as prescribed; avoid outdoor activity on high-pollen days.",
      travel: "Carry spare medications in hand luggage, check humidity levels of destinations, and avoid travel to high-pollution areas.",
      community: "Advocate for clean air regulations, smoke-free zones, and proper workplace respiratory gear."
    },
    treatment_detail: {
      first_line: "Inhaled bronchodilators to open airways, anti-inflammatory medications, and rest.",
      home_care: "Use a cool-mist humidifier, practice deep breathing exercises, and maintain high hydration to thin mucus.",
      medical: "Prescription corticosteroids, pulmonary rehabilitation, supplemental oxygen therapy, or targeted antibiotics for infections."
    },
    when_to_consult: "Consult a specialist if you experience a persistent cough lasting over 3 weeks, unexplained wheezing, or worsening shortness of breath.",
    emergency_warning_signs: "Seek emergency treatment if you struggle to catch your breath, experience chest pain, exhibit confusion due to low oxygen, or notice blue lips.",
    diagnosis_methods: {
      physical_exam: "Listening to lung sounds with a stethoscope, measuring pulse oximetry (oxygen saturation), and evaluating chest expansion.",
      laboratory_tests: "Arterial Blood Gas (ABG) analysis, allergy blood panels, or sputum cultures.",
      imaging_tests: "Chest X-ray to inspect lung consolidation/hyperinflation; high-resolution chest CT scan.",
      screening: "Spirometry (lung function test) to measure forced expiratory volume and lung capacity."
    },
    recommended_diet: {
      eat: ["Warm herbal teas and broths", "Leafy green vegetables (spinach, kale)", "Fatty fish (salmon, mackerel)", "Berries, seeds, and nuts"],
      avoid: ["Mucus-producing foods like heavy dairy if personal tolerance is low", "Salty foods that encourage fluid retention", "Gas-producing foods (beans, cabbage) which can bloating-restrict breathing", "Carbonated drinks"]
    },
    lifestyle_recommendations: {
      exercise: "Practice respiratory-adapted aerobic exercise (e.g., swimming, walking). Warm up thoroughly.",
      sleep: "Sleep with the head slightly elevated using extra pillows to decrease nocturnal coughing and post-nasal drip.",
      stress_management: "Employ abdominal breathing (diaphragmatic breathing) to control panic during shortness of breath.",
      hydration: "Drink 2 to 3 liters of warm water daily to keep airway mucosal linings moist and thin out mucus."
    },
    recovery_management: {
      expected_recovery: "Chronic respiratory conditions are managed long-term, while acute flares or acute bronchitis usually resolve in 2 to 3 weeks.",
      long_term_tips: "Regularly test lung capacity using a peak flow meter. Clean inhaler spacers weekly."
    },
    faqs: (name) => [
      { question: `Can ${name} be cured?`, answer: "While acute respiratory conditions can heal fully, chronic forms are managed with treatment to control symptoms and prevent permanent lung decline." },
      { question: `How does smoking affect ${name}?`, answer: "Smoking directly destroys lung alveoli, paralyzes protective cilia, increases inflammation, and significantly worsens the symptoms and prognosis." },
      { question: `What is the difference between a rescue and controller inhaler?`, answer: "Rescue inhalers act instantly to open airways during tight breathing, while controller inhalers are used daily to suppress long-term inflammation." },
      { question: `Should I exercise if I have ${name}?`, answer: "Yes, regular low-impact exercise is beneficial as it trains respiratory muscle efficiency, though you should avoid triggers and keep rescue medications nearby." },
      { question: `Does cold weather worsen ${name}?`, answer: "Yes, dry cold air can trigger immediate bronchospasms. Cover your nose and mouth with a scarf when walking in cold temperatures." }
    ],
    awareness_tips: [
      "Avoid secondhand smoke and stay clear of burning household wastes.",
      "Check the Air Quality Index (AQI) before planning outdoor sports.",
      "Use indoor air purifiers equipped with HEPA filters to reduce dust and dander."
    ]
  },

  "Cardiovascular Disease": {
    overview: (name) => `${name} refers to a class of diseases that involve the heart or blood vessels (arteries and veins). It typically affects the cardiovascular system by narrowing or blocking blood vessels, damaging the heart muscle, or interfering with electrical signals. This leads to compromised circulation, chest pain, and increased risk of oxygen deprivation in vital organs.`,
    causes: (name) => ({
      primary: `Atherosclerosis (plaque buildup), structural weakness of heart tissue, or conduction malfunctions causing ${name}.`,
      secondary: "Systemic hypertension, chronic diabetes, or vascular aging.",
      environmental: "High stress environments, physical inactivity, and exposure to secondhand tobacco smoke.",
      genetic: "Strong genetic component; family history of early-onset cardiac events significantly elevates risk profiles."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Unusual fatigue during simple activities", "Mild shortness of breath with climbing stairs", "Occasional fluttering in chest", "Dizziness when standing up quickly"],
      common: symptoms.length > 0 ? symptoms : ["Chest pain (angina)", "Shortness of breath", "Palpitations", "Fatigue"],
      severe: ["Crushing chest pressure radiating to arm, neck, or jaw", "Severe shortness of breath with cold sweat", "Sudden weakness or loss of speech", "Fainting or severe lightheadedness"]
    }),
    risk_factors_detail: {
      age: "The risk increases naturally with age, particularly in males over 45 and females post-menopause.",
      lifestyle: "High saturated-fat diet, sedentary lifestyle, cigarette smoking, and heavy alcohol consumption.",
      family_history: "First-degree relative (parent or sibling) with a heart attack or stroke before age 55 (men) or 65 (women).",
      medical_conditions: "Uncontrolled hypertension, high LDL cholesterol, diabetes, obesity, and sleep apnea.",
      environmental: "Chronic psychological stress and long-term exposure to high levels of particulate air pollution."
    },
    complications: {
      untreated: "Myocardial infarction (heart attack), ischemic stroke, congestive heart failure, or sudden cardiac arrest.",
      long_term: "Chronic circulatory insufficiency, vascular dementia, kidney dysfunction, or peripheral artery disease."
    },
    prevention_detail: {
      lifestyle: "Maintain a smoke-free life, manage body weight, and implement stress-reduction techniques.",
      hygiene: "Wash hands to avoid viral myocarditis; maintain oral health as gum disease is linked to arterial inflammation.",
      vaccination: "Stay current on flu vaccines, as influenza puts severe strain on patients with cardiovascular conditions.",
      dietary: "Follow a Mediterranean-style diet high in olive oil, fish, vegetables, whole grains, and low in sodium.",
      exercise: "Participate in at least 150 minutes of moderate-intensity aerobic exercise (like brisk walking) weekly."
    },
    precautions_detail: {
      daily: "Monitor blood pressure; limit daily sodium intake; take cardiovascular medications at the same time each day.",
      travel: "Keep active on long flights to prevent blood clots; carry medical summaries; carry extra doses of medications.",
      community: "Advocate for public access defibrillators (AEDs) and community CPR education campaigns."
    },
    treatment_detail: {
      first_line: "Lifestyle modifications, blood pressure control, and antiplatelet therapy as recommended.",
      home_care: "Maintain a low-sodium diet, track daily weights (in heart failure), and avoid sudden, intense physical strain.",
      medical: "Statins, beta-blockers, ACE inhibitors, or invasive procedures like angioplasty, stenting, or bypass surgery."
    },
    when_to_consult: "Consult a physician for new or changing chest discomfort, persistent ankle swelling, or unexplained fatigue.",
    emergency_warning_signs: "Call emergency services immediately if you experience sudden chest crushing pain, numbness on one side of the body, speech difficulty, or severe sudden shortness of breath.",
    diagnosis_methods: {
      physical_exam: "Measuring blood pressure and heart rate, listening to heart sounds for murmurs, and checking peripheral pulses.",
      laboratory_tests: "Lipid profile (cholesterol), cardiac troponins, fasting blood glucose, and brain natriuretic peptide (BNP).",
      imaging_tests: "Echocardiogram (ultrasound of heart), Coronary CT Angiography, or cardiac MRI.",
      screening: "Electrocardiogram (ECG/EKG) and Cardiac Stress Testing (treadmill test)."
    },
    recommended_diet: {
      eat: ["Leafy greens, broccoli, and tomatoes", "Oats, barley, and whole grains", "Fatty fish (salmon, tuna) and walnuts", "Extra virgin olive oil and avocados"],
      avoid: ["Trans fats and highly processed snacks", "High-sodium canned soups or fast foods", "Red meat and full-fat dairy products", "Excessive added sugars and sweets"]
    },
    lifestyle_recommendations: {
      exercise: "Engage in moderate-intensity cardio. Always warm up and cool down for 5-10 minutes.",
      sleep: "Target 7-8 hours of sound sleep; untreated sleep apnea raises heart risks.",
      stress_management: "Practice yoga, mindfulness, or breathing exercises to lower stress hormones.",
      hydration: "Maintain moderate hydration; avoid drinking excessive fluids quickly if diagnosed with heart failure."
    },
    recovery_management: {
      expected_recovery: "Recovery depends on severity; post-heart attack recovery takes 6-8 weeks with cardiac rehabilitation.",
      long_term_tips: "Attend all follow-up appointments. Keep a written log of daily blood pressure readings."
    },
    faqs: (name) => [
      { question: `What is the difference between a heart attack and cardiac arrest?`, answer: "A heart attack is a circulation problem where blood flow is blocked, whereas cardiac arrest is an electrical malfunction causing the heart to stop beating." },
      { question: `How does high cholesterol damage the heart?`, answer: "Excess cholesterol builds up inside artery walls, forming plaques that narrow the channel, restricting blood flow and potentially causing clots." },
      { question: `Are women's heart attack symptoms different?`, answer: "Yes, women are more likely to experience atypical symptoms like back or jaw pain, nausea, shortness of breath, and extreme fatigue rather than crushing chest pain." },
      { question: `Is red wine actually good for the heart?`, answer: "Moderate consumption has been discussed due to antioxidants, but medical guidelines do not recommend starting alcohol use for heart health; a balanced diet is far safer." },
      { question: `How often should I check my blood pressure?`, answer: "If you have hypertension or heart disease, check it once or twice daily. For healthy adults, checking during annual checkups is generally sufficient." }
    ],
    awareness_tips: [
      "Know your cardiovascular numbers: Blood Pressure, Cholesterol, and Blood Sugar.",
      "Incorporate at least 30 minutes of brisk walking into your daily routine.",
      "Learn the FAST acronym to identify stroke symptoms quickly."
    ]
  },

  "Endocrine Disease": {
    overview: (name) => `${name} is a disorder of the endocrine system, which regulates hormones within the body. It occurs when hormone production is either too high (hypersecretion), too low (hyposecretion), or when body cells fail to respond to hormones effectively. It affects the body by causing systemic metabolism, growth, energy levels, or reproduction imbalances.`,
    causes: (name) => ({
      primary: `Glandular dysfunction (autoimmune attack, tumor, or atrophy) leading to abnormal hormone levels in ${name}.`,
      secondary: "Pituitary gland regulatory errors or receptor insensitivity.",
      environmental: "Endocrine-disrupting chemicals, nutritional deficiencies (like iodine deficiency), or extreme stress.",
      genetic: "Strong hereditary susceptibility, particularly in autoimmune endocrine disorders."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Gradual changes in body weight", "Unusual fluctuations in energy or sleep patterns", "Mild changes in thirst or temperature sensitivity", "Subtle skin or hair changes"],
      common: symptoms.length > 0 ? symptoms : ["Fatigue", "Weight changes", "Mood swings", "Temperature intolerance"],
      severe: ["Severe electrolyte imbalances", "Extreme lethargy, stupor, or coma", "Rapid irregular heartbeat", "Severe muscle weakness or wasting"]
    }),
    risk_factors_detail: {
      age: "Risk factors shift by disease; Type 2 diabetes peaks in mid-to-late adulthood, while thyroid disorders are common in women of all ages.",
      lifestyle: "Sedentary lifestyle, high-sugar/high-fat diet, chronic sleep deprivation, and lack of stress management.",
      family_history: "Close family members with thyroid disorders, diabetes, or adrenal diseases.",
      medical_conditions: "Co-existing autoimmune conditions (like Vitiligo, Celiac) raise the risk of developing another autoimmune endocrine disease.",
      environmental: "Inadequate dietary intake of key micronutrients (e.g., iodine, selenium) or toxic metal exposure."
    },
    complications: {
      untreated: "Diabetic ketoacidosis, thyroid storm, myxedema coma, severe osteoporosis, or cardiovascular acceleration.",
      long_term: "Nerve damage (neuropathy), chronic kidney disease, arterial stiffness, vision loss, or reproductive difficulties."
    },
    prevention_detail: {
      lifestyle: "Maintain a healthy body weight and avoid smoking to protect vascular linings in metabolic conditions.",
      hygiene: "Not directly preventable via hygiene, but avoiding infections helps prevent diabetic complications.",
      vaccination: "Keep general vaccines up to date, as endocrine patients can suffer severe complications from common viruses.",
      dietary: "Focus on a diet high in fiber, complex carbohydrates, and key nutrients like iodine and Vitamin D.",
      exercise: "Engage in regular strength training and aerobic exercise to improve insulin sensitivity and support metabolism."
    },
    precautions_detail: {
      daily: "Take hormone replacement or control medications at consistent times; check skin integrity daily (especially feet in diabetes).",
      travel: "Keep hormone medicines in carry-on baggage; carry medical alert jewelry or identification indicating hormone deficiencies.",
      community: "Participate in metabolic health screenings and support diabetes/endocrine education programs."
    },
    treatment_detail: {
      first_line: "Hormone replacement therapy (e.g., Levothyroxine, Insulin) or hormone-blocking agents.",
      home_care: "Monitor blood glucose or symptoms closely, maintain stable meal patterns, and stay hydrated.",
      medical: "Specialist endocrinologist monitoring, regular hormone lab draws, dose adjustments, or surgical gland removal if tumors are present."
    },
    when_to_consult: "Consult a doctor for unexplained weight shifts, constant fatigue, persistent temperature discomfort, or chronic changes in thirst.",
    emergency_warning_signs: "Seek emergency care for severe confusion, rapid breathing with fruity breath odor, persistent vomiting, loss of consciousness, or extreme tremors.",
    diagnosis_methods: {
      physical_exam: "Checking thyroid gland size, inspecting skin condition, evaluating blood pressure, and testing deep tendon reflexes.",
      laboratory_tests: "Free T4/TSH panels, Hemoglobin A1c, fasting insulin, cortisol stimulation tests, and electrolyte panels.",
      imaging_tests: "Thyroid ultrasound, pituitary MRI, or adrenal CT scans.",
      screening: "Fasting blood sugar or HbA1c checks during annual physicals."
    },
    recommended_diet: {
      eat: ["High-fiber vegetables and legumes", "Lean proteins (poultry, fish, tofu)", "Iodized salt (if thyroid deficiency is a concern)", "Whole grains and seeds"],
      avoid: ["Simple sugars and high-fructose corn syrup", "Refined grains (white bread, white rice)", "Excessive iodine (only if hyperthyroid)", "Processed meats and trans fats"]
    },
    lifestyle_recommendations: {
      exercise: "Combine cardiovascular workouts with resistance training to optimize hormone receptor activity.",
      sleep: "Prioritize 8 hours of sleep; endocrine regulation relies heavily on circadian rhythms.",
      stress_management: "Use mindfulness to keep cortisol levels low, as stress interferes with insulin and thyroid function.",
      hydration: "Maintain standard hydration; increase pure water intake if experiencing high blood sugar."
    },
    recovery_management: {
      expected_recovery: "Most endocrine conditions are chronic and require lifelong management, though symptoms stabilize quickly with proper hormone balancing.",
      long_term_tips: "Get thyroid or blood sugar numbers checked every 3 to 6 months. Maintain active communication with an endocrinologist."
    },
    faqs: (name) => [
      { question: `What is the endocrine system?`, answer: "It is a network of glands that produce and release hormones that control many important body functions, including growth, metabolism, and energy levels." },
      { question: `Why are hormone levels checked via blood tests?`, answer: "Hormones travel through the bloodstream, so analyzing blood samples provides direct, accurate measurements of active hormone levels." },
      { question: `Can diet cure endocrine disorders?`, answer: "While a healthy diet is crucial for management (especially in diabetes), it cannot cure structural or autoimmune endocrine damage; medical therapy is usually required." },
      { question: `What is hormone resistance?`, answer: "It is a condition where the gland produces hormones, but the target body cells are unable to recognize or respond to them (e.g., insulin resistance in Type 2 Diabetes)." },
      { question: `How long do hormone replacement medications take to work?`, answer: "It can take several weeks for hormone levels to stabilize in the blood and for you to notice a significant improvement in symptoms." }
    ],
    awareness_tips: [
      "Avoid crash diets that can disrupt your endocrine and thyroid functions.",
      "Get routine blood sugar checkups if you have a family history of diabetes.",
      "Check your neck occasionally for swelling or nodules which could indicate thyroid issues."
    ]
  },

  "Digestive Disease": {
    overview: (name) => `${name} is a disorder affecting the gastrointestinal (GI) tract, which includes the esophagus, stomach, small and large intestines, liver, gallbladder, and pancreas. It disrupts the mechanical or chemical digestion of food, absorption of nutrients, and excretion of waste. It affects the body by causing inflammation, pain, acid reflux, or nutrient deficiencies.`,
    causes: (name) => ({
      primary: `Gastrointestinal tissue inflammation, enzyme deficiencies, bacterial imbalance, or anatomical malfunctions in ${name}.`,
      secondary: "Infection (H. pylori), mucosal erosion, or chronic immune response.",
      environmental: "Diet high in processed foods, alcohol consumption, high stress, and frequent NSAID use.",
      genetic: "Genetic factors influence susceptibility to autoimmune gut conditions like Celiac and Crohn's disease."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Mild bloating or gas after eating", "Occasional indigestion or heartburn", "Slight alterations in stool frequency", "Mild nausea"],
      common: symptoms.length > 0 ? symptoms : ["Abdominal pain", "Bloating", "Nausea", "Diarrhea or constipation"],
      severe: ["Vomiting blood or dark coffee-ground material", "Black, tarry, or bloody stools", "Unexplained, rapid weight loss", "Severe, localized abdominal pain"]
    }),
    risk_factors_detail: {
      age: "Can occur at any age; inflammatory bowel diseases often present in young adults, while diverticular disease is common in older adults.",
      lifestyle: "Low-fiber diets, high alcohol intake, smoking, rapid eating habits, and high stress levels.",
      family_history: "Family history of inflammatory bowel disease, celiac disease, or colorectal polyps.",
      medical_conditions: "History of GI infections, autoimmune disorders, obesity, or prolonged use of irritating medications (NSAIDs).",
      environmental: "Poor food sanitation, lack of clean water, or exposure to food allergens."
    },
    complications: {
      untreated: "Severe dehydration, malnutrition, bowel obstruction, internal bleeding, or perforation of the digestive tract.",
      long_term: "Esophageal damage (Barrett's esophagus), chronic anemia, colon tissue scarring, or increased risk of gastrointestinal cancers."
    },
    prevention_detail: {
      lifestyle: "Eat at structured times, chew food thoroughly, and limit alcohol and tobacco intake.",
      hygiene: "Wash hands before cooking/eating; wash fresh produce thoroughly to avoid foodborne pathogens.",
      vaccination: "Hepatitis A and B vaccines protect the liver from viral infections that cause chronic digestive damage.",
      dietary: "Increase dietary fiber gradually, drink plenty of water, and consume probiotic-rich fermented foods.",
      exercise: "Maintain light-to-moderate exercise (like post-meal walks) to stimulate healthy bowel motility."
    },
    precautions_detail: {
      daily: "Identify and avoid food triggers; limit carbonated beverages; avoid lying down within 2-3 hours of eating.",
      travel: "Practice 'cook it, peel it, or forget it' in areas with unsafe tap water; carry antacids or anti-diarrheal meds.",
      community: "Support clean water access and standard health inspections for food services."
    },
    treatment_detail: {
      first_line: "Dietary adjustments, increased hydration, and over-the-counter antacids or fiber supplements.",
      home_care: "Eat smaller meals, use a food diary to track flares, and drink soothing herbal teas (peppermint or ginger).",
      medical: "Proton pump inhibitors, antibiotics, immunomodulators, or surgical interventions for structural repairs."
    },
    when_to_consult: "Consult a healthcare provider for heartburn that occurs more than twice a week, persistent diarrhea, or chronic abdominal bloating.",
    emergency_warning_signs: "Seek emergency care for severe, sudden abdominal pain, inability to keep fluids down, jaundice (yellow skin/eyes), or blood in vomit or stool.",
    diagnosis_methods: {
      physical_exam: "Palpating the abdomen for tenderness or masses, checking for signs of dehydration, and examining sclera for jaundice.",
      laboratory_tests: "Stool tests for occult blood or pathogens, serum food allergen panels, and liver enzyme tests.",
      imaging_tests: "Abdominal ultrasound, CT scan of the abdomen, or barium swallow study.",
      screening: "Upper Endoscopy or Colonoscopy to view mucosal linings directly and take biopsies."
    },
    recommended_diet: {
      eat: ["High-fiber fruits and vegetables (if not in an active IBD flare)", "Oatmeal, brown rice, and quinoa", "Yogurt, kefir, and fermented foods", "Lean meats, fish, and clear broths"],
      avoid: ["Greasy, deep-fried foods", "Highly spiced foods", "Artificial sweeteners", "Excessive caffeine and carbonated drinks"]
    },
    lifestyle_recommendations: {
      exercise: "Engage in regular low-impact exercise (walking, yoga) to promote healthy digestion.",
      sleep: "Aim for 7-8 hours; sleep deprivation is linked to increased gut inflammation.",
      stress_management: "Engage in stress reduction as the gut is highly sensitive to stress hormones (gut-brain axis).",
      hydration: "Drink 2 to 2.5 liters of clean water daily to support digestion and stool softness."
    },
    recovery_management: {
      expected_recovery: "Acute digestive issues (like gastritis) heal in a few days, while chronic conditions require life-long dietary adjustments.",
      long_term_tips: "Avoid eating large meals before bedtime. Keep track of trigger foods in a journal."
    },
    faqs: (name) => [
      { question: `What is the 'gut-brain axis'?`, answer: "It is the bidirectional communication link between the central nervous system and the enteric nervous system of the gut; stress directly impacts digestive function." },
      { question: `How does fiber help the digestive system?`, answer: "Fiber adds bulk to the stool, speeds up transit time, and acts as food for beneficial gut bacteria, promoting overall colonic health." },
      { question: `Are antacids safe to take every day?`, answer: "Occasional use is safe, but daily reliance can mask underlying issues (like GERD or ulcers) and interfere with mineral absorption." },
      { question: `What are probiotics?`, answer: "Probiotics are live, beneficial microorganisms that help maintain a healthy microbial balance in the gut, aiding digestion and immune response." },
      { question: `Can stress cause peptic ulcers?`, answer: "Stress does not cause ulcers directly (H. pylori bacteria and NSAIDs do), but stress can significantly worsen symptoms and delay healing." }
    ],
    awareness_tips: [
      "Incorporate at least 25-30 grams of fiber into your daily diet.",
      "Stay hydrated to keep your digestive tract functioning smoothly.",
      "Limit the consumption of highly processed and fried foods."
    ]
  },

  "Neurological Disease": {
    overview: (name) => `${name} is a disorder of the nervous system, which includes the brain, spinal cord, cranial nerves, peripheral nerves, and the autonomic nervous system. It is characterized by progressive degeneration, structural injury, or electrical instability in nerve pathways. It affects the body by impairing memory, cognition, movement, sensation, or coordinate functions.`,
    causes: (name) => ({
      primary: `Loss of neurons, abnormal protein accumulation, or electrical signal malfunctions in the brain as seen in ${name}.`,
      secondary: "Reduced cerebral blood flow, neuroinflammation, or demyelination.",
      environmental: "Exposure to heavy metals, neurotoxins, chronic physical head trauma, or chronic stress.",
      genetic: "Hereditary mutations (e.g., in Huntington's) or complex genetic susceptibility in Alzheimer's and Migraines."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Mild memory lapses or word-finding difficulty", "Subtle changes in coordination or balance", "Recurrent mild headaches or sensory tingling", "Changes in mood or sleep hygiene"],
      common: symptoms.length > 0 ? symptoms : ["Headache", "Tremors", "Cognitive decline", "Sensory loss"],
      severe: ["Loss of motor function or paralysis", "Seizures or loss of consciousness", "Sudden severe speech deficit or confusion", "Difficulty swallowing or breathing"]
    }),
    risk_factors_detail: {
      age: "Risk rises significantly with age for neurodegenerative diseases (Parkinson's, Alzheimer's), whereas migraines and epilepsy often manifest earlier.",
      lifestyle: "Lack of mental stimulation, sedentary habits, poor cardiovascular health, smoking, and chronic sleep deprivation.",
      family_history: "Family members with dementia, stroke, neuromuscular diseases, or chronic migraines.",
      medical_conditions: "Uncontrolled hypertension, diabetes, history of concussions or head injuries, and autoimmune diseases.",
      environmental: "Prolonged occupational exposure to pesticides, solvents, or lead."
    },
    complications: {
      untreated: "Severe cognitive decline, complete loss of independence, severe mobility issues, or fatal respiratory complications.",
      long_term: "Muscle contractures, chronic pain, depression, and elevated risk of falls or choking."
    },
    prevention_detail: {
      lifestyle: "Keep physically active; wear helmets during impact sports; stay socially engaged; quit smoking.",
      hygiene: "Not preventable by hygiene, but handwashing prevents viral meningitis.",
      vaccination: "Meningococcal and shingles vaccines protect against neurological infections and post-herpetic neuralgia.",
      dietary: "Consume antioxidant-rich foods, nuts, and healthy fats (Omega-3s) to protect nerve cells.",
      exercise: "Engage in balance exercises (like Tai Chi) and cardiovascular workouts to promote neuroplasticity."
    },
    precautions_detail: {
      daily: "Create a structured routine; remove household tripping hazards; carry pill organizers to stay compliant.",
      travel: "Plan travel during low-stress hours; carry clear medication lists and physician contacts; allow extra transit time.",
      community: "Support dementia-friendly spaces and ensure safety modifications in public areas."
    },
    treatment_detail: {
      first_line: "Symptom-managing medications (e.g., dopaminergics, anticonvulsants) and physical therapy.",
      home_care: "Maintain safety-proofed living spaces, establish consistent schedules, and use memory aids (calendars, notes).",
      medical: "Endovascular procedures (in stroke), deep brain stimulation, specialized neurological rehab, and speech therapy."
    },
    when_to_consult: "Consult a neurologist for recurring headaches, unexplained muscle weakness, persistent tremors, or notable changes in memory.",
    emergency_warning_signs: "Call emergency services for sudden onset of weakness on one side, difficulty speaking, sudden severe headache, seizures, or loss of balance.",
    diagnosis_methods: {
      physical_exam: "Testing cranial nerve function, evaluating gait and balance, checking deep tendon reflexes, and testing sensory responses.",
      laboratory_tests: "Cerebrospinal Fluid (CSF) analysis via lumbar puncture, genetic testing, or vitamin B12 levels.",
      imaging_tests: "Brain MRI (magnetic resonance imaging) or CT scan to inspect structure.",
      screening: "Electroencephalogram (EEG) for seizure monitoring, and Electromyography (EMG) for nerve conduction."
    },
    recommended_diet: {
      eat: ["Green leafy vegetables (folate-rich)", "Blueberries, strawberries, and blackberries", "Fatty fish (salmon, sardines)", "Walnuts, almonds, and pumpkin seeds"],
      avoid: ["High-sugar foods and drinks", "Processed meats containing nitrates", "Trans fats and hydrogenated oils", "Excessive alcohol consumption"]
    },
    lifestyle_recommendations: {
      exercise: "Engage in regular low-impact exercise (walking, swimming) to maintain motor pathways.",
      sleep: "Ensure 7.5 to 8.5 hours of sleep to allow the glymphatic system to clear brain metabolic wastes.",
      stress_management: "Engage in cognitive exercises, puzzles, social chat, and meditation to maintain brain resilience.",
      hydration: "Maintain hydration; dehydration can worsen cognitive confusion and trigger headaches."
    },
    recovery_management: {
      expected_recovery: "Neurodegenerative conditions progress slowly over years; structural issues (like stroke or neuropathy) benefit from rehabilitation over months.",
      long_term_tips: "Perform cognitive and physical rehab exercises daily. Stay connected with support groups."
    },
    faqs: (name) => [
      { question: `What is 'neuroplasticity'?`, answer: "It is the brain's ability to reorganize itself by forming new neural connections throughout life, which is critical for learning and recovery after injury." },
      { question: `Does memory loss always mean Alzheimer's?`, answer: "No, mild forgetfulness is normal with aging. Memory loss can also be caused by stress, lack of sleep, thyroid issues, or vitamin deficiencies." },
      { question: `What causes a migraine aura?`, answer: "An aura is caused by a wave of electrical activity that spreads across the brain's cortex, temporarily affecting vision or sensation." },
      { question: `How does exercise help brain health?`, answer: "Exercise increases blood flow to the brain, stimulates the release of growth factors (BDNF), and encourages the growth of new connections." },
      { question: `Can damaged nerve cells heal?`, answer: "Nerve cells in the peripheral nervous system can regenerate slowly under the right conditions, but cells in the central nervous system (brain and spinal cord) have limited repair capacity." }
    ],
    awareness_tips: [
      "Keep your brain active by learning new skills, languages, or playing music.",
      "Protect your head: wear helmets during cycling, skating, or contact sports.",
      "Control blood pressure; brain health is closely linked to cardiovascular health."
    ]
  },

  "Kidney Disease": {
    overview: (name) => `${name} is a disease affecting the kidneys, the organs responsible for filtering waste products, excess water, and impurities from the blood. It impairs the kidney's glomerular or tubular structures, leading to fluid retention, electrolyte imbalances, and buildup of toxins. It affects the body by causing edema, hypertension, and fatigue.`,
    causes: (name) => ({
      primary: `Damage to the nephrons (filtering units) due to systemic disease, autoimmune attack, or infection in ${name}.`,
      secondary: "Glomerular inflammation or physical obstruction in the urinary tract.",
      environmental: "Chronic exposure to heavy metals, dehydration in hot climates, or high dietary sodium.",
      genetic: "Inherited mutations such as in Polycystic Kidney Disease (PKD)."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Slightly foamy urine", "Increased urination frequency (especially at night)", "Mild swelling in ankles or around eyes", "Mild fatigue"],
      common: symptoms.length > 0 ? symptoms : ["Edema", "Fatigue", "Changes in urination", "Nausea"],
      severe: ["Severe shortness of breath (fluid in lungs)", "Persistent vomiting and severe loss of appetite", "Mental confusion or seizures", "Severe decreased output or lack of urine"]
    }),
    risk_factors_detail: {
      age: "Risk increases in older adults (60+) due to natural decline in nephron function.",
      lifestyle: "High-sodium diet, smoking, sedentary lifestyle, and high intake of processed foods.",
      family_history: "Family members with chronic kidney failure, diabetes, or severe hypertension.",
      medical_conditions: "Type 1 or 2 Diabetes, chronic High Blood Pressure, history of kidney stones, or cardiovascular disease.",
      environmental: "Frequent exposure to chemical solvents or chronic overuse of over-the-counter painkillers (NSAIDs)."
    },
    complications: {
      untreated: "End-Stage Renal Disease (ESRD) requiring dialysis, fluid overload, severe hyperkalemia (high potassium, dangerous for the heart), or death.",
      long_term: "Chronic anemia, mineral bone disease (weak bones), fluid accumulation in the heart/lungs, and accelerated cardiovascular disease."
    },
    prevention_detail: {
      lifestyle: "Keep blood sugar and blood pressure under control; do not smoke; maintain a healthy weight.",
      hygiene: "Treat urinary tract infections promptly to prevent bacteria from climbing to the kidneys.",
      vaccination: "Get vaccinated against Hepatitis B (dialysis patients are at risk) and receive annual flu shots.",
      dietary: "Follow a moderate-protein, low-sodium, low-phosphorus diet if kidney function is compromised.",
      exercise: "Engage in regular aerobic exercise to support blood pressure management."
    },
    precautions_detail: {
      daily: "Limit sodium intake to under 2,000 mg/day; avoid over-the-counter NSAIDs (Ibuprofen, Naproxen); monitor daily fluid intake.",
      travel: "Locate travel-dialysis options ahead of time if on dialysis; carry medical records and potassium-restricting food lists.",
      community: "Participate in early kidney screening programs (urine albumin and blood creatinine checks)."
    },
    treatment_detail: {
      first_line: "Blood pressure medications (ACE inhibitors or ARBs) to protect kidney function, and dietary changes.",
      home_care: "Manage fluid intake, track daily weights, limit potassium and sodium-rich foods.",
      medical: "Renal replacement therapy (hemodialysis or peritoneal dialysis), erythropoietin injections (for anemia), or kidney transplantation."
    },
    when_to_consult: "Consult a doctor for persistent foamy urine, swelling in ankles or eyes, or recurrent burning during urination.",
    emergency_warning_signs: "Seek emergency care for severe chest pain or shortness of breath, severe confusion, complete inability to urinate, or cardiac arrhythmias.",
    diagnosis_methods: {
      physical_exam: "Checking blood pressure, examining ankles/legs for pitting edema, and listening to heart and lungs.",
      laboratory_tests: "Serum Creatinine and Glomerular Filtration Rate (eGFR), Blood Urea Nitrogen (BUN), and Urinalysis (checking for albumin/protein).",
      imaging_tests: "Renal Ultrasound to inspect size and blockages; CT scan of kidneys.",
      screening: "Urine microalbuminuria test and eGFR blood tests for diabetic patients."
    },
    recommended_diet: {
      eat: ["Blueberries, raspberries, and red grapes", "Cauliflower, garlic, and onions", "Egg whites and skinless chicken breast", "White rice and pasta (if phosphorus restriction is active)"],
      avoid: ["Dark sodas (contain high phosphorus additives)", "Canned foods and high-sodium packaged snacks", "Avocados, bananas, and oranges (high potassium)", "Whole wheat bread and brown rice (high phosphorus/potassium)"]
    },
    lifestyle_recommendations: {
      exercise: "Perform moderate walking or cycling. Avoid extreme, dehydrating workouts that can cause rhabdomyolysis.",
      sleep: "Ensure 7-8 hours of sleep; sleep disturbances are common in advanced kidney disease.",
      stress_management: "Engage in stress reduction as stress hormones raise blood pressure, damaging kidney blood vessels.",
      hydration: "Drink adequate water (1.5-2L) to support filtration. Limit fluids strictly only if advised by a nephrologist due to advanced failure."
    },
    recovery_management: {
      expected_recovery: "Acute kidney injury can resolve in weeks with treatment, whereas chronic kidney disease is permanent but progression can be slowed over years.",
      long_term_tips: "Get eGFR and urine protein checked regularly. Keep a tight log of daily blood pressure."
    },
    faqs: (name) => [
      { question: `What is eGFR?`, answer: "Estimated Glomerular Filtration Rate (eGFR) measures how well your kidneys filter waste. A value below 60 for more than 3 months indicates chronic kidney disease." },
      { question: `Why does kidney disease cause anemia?`, answer: "Healthy kidneys produce a hormone called erythropoietin (EPO), which signals the bone marrow to make red blood cells. Damaged kidneys make less EPO, leading to anemia." },
      { question: `Are painkillers dangerous for the kidneys?`, answer: "Yes, nonsteroidal anti-inflammatory drugs (NSAIDs) like Ibuprofen, Naproxen, and high-dose Aspirin restrict blood flow to kidneys and can cause acute damage." },
      { question: `Can kidney stones lead to kidney disease?`, answer: "Occasional stones rarely cause permanent damage. However, recurrent stones causing long-term blockages and infections can impair kidney function." },
      { question: `What is the difference between hemodialysis and peritoneal dialysis?`, answer: "Hemodialysis filters blood using an external machine, usually at a clinic. Peritoneal dialysis uses the lining of your abdomen to filter waste at home." }
    ],
    awareness_tips: [
      "Keep your blood pressure below 130/80 mmHg to protect renal capillaries.",
      "Get checked for kidney disease if you have diabetes or hypertension.",
      "Limit daily salt intake and choose herbs/spices for flavoring instead."
    ]
  },

  "Skin Disease": {
    overview: (name) => `${name} is a condition affecting the skin, the body's largest organ. It can involve inflammation, infection, allergic reactions, or abnormal cellular growths. It affects the body by compromising the skin barrier, causing itching, pain, rashes, scaling, or cosmetic distress, and making the body more vulnerable to secondary infections.`,
    causes: (name) => ({
      primary: `Epidermal barrier dysfunction, autoimmune cellular rapid growth, or pathogen infestation causing ${name}.`,
      secondary: "Allergic contact sensitization, fungal colonization, or genetic skin cell overproduction.",
      environmental: "Exposure to harsh chemicals, allergens, UV radiation, dry climates, or friction.",
      genetic: "Hereditary factors influence conditions like Eczema, Psoriasis, and skin cancer susceptibility."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Mild localized itching", "Dry or rough skin patches", "Slight redness or warm sensation", "Small skin bumps"],
      common: symptoms.length > 0 ? symptoms : ["Itching", "Redness", "Rash", "Dry skin"],
      severe: ["Widespread painful blistering", "Signs of skin infection (pus, warmth, red streaks)", "Fever or chills accompanying skin peeling", "Rapidly changing, irregular dark moles"]
    }),
    risk_factors_detail: {
      age: "Acne is common in adolescents; eczema is frequent in children; skin cancers and shingles are more common in older adults.",
      lifestyle: "Frequent outdoor sun exposure without sunscreen, smoking, use of harsh soaps, and high stress levels.",
      family_history: "Family history of eczema, asthma, allergies, psoriasis, or melanoma.",
      medical_conditions: "History of autoimmune disorders, chronic allergies, weakened immune system, or poor circulation.",
      environmental: "Working with industrial chemicals, living in extremely dry or hot/humid climates, or exposure to allergens like pollen or pet dander."
    },
    complications: {
      untreated: "Secondary bacterial infections (cellulitis, impetigo), severe scarring, chronic pain, or systemic infection.",
      long_term: "Chronic skin thickening (lichenification), permanent pigment changes, sleep loss due to itching, or metastatic cancer."
    },
    prevention_detail: {
      lifestyle: "Apply broad-spectrum sunscreen daily; avoid tanning beds; wear protective clothing outdoors.",
      hygiene: "Bathe daily with gentle, soap-free cleansers; moisturize immediately after bathing; do not share towels.",
      vaccination: "The Shingles (Zoster) vaccine prevents shingles outbreaks and chronic post-herpetic neuralgia.",
      dietary: "Stay hydrated and consume foods rich in healthy fats (Omega-3s) to support the lipid skin barrier.",
      exercise: "Shower promptly after sweating to prevent fungal or bacterial overgrowth on the skin."
    },
    precautions_detail: {
      daily: "Moisturize skin twice daily; perform self-skin checks; avoid scratching active lesions.",
      travel: "Pack hypoallergenic toiletries; bring adequate sun protection; carry hydrocortisone or prescribed topical creams.",
      community: "Promote sun safety in schools and participate in free skin cancer screening camps."
    },
    treatment_detail: {
      first_line: "Topical moisturizers, barrier creams, and mild topical hydrocortisone.",
      home_care: "Take lukewarm baths, use cool compresses for itching, and keep fingernails short to prevent scratching.",
      medical: "Prescription topical steroids, oral antihistamines, phototherapy, or systemic biologic therapies for severe autoimmune conditions."
    },
    when_to_consult: "Consult a dermatologist for a rash that does not respond to OTC creams in 2 weeks, skin lesions that bleed, or changing moles.",
    emergency_warning_signs: "Seek emergency care if a rash covers your entire body rapidly, is accompanied by high fever, begins blistering, or causes difficulty breathing.",
    diagnosis_methods: {
      physical_exam: "Visual inspection of lesions, checking patterns and locations, and evaluating nail and scalp health.",
      laboratory_tests: "Skin scraping for fungal culture, patch testing for contact allergies, or bacterial wound swab.",
      imaging_tests: "Dermoscopy (magnified skin inspection); rarely, ultrasound to check for deep abscesses.",
      screening: "Skin biopsy (taking a small tissue sample for lab analysis) and annual full-body mole mapping."
    },
    recommended_diet: {
      eat: ["Avocados, olive oil, and nuts", "Fatty fish (rich in Omega-3)", "Water-rich fruits (watermelon, cucumbers)", "Foods high in Vitamin E and C"],
      avoid: ["High-glycemic processed foods (linked to acne flares)", "Excessive dairy (if personal trigger)", "Alcohol (can dehydrate skin and worsen psoriasis)", "Common food allergens (peanuts, shellfish, if sensitive)"]
    },
    lifestyle_recommendations: {
      exercise: "Engage in moderate exercise; wear loose, breathable cotton clothing to prevent sweat retention.",
      sleep: "Get 7-8 hours of sleep; skin cells regenerate and repair damage primarily at night.",
      stress_management: "Engage in stress relief (meditation, walking) as stress triggers flares in eczema, psoriasis, and acne.",
      hydration: "Drink 2 to 2.5 liters of water daily to maintain epidermal hydration."
    },
    recovery_management: {
      expected_recovery: "Acute rashes can clear in a week; chronic conditions like eczema have cycling flares and remissions requiring long-term management.",
      long_term_tips: "Avoid fragrance-containing lotions and laundry detergents. Apply thick ointments during winter."
    },
    faqs: (name) => [
      { question: `What is the skin barrier?`, answer: "The skin barrier is the outermost layer of the skin, consisting of lipids and cells that protect the body from moisture loss and external irritants." },
      { question: `Does stress affect skin conditions?`, answer: "Yes, stress releases hormones like cortisol that trigger inflammatory cascades, worsening eczema, psoriasis, and acne." },
      { question: `How can I tell if a mole is cancerous?`, answer: "Use the ABCDE rule: Asymmetry, Border irregularity, Color changes, Diameter >6mm, and Evolving/changing over time. Consult a doctor if present." },
      { question: `What is the difference between dry skin and eczema?`, answer: "Dry skin is lack of moisture, while eczema is an inflammatory skin disease characterized by intense itching, red patches, and barrier dysfunction." },
      { question: `Why is scratching bad for a rash?`, answer: "Scratching damages the skin barrier further, increases local inflammation, and introduces bacteria from fingernails, risking secondary infections." }
    ],
    awareness_tips: [
      "Use broad-spectrum SPF 30+ sunscreen daily, even on cloudy days.",
      "Moisturize your skin within three minutes of exiting the shower to lock in moisture.",
      "Examine your moles monthly and report any changes using the ABCDE guidelines."
    ]
  },

  "Bone and Joint Disease": {
    overview: (name) => `${name} is a disorder of the musculoskeletal system, which includes bones, joints, ligaments, tendons, and cartilage. It involves degeneration of joint cushions, systemic inflammation, or loss of bone mineral density. It affects the body by causing joint pain, stiffness, skeletal fragility, and restricted range of motion, reducing overall mobility.`,
    causes: (name) => ({
      primary: `Breakdown of joint cartilage, autoimmune attack on joint linings, or mineral depletion in bones as in ${name}.`,
      secondary: "Repetitive mechanical load, wear-and-tear, or metabolic crystal deposition (gout).",
      environmental: "Sedentary lifestyle, repetitive occupational joint stress, or lack of dietary calcium/Vitamin D.",
      genetic: "Genetic factors influence bone structure, inflammatory arthritis risk, and peak bone density levels."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Joint stiffness in the morning or after resting", "Mild joint ache after prolonged use", "Occasional popping or cracking sounds", "Mild fatigue"],
      common: symptoms.length > 0 ? symptoms : ["Joint pain", "Stiffness", "Swelling", "Decreased mobility"],
      severe: ["Joint deformity or inability to bear weight", "Severe, localized joint swelling, warmth, and redness", "Sudden bone fracture from minor fall", "Fever and chills accompanying joint pain"]
    }),
    risk_factors_detail: {
      age: "Osteoporosis and osteoarthritis risks rise sharply in older adults, while rheumatoid arthritis often manifests between ages 30-50.",
      lifestyle: "Sedentary lifestyle, smoking (accelerates bone loss), poor diet lacking calcium, and high-impact repetitive strain.",
      family_history: "Family history of osteoporosis, early-onset arthritis, or autoimmune joint disorders.",
      medical_conditions: "Obesity (places heavy load on joints), diabetes, thyroid disease, or chronic use of steroid medications.",
      environmental: "Occupations requiring repetitive kneeling, heavy lifting, or exposure to damp, cold climates."
    },
    complications: {
      untreated: "Severe chronic pain, joint deformities, loss of mobility, or high risk of hip/spine fractures.",
      long_term: "Permanent loss of joint function, dependence on walking aids, chronic inflammatory state, or severe curvature of the spine."
    },
    prevention_detail: {
      lifestyle: "Maintain a healthy weight; avoid smoking; wear supportive footwear; practice correct ergonomics.",
      hygiene: "Keep good posture; avoid joint-straining postures; use assistive items when lifting heavy weights.",
      vaccination: "None available, but staying active keeps overall immune health stable in inflammatory arthritis.",
      dietary: "Ensure adequate calcium and Vitamin D intake; eat anti-inflammatory foods.",
      exercise: "Perform low-impact aerobic exercise (swimming, cycling) and strength training to build supportive muscles."
    },
    precautions_detail: {
      daily: "Perform joint-friendly stretches daily; avoid high-impact activities if joints are inflamed; apply heat for stiffness and ice for swelling.",
      travel: "Use luggage with wheels; take stretching breaks during long travel; carry folding walking aids if needed.",
      community: "Advocate for step-free access, ramps, and fall-prevention exercise classes for older adults."
    },
    treatment_detail: {
      first_line: "Pain relievers (Acetaminophen, NSAIDs), physical therapy, and joint protection measures.",
      home_care: "Use hot/cold packs, apply topical pain-relief gels, perform gentle range-of-motion exercises, and rest when joints flare.",
      medical: "Corticosteroid injections, disease-modifying antirheumatic drugs (DMARDs), joint-viscosupplementation, or joint replacement surgery."
    },
    when_to_consult: "Consult a rheumatologist or orthopedist for joint pain lasting over 6 weeks, unexplained morning stiffness, or swollen, warm joints.",
    emergency_warning_signs: "Seek emergency care for an inability to move a joint, suspected bone fracture, or sudden severe joint swelling accompanied by high fever.",
    diagnosis_methods: {
      physical_exam: "Evaluating range of motion, checking for joint tenderness and swelling, testing muscle strength, and checking spinal alignment.",
      laboratory_tests: "Rheumatoid Factor (RF), Anti-CCP antibodies, Erythrocyte Sedimentation Rate (ESR/CRP), or uric acid levels.",
      imaging_tests: "Joint X-rays to check joint space narrowing/bone spurs; MRI for soft-tissue ligament damage.",
      screening: "Dual-Energy X-ray Absorptiometry (DEXA) scan to measure bone mineral density."
    },
    recommended_diet: {
      eat: ["Calcium-rich dairy (milk, cheese, yogurt)", "Fortified cereals and plant milks (Vitamin D)", "Fatty fish (salmon, sardines with bones)", "Broccoli, kale, and leafy greens"],
      avoid: ["Processed sugars (promote inflammation)", "Excessive salt (can cause calcium loss from bones)", "Refined carbohydrates (white flour products)", "Excessive alcohol and caffeine (impair calcium absorption)"]
    },
    lifestyle_recommendations: {
      exercise: "Combine resistance training (strengthens bone) with low-impact cardio. Perform balance training.",
      sleep: "Aim for 8 hours; rest is essential for joint tissues to repair and recover from daily mechanical strain.",
      stress_management: "Engage in meditation as chronic stress can worsen pain perception in joint conditions.",
      hydration: "Drink 2 liters of water; joint cartilage is composed mostly of water and needs hydration to remain lubricated."
    },
    recovery_management: {
      expected_recovery: "Degenerative conditions are managed long-term; post-joint replacement rehab takes 3-6 months for optimal recovery.",
      long_term_tips: "Regularly check home environments for fall hazards. Avoid high-impact loading on arthritic joints."
    },
    faqs: (name) => [
      { question: `What is the difference between osteoarthritis and rheumatoid arthritis?`, answer: "Osteoarthritis is a wear-and-tear disease where joint cartilage breaks down, while rheumatoid arthritis is an autoimmune disease where the immune system attacks joint linings." },
      { question: `Why is Vitamin D important for bones?`, answer: "Vitamin D is essential for the body to absorb calcium from food. Without adequate Vitamin D, the body cannot build strong bones, regardless of calcium intake." },
      { question: `How does excess weight affect joint health?`, answer: "Every pound of excess weight puts four additional pounds of pressure on knee joints, accelerating cartilage breakdown." },
      { question: `What is a DEXA scan?`, answer: "A DEXA scan is a low-radiation X-ray that measures bone mineral density. It is the gold standard for diagnosing osteopenia and osteoporosis." },
      { question: `Can joint cracking cause arthritis?`, answer: "No, popping knuckles release gas bubbles from joint fluid and has not been shown to cause arthritis, though habitual cracking may reduce grip strength." }
    ],
    awareness_tips: [
      "Incorporate weight-bearing exercises to maintain bone density.",
      "Ensure adequate daily calcium (1000-1200 mg) and Vitamin D (600-800 IU).",
      "Set up your workspace ergonomically to prevent neck and back joint strain."
    ]
  },

  "Mental Health Disorder": {
    overview: (name) => `${name} is a mental health condition that affects emotion, thinking, behavior, or relationships. It involves disruptions in neurotransmitter regulation, brain circuitry, or psychological coping mechanisms. It affects the body by causing cognitive deficits, sleep disturbances, fatigue, altered appetite, and significant distress or impairment in daily functioning.`,
    causes: (name) => ({
      primary: `Disruptions in brain chemistry (serotonin, dopamine), genetic predisposition, or traumatic life events in ${name}.`,
      secondary: "Chronic stress, hormonal shifts, or adverse childhood experiences.",
      environmental: "Social isolation, high-stress workplaces, history of abuse, or substance abuse.",
      genetic: "High family heritability; family history of mood or thought disorders increases individual vulnerability."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Changes in sleeping habits (insomnia or oversleeping)", "Withdrawal from social activities and friends", "Unusual irritability or sudden mood shifts", "Decreased performance at work or school"],
      common: symptoms.length > 0 ? symptoms : ["Depressed mood", "Anxiety", "Sleep disturbances", "Fatigue"],
      severe: ["Thoughts of self-harm or suicide", "Hallucinations or delusions (disconnect from reality)", "Inability to perform basic self-care", "Severe panic attacks causing functional paralysis"]
    }),
    risk_factors_detail: {
      age: "Can emerge at any age; many psychiatric disorders manifest in late adolescence or early adulthood.",
      lifestyle: "Chronic sleep deprivation, sedentary habits, poor diet, isolation, and use of alcohol or recreational drugs.",
      family_history: "First-degree relative with depression, bipolar disorder, schizophrenia, or anxiety disorders.",
      medical_conditions: "Chronic pain, terminal illness, neurological conditions, or hormone imbalances.",
      environmental: "Experiencing trauma, domestic violence, systemic discrimination, poverty, or severe loss."
    },
    complications: {
      untreated: "Severe functional impairment, social isolation, substance addiction, worsening physical health, or self-harm/suicide.",
      long_term: "Chronic social difficulties, unemployment, cardiovascular strain from chronic stress, and shortened life expectancy."
    },
    prevention_detail: {
      lifestyle: "Maintain stable sleep schedules, cultivate supportive friendships, and limit alcohol and stimulants.",
      hygiene: "Practice 'mental hygiene': set boundaries, take screen breaks, and engage in hobbies.",
      vaccination: "None available, but treating infections promptly protects neurological systems.",
      dietary: "Eat a nutrient-rich diet with complex carbohydrates and healthy fats (Omega-3s) to support brain health.",
      exercise: "Engage in regular aerobic exercise; physical activity releases endorphins and reduces stress hormones."
    },
    precautions_detail: {
      daily: "Follow medication schedules carefully; practice daily mindfulness or journal mood changes; maintain contact with support systems.",
      travel: "Bring adequate medications and copies of prescriptions; travel with a companion if prone to panic; plan relaxation periods.",
      community: "Participate in mental health stigma reduction and support community counseling services."
    },
    treatment_detail: {
      first_line: "Psychotherapy (e.g., Cognitive Behavioral Therapy - CBT) and lifestyle adjustments.",
      home_care: "Keep a structured routine, practice meditation, use sleep hygiene techniques, and avoid isolating yourself.",
      medical: "Psychiatric consultation, prescription antidepressants, mood stabilizers, or anti-anxiety medications."
    },
    when_to_consult: "Consult a therapist or psychiatrist if you experience persistent sadness, worry, or mood shifts lasting over 2 weeks that affect daily life.",
    emergency_warning_signs: "Seek emergency psychiatric care or call a crisis hotline immediately if you experience active thoughts of suicide, severe delusions, or extreme self-harm impulses.",
    diagnosis_methods: {
      physical_exam: "Evaluation to rule out physical causes of symptoms (such as thyroid disorders or vitamin deficiencies).",
      laboratory_tests: "Complete thyroid panel, Vitamin D and B12 levels, and toxic screening tests.",
      imaging_tests: "Brain scans (CT or MRI) are only used if a structural lesion or stroke is suspected of causing behavioral changes.",
      screening: "Standardized clinical questionnaires (e.g., PHQ-9 for depression, GAD-7 for anxiety) and diagnostic interviews."
    },
    recommended_diet: {
      eat: ["Whole grains (oatmeal, quinoa)", "Walnuts, flaxseeds, and chia seeds (Omega-3s)", "Eggs, lean poultry, and fish (tryptophan sources)", "Fermented foods (kefir, yogurt) for gut-brain support"],
      avoid: ["Refined sugars and sweets (cause energy crashes)", "Excessive caffeine (can trigger panic/anxiety)", "Alcohol (a central nervous system depressant)", "Highly processed fast food"]
    },
    lifestyle_recommendations: {
      exercise: "Perform 30 minutes of moderate aerobic exercise (brisk walk) daily to help regulate mood neurotransmitters.",
      sleep: "Set a regular bedtime; aim for 7.5 to 8 hours of sleep, as sleep is key for emotional processing.",
      stress_management: "Engage in progressive muscle relaxation, journaling, and deep breathing daily.",
      hydration: "Drink water; dehydration can affect concentration, fatigue levels, and mood regulation."
    },
    recovery_management: {
      expected_recovery: "Recovery is an active process; symptoms can improve significantly within 4-6 weeks of starting therapy or medication.",
      long_term_tips: "Build a relapse prevention plan with a therapist. Keep a list of emergency contacts handy."
    },
    faqs: (name) => [
      { question: `What is Cognitive Behavioral Therapy (CBT)?`, answer: "CBT is a common form of talk therapy that helps you identify and change negative or unhelpful thought and behavior patterns." },
      { question: `Do mental health medications change my personality?`, answer: "No, psychiatric medications are designed to balance brain chemistry and reduce distressing symptoms, not alter your core identity." },
      { question: `Is depression just feeling sad?`, answer: "No, sadness is temporary. Depression is a medical illness characterized by persistent low mood, loss of interest, fatigue, and other cognitive symptoms lasting weeks." },
      { question: `How does exercise help anxiety?`, answer: "Exercise releases endorphins, burns off stress hormones (adrenaline/cortisol), and redirects focus away from anxious thoughts." },
      { question: `How can I support a loved one with a mental health condition?`, answer: "Listen without judgment, offer practical support, encourage professional help, and avoid offering simplistic advice." }
    ],
    awareness_tips: [
      "Talk openly about mental health to reduce stigma and encourage others to seek help.",
      "Establish healthy boundaries at work and home to protect your mental well-being.",
      "Check in on your friends and family; a simple conversation can make a huge difference."
    ]
  },

  "Cancer": {
    overview: (name) => `${name} is a disease characterized by the uncontrolled growth and spread of abnormal cells. It typically affects the body when cells acquire genetic mutations that override normal cell cycle controls, leading to tumor formation, tissue invasion, and metastasis via blood or lymph systems. It compromises vital organ functions, causing fatigue, cachexia, and localized dysfunction.`,
    causes: (name) => ({
      primary: `DNA mutations in cells leading to unchecked proliferation, as seen in ${name}.`,
      secondary: "Inability of the immune system to recognize and destroy mutant cells.",
      environmental: "Exposure to carcinogens like tobacco smoke, radiation, asbestos, chemical toxins, or chronic infections (HPV, H. pylori).",
      genetic: "Inherited mutations (such as BRCA1/2, Lynch Syndrome) that impair DNA repair systems."
    }),
    symptoms_detail: (name, symptoms) => ({
      early: ["Unexplained weight loss (>10 lbs in a month)", "Persistent unusual fatigue or low energy", "New lump or tissue thickening", "Persistent dull ache or pain"],
      common: symptoms.length > 0 ? symptoms : ["Fatigue", "Unexplained weight loss", "Localized pain", "New lump"],
      severe: ["Severe localized pain unresponsive to medications", "Difficulty breathing or swallowing", "Uncontrolled bleeding from orifices", "Severe confusion or seizures due to organ involvement"]
    }),
    risk_factors_detail: {
      age: "The risk increases significantly with age; the majority of cancers are diagnosed in individuals aged 50 and older.",
      lifestyle: "Tobacco smoking, heavy alcohol consumption, poor diet low in fiber/vegetables, obesity, and lack of exercise.",
      family_history: "Multiple close relatives diagnosed with the same or related cancers, especially at an early age.",
      medical_conditions: "Chronic inflammatory conditions (like ulcerative colitis), chronic viral infections (Hepatitis B/C), or weakened immunity.",
      environmental: "Prolonged occupational exposure to industrial chemicals, solar UV radiation without protection, or high radon levels."
    },
    complications: {
      untreated: "Metastasis (spread to other organs), organ failure, severe wasting syndrome (cachexia), or death.",
      long_term: "Chronic fatigue, immune suppression, lymphedema, pain, or potential recurrence."
    },
    prevention_detail: {
      lifestyle: "Do not smoke; avoid secondhand smoke; limit alcohol; protect skin from UV exposure.",
      hygiene: "Practice food safety; protect against sexual transmission of oncogenic viruses (HPV, Hepatitis).",
      vaccination: "Receive the HPV vaccine to prevent cervical and throat cancers, and the Hepatitis B vaccine to protect the liver.",
      dietary: "Eat a plant-based diet high in fiber, antioxidant-rich fruits, cruciferous vegetables, and low in processed meats.",
      exercise: "Maintain regular physical activity (at least 30 minutes a day) to regulate hormones and reduce obesity risks."
    },
    precautions_detail: {
      daily: "Perform regular self-exams; protect sensitive skin from sun; avoid exposure to industrial carcinogens.",
      travel: "Ensure travel plans accommodate treatment schedules; bring complete medical records, summaries, and medication lists.",
      community: "Participate in public health cancer screening campaigns and advocate for carcinogen regulations."
    },
    treatment_detail: {
      first_line: "Surgical removal of localized tumors, chemotherapy, or radiation therapy.",
      home_care: "Manage treatment side effects (nausea, fatigue), maintain nutrition with calorie-dense soft foods, and use infection precautions.",
      medical: "Targeted therapy, immunotherapy (checkpoint inhibitors), hormonal therapy, or bone marrow transplantation."
    },
    when_to_consult: "Consult a healthcare provider for any lump that does not go away, unexplained weight loss, persistent cough, or changes in bowel habits.",
    emergency_warning_signs: "Seek emergency care for high fever while on chemotherapy (indicating neutropenic fever), sudden shortness of breath, severe uncontrolled bleeding, or seizures.",
    diagnosis_methods: {
      physical_exam: "Palpating for lumps, checking lymph nodes, examining skin for irregular lesions, and inspecting organs.",
      laboratory_tests: "Complete Blood Count (CBC), tumor markers (e.g., PSA, CA-125), liver and kidney function tests.",
      imaging_tests: "CT scans, MRI, PET scans, mammography, and ultrasound.",
      screening: "Biopsy (the definitive method of collecting a tissue sample for histological analysis) and colonoscopy."
    },
    recommended_diet: {
      eat: ["Cruciferous vegetables (broccoli, brussels sprouts)", "Berries, grapes, and citrus fruits", "Lean proteins (fish, chicken, beans) to maintain muscle mass", "Garlic, ginger, and turmeric (natural anti-inflammatory features)"],
      avoid: ["Processed meats (bacon, sausage, hot dogs)", "Refined sugars and sweetened drinks", "Charred or deep-fried foods", "Excessive red meat and saturated fats"]
    },
    lifestyle_recommendations: {
      exercise: "Participate in moderate walking or gentle yoga as tolerated to combat cancer-related fatigue.",
      sleep: "Prioritize 8-9 hours of sleep; sleep is critical for immune cell recovery and tissue rebuilding.",
      stress_management: "Engage in support groups, meditation, and counseling to address emotional anxiety.",
      hydration: "Drink 2 to 3 liters of fluids daily to flush out chemotherapy byproducts and prevent dehydration."
    },
    recovery_management: {
      expected_recovery: "Recovery is highly individualized; depends on staging, cancer type, and treatment type, ranging from months to ongoing management.",
      long_term_tips: "Attend all scheduled follow-up scans and checkups. Monitor for signs of recurrence or side effects."
    },
    faqs: (name) => [
      { question: `What is 'metastasis'?`, answer: "Metastasis is the process where cancer cells break away from the primary tumor and travel through the blood or lymph system to form new tumors in other organs." },
      { question: `How does chemotherapy work?`, answer: "Chemotherapy uses powerful drugs to target and kill rapidly dividing cells, which includes cancer cells but also some healthy cells like hair follicles." },
      { question: `Is cancer hereditary?`, answer: "Only about 5-10% of cancers are hereditary (linked to inherited gene mutations). The majority occur due to accumulated mutations from aging and lifestyle factors." },
      { question: `What is immunotherapy?`, answer: "Immunotherapy is a class of treatment that helps your body's immune system recognize and attack cancer cells." },
      { question: `What is the difference between benign and malignant tumors?`, answer: "Benign tumors are non-cancerous and do not spread to nearby tissues. Malignant tumors are cancerous, can invade adjacent tissues, and spread throughout the body." }
    ],
    awareness_tips: [
      "Get screened regularly: undergo colonoscopies, mammograms, and pap smears.",
      "Protect your skin: use SPF 30+ sunscreen and wear wide-brimmed hats.",
      "Avoid all tobacco products; smoking causes about 85% of all lung cancers."
    ]
  }
};

const MANUAL_DISEASE_CATEGORIES = {
  // Infectious Diseases
  "dengue fever": "Infectious Disease",
  "malaria": "Infectious Disease",
  "influenza (flu)": "Infectious Disease",
  "tuberculosis (tb)": "Infectious Disease",
  "cholera": "Infectious Disease",
  "covid-19": "Infectious Disease",
  "typhoid fever": "Infectious Disease",
  "chickenpox": "Infectious Disease",
  "measles": "Infectious Disease",
  "hepatitis a": "Infectious Disease",
  "hepatitis b": "Infectious Disease",
  "zika virus": "Infectious Disease",
  "lyme disease": "Infectious Disease",
  "rabies": "Infectious Disease",
  "tetanus": "Infectious Disease",
  
  // Respiratory Diseases
  "asthma": "Respiratory Disease",
  "copd": "Respiratory Disease",
  "acute bronchitis": "Respiratory Disease",
  "pneumonia": "Respiratory Disease",
  "pulmonary embolism": "Respiratory Disease",
  "sleep apnea": "Respiratory Disease",
  
  // Cardiovascular Diseases
  "hypertension": "Cardiovascular Disease",
  "coronary artery disease": "Cardiovascular Disease",
  "heart failure": "Cardiovascular Disease",
  "myocardial infarction (heart attack)": "Cardiovascular Disease",
  "ischemic stroke": "Cardiovascular Disease",
  
  // Endocrine Diseases
  "type 1 diabetes": "Endocrine Disease",
  "type 2 diabetes": "Endocrine Disease",
  "hyperthyroidism": "Endocrine Disease",
  "hypothyroidism": "Endocrine Disease",
  
  // Digestive Diseases
  "gerd (acid reflux)": "Digestive Disease",
  "celiac disease": "Digestive Disease",
  "irritable bowel syndrome (ibs)": "Digestive Disease",
  "peptic ulcer disease": "Digestive Disease",
  
  // Neurological Diseases
  "alzheimer's disease": "Neurological Disease",
  "parkinson's disease": "Neurological Disease",
  "epilepsy": "Neurological Disease",
  "migraine": "Neurological Disease",
  
  // Kidney Diseases
  "chronic kidney disease": "Kidney Disease",
  "kidney stones": "Kidney Disease",
  "urinary tract infection (uti)": "Kidney Disease",
  
  // Skin Diseases
  "eczema (atopic dermatitis)": "Skin Disease",
  "psoriasis": "Skin Disease",
  "acne vulgaris": "Skin Disease",
  
  // Bone & Joint Diseases
  "osteoarthritis": "Bone and Joint Disease",
  "rheumatoid arthritis": "Bone and Joint Disease",
  "osteoporosis": "Bone and Joint Disease",
  
  // Mental Health Disorders
  "major depressive disorder": "Mental Health Disorder",
  "generalized anxiety disorder": "Mental Health Disorder",
  "bipolar disorder": "Mental Health Disorder",
  
  // Cancer Types
  "lung cancer": "Cancer",
  "breast cancer": "Cancer",
  "colorectal cancer": "Cancer"
};

// Main generation loop
const enrichedDiseases = rawDiseases.map((d, index) => {
  const nameLower = d.name.toLowerCase().trim();
  let targetCategory = "Infectious Disease";

  if (MANUAL_DISEASE_CATEGORIES[nameLower]) {
    targetCategory = MANUAL_DISEASE_CATEGORIES[nameLower];
  } else if (d.category) {
    targetCategory = CATEGORY_MAPPING[d.category] || "Infectious Disease";
  }

  const template = CATEGORY_TEMPLATES[targetCategory];
  if (!template) {
    console.error(`No template found for category: ${targetCategory} (original name: ${d.name})`);
    return d; // fallback
  }

  // Pre-seed some specific high-fidelity overrides for key diseases to make them exceptionally premium
  let customFaqs = null;
  let customDiet = null;
  let customSymptoms = null;
  let customOverview = null;

  const lowercaseName = d.name.toLowerCase();

  if (lowercaseName.includes("dengue")) {
    customOverview = "Dengue fever is a severe, flu-like illness that affects infants, young children, and adults. The virus is transmitted to humans through the bites of infected female Aedes mosquitoes, primarily Aedes aegypti. Once infected, the virus circulates in the blood for 2-7 days, during which the patient may develop high fevers, painful muscle spasms, and severe headaches.";
    customDiet = {
      eat: [
        "Papaya leaf extract (may help support platelet levels)",
        "Fresh coconut water and fruit juices for electrolyte balance",
        "Soft, easily digestible foods like porridge, soup, and boiled rice",
        "Protein-rich foods like chicken broth or boiled eggs"
      ],
      avoid: [
        "Salicylate-rich foods and medications (Aspirin, Ibuprofen, Naproxen) as they increase bleeding risk",
        "Spicy, greasy, or acidic foods that can irritate the stomach",
        "Dark-colored foods (can be confused with internal bleeding in vomit or stool)",
        "Caffeinated beverages (worsen dehydration)"
      ]
    };
    customSymptoms = {
      early: [
        "Sudden high fever (up to 104°F or 40°C)",
        "Severe headache",
        "Pain behind the eyes (retro-orbital pain)"
      ],
      common: [
        "Severe joint and muscle pain ('breakbone fever')",
        "Fatigue",
        "Nausea and vomiting",
        "Skin rash appearing 3-4 days after fever onset",
        "Mild bleeding (nose or gum bleed)"
      ],
      severe: [
        "Severe abdominal pain",
        "Persistent vomiting",
        "Rapid breathing",
        "Bleeding gums or blood in vomit",
        "Fluid accumulation in lungs or abdomen",
        "Severe fatigue or restlessness"
      ]
    };
    customFaqs = [
      { question: "Can I get Dengue fever more than once?", answer: "Yes. There are four serotypes of the dengue virus. An infection with one serotype provides lifelong immunity to that specific serotype, but only temporary, partial immunity to the others. Subsequent infections with different serotypes increase the risk of severe dengue." },
      { question: "Is Dengue fever contagious from person to person?", answer: "No, Dengue is not directly contagious. It cannot spread from person to person through casual contact, coughing, or sneezing. It is transmitted solely through the bite of infected Aedes mosquitoes." },
      { question: "Why should I avoid Aspirin or Ibuprofen if I suspect Dengue?", answer: "Aspirin, Ibuprofen (Advil, Motrin), and Naproxen (Aleve) are blood thinners and can exacerbate the bleeding tendencies associated with Dengue fever. Acetaminophen (Paracetamol) is the recommended medication for managing pain and fever." },
      { question: "How long does it take for Dengue symptoms to appear after a mosquito bite?", answer: "The incubation period typically ranges from 4 to 10 days after being bitten by an infected mosquito." },
      { question: "What is the primary difference between normal Dengue and Severe Dengue?", answer: "Severe Dengue (often called Dengue Hemorrhagic Fever) involves critical plasma leakage leading to fluid accumulation, respiratory distress, severe bleeding, or organ impairment. It typically develops when the fever starts to subside." }
    ];
  } else if (lowercaseName.includes("diabetes") && lowercaseName.includes("type 2")) {
    customOverview = "Type 2 diabetes is a chronic, metabolic disease characterized by elevated levels of blood glucose (or blood sugar), which leads over time to serious damage to the heart, blood vessels, eyes, kidneys, and nerves. It occurs when the body becomes resistant to insulin or when the pancreas is unable to produce enough insulin to maintain normal glucose levels.";
    customDiet = {
      eat: [
        "Non-starchy vegetables (spinach, broccoli, cauliflower)",
        "High-fiber legumes, lentils, and beans",
        "Lean proteins (chicken breast, fish, tofu)",
        "Healthy fats (avocados, olive oil, almonds)"
      ],
      avoid: [
        "Sugary beverages (sodas, sweet teas, fruit juices)",
        "Refined carbohydrates (white bread, white rice, pastries)",
        "Trans fats and highly processed snacks",
        "Excessive dried fruits and high-sugar tropical fruits"
      ]
    };
    customSymptoms = {
      early: [
        "Increased frequency of urination (polyuria)",
        "Persistent dry mouth and increased thirst (polydipsia)",
        "Unexplained fatigue or low energy levels"
      ],
      common: [
        "Increased hunger (polyphagia) even after eating",
        "Blurred vision",
        "Slow-healing cuts or sores",
        "Frequent infections (gum, skin, or vaginal)"
      ],
      severe: [
        "Extremely high blood sugar (>300 mg/dL)",
        "Confusion, dizziness, or loss of coordination",
        "Numbness or severe burning pain in hands or feet (advanced neuropathy)",
        "Shortness of breath with a fruity breath odor (diabetic ketoacidosis)"
      ]
    };
    customFaqs = [
      { question: "Can Type 2 diabetes be reversed?", answer: "While there is no permanent cure, Type 2 diabetes can be put into clinical remission. This is achieved through significant lifestyle changes, weight loss, healthy eating, and exercise, allowing blood sugar to normalize without medication." },
      { question: "What is the HbA1c test?", answer: "The HbA1c test measures your average blood sugar level over the past 2 to 3 months. It reports the percentage of hemoglobin coated with sugar. A level of 6.5% or higher indicates diabetes." },
      { question: "How does insulin resistance work?", answer: "Insulin acts as a key to let blood sugar into your cells. In insulin resistance, the cell doors are locked and do not respond to the key, causing sugar to build up in the bloodstream while cells starve for energy." },
      { question: "Why is foot care so important for diabetics?", answer: "Diabetes causes nerve damage (reducing pain sensation) and poor circulation in the feet. A minor cut or blister can go unnoticed and escalate into a severe, slow-healing ulcer or infection, risking amputation." },
      { question: "Do I have to take insulin if I have Type 2 diabetes?", answer: "Not necessarily. Many people manage Type 2 diabetes with lifestyle changes and oral medications (like Metformin). However, if the pancreas gradually loses its capacity to produce insulin over time, insulin injections may become necessary." }
    ];
  } else if (lowercaseName.includes("malaria")) {
    customOverview = "Malaria is a life-threatening disease caused by Plasmodium parasites, which are transmitted to people through the bites of infected female Anopheles mosquitoes. Once inside the human body, the parasites travel to the liver, where they mature, reproduce, and subsequently infect and destroy red blood cells, causing cyclical fevers, chills, and anemia.";
    customDiet = {
      eat: [
        "Electrolyte-balanced drinks and coconut water to prevent dehydration",
        "Easily digestible carbohydrate-rich foods like rice, porridge, and bread",
        "Lean proteins (chicken soup, soft eggs) to aid muscle recovery",
        "Vitamins C and B complex supplements or fresh fruits"
      ],
      avoid: [
        "High-fat, greasy foods that can trigger nausea or liver irritation",
        "High-fiber foods that are difficult to digest during acute diarrhea",
        "Caffeinated beverages (which can worsen dehydration)",
        "Raw or unpasteurized products that risk secondary stomach infections"
      ]
    };
    customSymptoms = {
      early: [
        "Mild shivering and headaches",
        "Muscle aches and joint pains",
        "Generalized fatigue and lack of energy"
      ],
      common: [
        "High fever with cycling cold shakes (chills) and profuse sweating",
        "Nausea, vomiting, and loss of appetite",
        "Mild jaundice (yellowing of eyes/skin)",
        "Enlarged spleen or abdominal discomfort"
      ],
      severe: [
        "Severe confusion, seizures, or coma (Cerebral Malaria)",
        "Severe breathing distress or respiratory failure",
        "Severe anemia or red-colored urine (blackwater fever)",
        "Kidney or liver failure"
      ]
    };
    customFaqs = [
      { question: "Is there a vaccine for malaria?", answer: "Yes. The WHO recommends the use of the RTS,S/AS01 (Mosquirix) and R21/Matrix-M malaria vaccines for children living in regions with moderate to high transmission of Plasmodium falciparum malaria." },
      { question: "How long is the incubation period for malaria?", answer: "In most cases, symptoms appear 10 to 15 days after the infective mosquito bite. However, some Plasmodium strains can remain dormant in the liver for months before triggering symptoms." },
      { question: "Can malaria be passed directly from one person to another?", answer: "No. Malaria is not contagious like a cold or flu and cannot be transmitted through casual contact. It is spread through mosquito vectors, blood transfusions, organ transplants, or sharing infected needles." },
      { question: "What are antimalarials?", answer: "Antimalarials are medications used to prevent or treat malaria. Treatment selection depends on the Plasmodium species, region of contraction (due to drug resistance), and severity of symptoms." },
      { question: "Why do malaria symptoms come in cycles?", answer: "The cycles of chills and fever correspond to the synchronous rupture of infected red blood cells by the Plasmodium parasites, releasing a new wave of parasites and toxins into the bloodstream." }
    ];
  }

  // Construct causes object
  const causesObj = template.causes(d.name);
  // Construct symptoms_detail object
  const symptomsDetailObj = customSymptoms || template.symptoms_detail(d.name, d.symptoms || []);
  // Construct risk factors detail object
  const riskFactorsDetailObj = template.risk_factors_detail;
  // Construct complications
  const complicationsObj = template.complications;
  // Construct prevention detail
  const preventionDetailObj = template.prevention_detail;
  // Construct precautions detail
  const precautionsDetailObj = template.precautions_detail;
  // Construct treatment detail
  const treatmentDetailObj = template.treatment_detail;
  // Construct diagnosis methods
  const diagnosisMethodsObj = template.diagnosis_methods;
  // Diet
  const dietObj = customDiet || template.recommended_diet;
  // FAQs
  const faqsArr = customFaqs || template.faqs(d.name);

  // Fallback similar/related diseases based on category
  const relatedDiseases = rawDiseases
    .filter(item => item.name !== d.name && (CATEGORY_MAPPING[item.category] || "Infectious Disease") === targetCategory)
    .slice(0, 3)
    .map(item => item.name);

  // Fallback awareness tips
  const awarenessTips = template.awareness_tips;

  // Build the complete 21-point disease profile object
  const enriched = {
    // 1. Disease Name
    name: d.name,
    // 2. Disease Category
    category: targetCategory,
    // 3. Short Description
    short_description: d.description || `A medical condition under the category of ${targetCategory}.`,
    // 4. Overview
    overview: customOverview || template.overview(d.name),
    // 5. Causes (Primary, Secondary, Environmental, Genetic)
    causes_detail: causesObj,
    // 6. Symptoms (Early, Common, Severe)
    symptoms_detail: symptomsDetailObj,
    // 7. Risk Factors (Age, Lifestyle, Family, Medical, Environmental)
    risk_factors_detail: riskFactorsDetailObj,
    // 8. Complications (Untreated, Long-term)
    complications: complicationsObj,
    // 9. Prevention Methods (Lifestyle, Hygiene, Vaccination, Dietary, Exercise)
    prevention_detail: preventionDetailObj,
    // 10. Precautions (Daily, Travel, Community)
    precautions_detail: precautionsDetailObj,
    // 11. Basic Treatment (First-line, Home care, Medical)
    treatment_detail: treatmentDetailObj,
    // 12. When to Consult a Doctor
    when_to_consult: template.when_to_consult,
    // 13. Emergency Warning Signs
    emergency_warning_signs: template.emergency_warning_signs,
    // 14. Diagnosis Methods (Physical, Laboratory, Imaging, Screening)
    diagnosis_methods: diagnosisMethodsObj,
    // 15. Recommended Diet (Eat, Avoid)
    recommended_diet: dietObj,
    // 16. Lifestyle Recommendations (Exercise, Sleep, Stress, Hydration)
    lifestyle_recommendations: template.lifestyle_recommendations,
    // 17. Recovery and Management (Expected process, Long-term tips)
    recovery_management: template.recovery_management,
    // 18. Frequently Asked Questions (FAQ) - 5 items
    faqs: faqsArr,
    // 19. Related Diseases
    related_diseases: relatedDiseases.length > 0 ? relatedDiseases : ["Other conditions in this category"],
    // 20. Awareness Tips
    awareness_tips: awarenessTips,
    // 21. Educational Disclaimer
    disclaimer: "This information is provided for educational and disease awareness purposes only. It should not be considered medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.",

    // BACKWARD COMPATIBILITY FIELDS
    id: d.id || d.name.replace(/\s+/g, '-').toLowerCase() + '-' + index,
    description: d.description || `A medical condition under the category of ${targetCategory}.`,
    symptoms: d.symptoms || symptomsDetailObj.common,
    causes: d.causes || [causesObj.primary],
    risk_factors: d.risk_factors || [riskFactorsDetailObj.lifestyle, riskFactorsDetailObj.family_history],
    precautions: d.precautions || [precautionsDetailObj.daily],
    prevention: d.prevention || [preventionDetailObj.hygiene, preventionDetailObj.lifestyle],
    basic_treatment: d.basic_treatment || [treatmentDetailObj.first_line, treatmentDetailObj.home_care],
    emergency_level: d.emergency_level || "Medium"
  };

  return enriched;
});

// Write output
try {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(enrichedDiseases, null, 2), 'utf-8');
  console.log(`Successfully generated and saved ${enrichedDiseases.length} enriched disease profiles in ${OUTPUT_PATH}`);
} catch (err) {
  console.error("Error writing output file", err);
  process.exit(1);
}
