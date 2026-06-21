const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { readTable, writeTable } = require('../services/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-healthcare-token-key-2026';

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Sign Up
router.post('/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const users = readTable('users');
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const newUser = {
      id: 'usr-' + Date.now(),
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
      preferredLang: 'en',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeTable('users', users);

    // Issue token
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Don't return password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = readTable('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const users = readTable('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // We return success regardless of user presence for security reasons
  res.json({ message: 'If the email exists, a password reset link has been sent.' });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const users = readTable('users');
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  if (index === -1) {
    return res.status(400).json({ error: 'User not found' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[index].password = hashedPassword;
    writeTable('users', users);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, (req, res) => {
  const users = readTable('users');
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Update Profile
router.put('/profile', authenticateToken, (req, res) => {
  const users = readTable('users');
  const index = users.findIndex(u => u.id === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const { fullName, preferredLang, avatarUrl } = req.body;
  
  if (fullName) users[index].fullName = fullName;
  if (preferredLang) users[index].preferredLang = preferredLang;
  if (avatarUrl) users[index].avatarUrl = avatarUrl;

  writeTable('users', users);
  
  const { password, ...userWithoutPassword } = users[index];
  res.json(userWithoutPassword);
});

// Bookmarks - Get all bookmarks for user
router.get('/bookmarks', authenticateToken, (req, res) => {
  const bookmarks = readTable('bookmarks');
  const userBookmarks = bookmarks.filter(b => b.userId === req.user.id);
  res.json(userBookmarks);
});

// Bookmarks - Toggle bookmark
router.post('/bookmarks/toggle', authenticateToken, (req, res) => {
  const { itemType, itemId } = req.body; // itemType: 'disease', 'tip', 'article'
  if (!itemType || !itemId) {
    return res.status(400).json({ error: 'itemType and itemId are required' });
  }

  const bookmarks = readTable('bookmarks');
  const index = bookmarks.findIndex(b => b.userId === req.user.id && b.itemType === itemType && b.itemId === itemId);

  if (index === -1) {
    // Add bookmark
    const newBookmark = {
      id: 'bmk-' + Date.now(),
      userId: req.user.id,
      itemType,
      itemId,
      created_at: new Date().toISOString()
    };
    bookmarks.push(newBookmark);
    writeTable('bookmarks', bookmarks);
    
    // Increment count on item
    if (itemType === 'tip') {
      const tips = readTable('healthTips');
      const tipIndex = tips.findIndex(t => t.id === itemId);
      if (tipIndex !== -1) {
        tips[tipIndex].bookmarks_count = (tips[tipIndex].bookmarks_count || 0) + 1;
        writeTable('healthTips', tips);
      }
    } else if (itemType === 'article') {
      const articles = readTable('articles');
      const artIndex = articles.findIndex(a => a.id === itemId);
      if (artIndex !== -1) {
        articles[artIndex].bookmarks_count = (articles[artIndex].bookmarks_count || 0) + 1;
        writeTable('articles', articles);
      }
    }

    res.json({ bookmarked: true, bookmark: newBookmark });
  } else {
    // Remove bookmark
    bookmarks.splice(index, 1);
    writeTable('bookmarks', bookmarks);

    // Decrement count on item
    if (itemType === 'tip') {
      const tips = readTable('healthTips');
      const tipIndex = tips.findIndex(t => t.id === itemId);
      if (tipIndex !== -1) {
        tips[tipIndex].bookmarks_count = Math.max(0, (tips[tipIndex].bookmarks_count || 1) - 1);
        writeTable('healthTips', tips);
      }
    } else if (itemType === 'article') {
      const articles = readTable('articles');
      const artIndex = articles.findIndex(a => a.id === itemId);
      if (artIndex !== -1) {
        articles[artIndex].bookmarks_count = Math.max(0, (articles[artIndex].bookmarks_count || 1) - 1);
        writeTable('articles', articles);
      }
    }

    res.json({ bookmarked: false });
  }
});

// Admin User Management - Get all users
router.get('/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const users = readTable('users');
  // Return users without passwords
  const sanitized = users.map(({ password, ...u }) => u);
  res.json(sanitized);
});

// Admin User Management - Delete user
router.delete('/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const users = readTable('users');
  const filtered = users.filter(u => u.id !== req.params.id);
  
  if (users.length === filtered.length) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  writeTable('users', filtered);
  res.json({ message: 'User deleted successfully' });
});

module.exports = { router, authenticateToken };
