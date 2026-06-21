const express = require('express');
const router = express.Router();
const { readTable, writeTable } = require('../services/db');
const { authenticateToken } = require('./auth');

// Get all health tips
router.get('/tips', (req, res) => {
  const tips = readTable('healthTips');
  const { category } = req.query;

  let filtered = tips;
  if (category && category !== 'All') {
    filtered = tips.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  res.json(filtered);
});

// Like a health tip
router.post('/tips/:id/like', (req, res) => {
  const tips = readTable('healthTips');
  const index = tips.findIndex(t => t.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Tip not found' });

  tips[index].likes = (tips[index].likes || 0) + 1;
  writeTable('healthTips', tips);

  res.json({ likes: tips[index].likes });
});

// Share a health tip
router.post('/tips/:id/share', (req, res) => {
  const tips = readTable('healthTips');
  const index = tips.findIndex(t => t.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Tip not found' });

  tips[index].shares = (tips[index].shares || 0) + 1;
  writeTable('healthTips', tips);

  res.json({ shares: tips[index].shares });
});

// Get all articles
router.get('/articles', (req, res) => {
  const articles = readTable('articles');
  const { category } = req.query;

  let filtered = articles;
  if (category && category !== 'All') {
    filtered = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  res.json(filtered);
});

// Like an article
router.post('/articles/:id/like', (req, res) => {
  const articles = readTable('articles');
  const index = articles.findIndex(a => a.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Article not found' });

  articles[index].likes = (articles[index].likes || 0) + 1;
  writeTable('articles', articles);

  res.json({ likes: articles[index].likes });
});

// Share an article
router.post('/articles/:id/share', (req, res) => {
  const articles = readTable('articles');
  const index = articles.findIndex(a => a.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Article not found' });

  articles[index].shares = (articles[index].shares || 0) + 1;
  writeTable('articles', articles);

  res.json({ shares: articles[index].shares });
});

// Get active campaigns
router.get('/campaigns', (req, res) => {
  const campaigns = readTable('campaigns');
  res.json(campaigns);
});

// Submit user feedback
router.post('/feedback', authenticateToken, (req, res) => {
  const { rating, comment } = req.body;
  if (!rating) return res.status(400).json({ error: 'Rating is required' });

  const feedbacks = readTable('feedback');
  const newFeedback = {
    id: 'fdb-' + Date.now(),
    userId: req.user.id,
    userEmail: req.user.email,
    rating: parseInt(rating),
    comment: comment || '',
    created_at: new Date().toISOString()
  };

  feedbacks.push(newFeedback);
  writeTable('feedback', feedbacks);

  res.status(201).json(newFeedback);
});

// Admin management for tips, articles, campaigns
router.post('/tips', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { title, content, category } = req.body;
  
  const tips = readTable('healthTips');
  const newTip = {
    id: 'tip-' + Date.now(),
    title,
    content,
    category,
    likes: 0,
    bookmarks_count: 0,
    shares: 0,
    created_at: new Date().toISOString()
  };

  tips.push(newTip);
  writeTable('healthTips', tips);
  res.status(201).json(newTip);
});

router.post('/articles', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { title, content, category, readTime, imageUrl } = req.body;

  const articles = readTable('articles');
  const newArticle = {
    id: 'art-' + Date.now(),
    title,
    content,
    category,
    read_time: readTime || '5 min read',
    image_url: imageUrl || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
    likes: 0,
    bookmarks_count: 0,
    shares: 0,
    created_at: new Date().toISOString()
  };

  articles.push(newArticle);
  writeTable('articles', articles);
  res.status(201).json(newArticle);
});

router.post('/campaigns', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { title, description, targetDisease, startDate, status } = req.body;

  const campaigns = readTable('campaigns');
  const newCamp = {
    id: 'camp-' + Date.now(),
    title,
    description,
    target_disease: targetDisease,
    start_date: startDate || new Date().toISOString().split('T')[0],
    status: status || 'Active'
  };

  campaigns.push(newCamp);
  writeTable('campaigns', campaigns);
  res.status(201).json(newCamp);
});

module.exports = router;
