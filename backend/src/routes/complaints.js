const express = require('express');
const router = express.Router();
const { readTable, writeTable } = require('../services/db');
const { authenticateToken } = require('./auth');

// Get all complaints (Admin needs role check, users see their own)
router.get('/', authenticateToken, (req, res) => {
  const complaints = readTable('complaints');
  
  if (req.user.role === 'admin') {
    res.json(complaints);
  } else {
    const userComplaints = complaints.filter(c => c.userId === req.user.id);
    res.json(userComplaints);
  }
});

// Submit a new complaint
router.post('/', authenticateToken, (req, res) => {
  const { title, description, category, location, contact } = req.body;
  if (!description || !category || !location) {
    return res.status(400).json({ error: 'Description, category, and location are required' });
  }

  const complaints = readTable('complaints');
  const ticketId = 'COMP-' + Math.floor(1000 + Math.random() * 9000) + '-' + new Date().getFullYear();

  const newComplaint = {
    id: 'cmp-' + Date.now(),
    ticketId,
    userId: req.user.id,
    userEmail: req.user.email,
    title: title || `Complaint regarding ${category}`,
    description,
    category,
    location,
    contact: contact || req.user.email,
    status: 'Pending', // Pending, Investigating, Resolved
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  complaints.push(newComplaint);
  writeTable('complaints', complaints);

  res.status(201).json(newComplaint);
});

// Update complaint status (Admin only)
router.put('/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const complaints = readTable('complaints');
  const index = complaints.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  complaints[index].status = status;
  complaints[index].updatedAt = new Date().toISOString();

  writeTable('complaints', complaints);
  res.json(complaints[index]);
});

module.exports = router;
