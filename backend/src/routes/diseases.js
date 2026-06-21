const express = require('express');
const router = express.Router();
const { readTable, writeTable } = require('../services/db');

// Get all diseases with filters
router.get('/', (req, res) => {
  let diseases = readTable('diseases');
  const { category, search } = req.query;

  if (category && category !== 'All') {
    diseases = diseases.filter(d => d.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    diseases = diseases.filter(d => {
      const nameMatch = d.name && d.name.toLowerCase().includes(q);
      const catMatch = d.category && d.category.toLowerCase().includes(q);
      const descMatch = (d.description && d.description.toLowerCase().includes(q)) || 
                        (d.short_description && d.short_description.toLowerCase().includes(q)) ||
                        (d.overview && d.overview.toLowerCase().includes(q));
      
      const symptomsMatch = d.symptoms && d.symptoms.some(s => s.toLowerCase().includes(q));
      
      const rfArrayMatch = d.risk_factors && d.risk_factors.some(r => r.toLowerCase().includes(q));
      const rfDetailMatch = d.risk_factors_detail && Object.values(d.risk_factors_detail).some(val => 
        val && val.toLowerCase().includes(q)
      );
      
      return nameMatch || catMatch || descMatch || symptomsMatch || rfArrayMatch || rfDetailMatch;
    });
  }

  res.json(diseases);
});

// Get categories
router.get('/categories', (req, res) => {
  const diseases = readTable('diseases');
  const categories = [...new Set(diseases.map(d => d.category))];
  res.json(categories);
});

// Match symptoms
router.post('/match-symptoms', (req, res) => {
  const { symptoms } = req.body; // Array of symptoms selected, e.g. ["Fever", "Cough"]
  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({ error: "Symptoms array is required" });
  }

  const diseases = readTable('diseases');
  const matches = [];

  const normalizedSelected = symptoms.map(s => s.toLowerCase().trim());

  diseases.forEach(disease => {
    let matchCount = 0;
    const diseaseSymptoms = disease.symptoms.map(s => s.toLowerCase());

    normalizedSelected.forEach(sel => {
      // Check if the selected symptom matches any of the disease's symptoms (substring match)
      const isMatched = diseaseSymptoms.some(ds => ds.includes(sel) || sel.includes(ds));
      if (isMatched) {
        matchCount++;
      }
    });

    if (matchCount > 0) {
      // Calculate confidence based on matched vs total symptoms of the disease
      const totalDiseaseSymptoms = disease.symptoms.length;
      // We calculate a weight
      const weight = (matchCount / totalDiseaseSymptoms) * 0.6 + (matchCount / symptoms.length) * 0.4;
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

  // Sort by confidence descending, then matchedCount descending
  matches.sort((a, b) => b.confidence - a.confidence || b.matchedCount - a.matchedCount);

  res.json({
    symptomsChecked: symptoms,
    resultsCount: matches.length,
    matches: matches.slice(0, 10) // Top 10 matches
  });
});

// Get single disease
router.get('/:nameOrId', (req, res) => {
  const diseases = readTable('diseases');
  const param = req.params.nameOrId.toLowerCase();

  const disease = diseases.find(d => 
    (d.id && d.id.toLowerCase() === param) || 
    d.name.toLowerCase() === param || 
    d.name.toLowerCase().replace(/\s+/g, '-') === param
  );

  if (!disease) {
    return res.status(404).json({ error: "Disease not found" });
  }

  res.json(disease);
});

// Admin CRUD - Create disease
router.post('/', (req, res) => {
  const { name, category, description, symptoms, causes, risk_factors, precautions, prevention, basic_treatment, emergency_level } = req.body;
  if (!name || !category || !description) {
    return res.status(400).json({ error: "Name, category, and description are required" });
  }

  const diseases = readTable('diseases');
  const id = name.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();
  
  const newDisease = {
    id,
    name,
    category,
    description,
    symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
    causes: Array.isArray(causes) ? causes : [causes],
    risk_factors: Array.isArray(risk_factors) ? risk_factors : [risk_factors],
    precautions: Array.isArray(precautions) ? precautions : [precautions],
    prevention: Array.isArray(prevention) ? prevention : [prevention],
    basic_treatment: Array.isArray(basic_treatment) ? basic_treatment : [basic_treatment],
    emergency_level: emergency_level || "Medium"
  };

  diseases.push(newDisease);
  writeTable('diseases', diseases);
  res.status(201).json(newDisease);
});

// Admin CRUD - Update disease
router.put('/:id', (req, res) => {
  const diseases = readTable('diseases');
  const id = req.params.id;
  const index = diseases.findIndex(d => d.id === id || d.name.replace(/\s+/g, '-').toLowerCase() === id.toLowerCase());

  if (index === -1) {
    return res.status(404).json({ error: "Disease not found" });
  }

  const updated = {
    ...diseases[index],
    ...req.body
  };

  diseases[index] = updated;
  writeTable('diseases', diseases);
  res.json(updated);
});

// Admin CRUD - Delete disease
router.delete('/:id', (req, res) => {
  const diseases = readTable('diseases');
  const id = req.params.id;
  const filtered = diseases.filter(d => d.id !== id && d.name.replace(/\s+/g, '-').toLowerCase() !== id.toLowerCase());

  if (diseases.length === filtered.length) {
    return res.status(404).json({ error: "Disease not found" });
  }

  writeTable('diseases', filtered);
  res.json({ message: "Disease deleted successfully" });
});

module.exports = router;
