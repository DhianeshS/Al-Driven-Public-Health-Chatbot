require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const { readTable, writeTable } = require('./services/db');
const authModule = require('./routes/auth');
const diseasesRouter = require('./routes/diseases');
const chatRouter = require('./routes/chat');
const contentRouter = require('./routes/content');
const adminRouter = require('./routes/admin');
const complaintsRouter = require('./routes/complaints');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow frontend to access
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Routes
app.use('/api/auth', authModule.router);
app.use('/api/diseases', diseasesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/content', contentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/complaints', complaintsRouter);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Seed default users if empty
function seedDefaultUsers() {
  try {
    const users = readTable('users');
    if (users.length === 0) {
      console.log('Seeding default users...');
      
      // Admin user
      const adminPasswordHash = bcrypt.hashSync('adminpassword', 10);
      const adminUser = {
        id: 'usr-admin-1',
        email: 'admin@healthbot.org',
        password: adminPasswordHash,
        fullName: 'Dr. Sarah Jenkins (Admin)',
        role: 'admin',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
        preferredLang: 'en',
        created_at: new Date().toISOString()
      };

      // General user
      const userPasswordHash = bcrypt.hashSync('userpassword', 10);
      const generalUser = {
        id: 'usr-patient-1',
        email: 'user@healthbot.org',
        password: userPasswordHash,
        fullName: 'John Doe',
        role: 'user',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
        preferredLang: 'en',
        created_at: new Date().toISOString()
      };

      users.push(adminUser, generalUser);
      writeTable('users', users);
      console.log('Successfully seeded default users!');
    }
  } catch (err) {
    console.error('Error seeding default users:', err);
  }
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedDefaultUsers();
});
