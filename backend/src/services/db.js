const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const TABLES = {
  diseases: path.join(DATA_DIR, 'diseases_data.json'),
  healthTips: path.join(DATA_DIR, 'health_tips.json'),
  articles: path.join(DATA_DIR, 'articles.json'),
  campaigns: path.join(DATA_DIR, 'campaigns.json'),
  users: path.join(DATA_DIR, 'users.json'),
  conversations: path.join(DATA_DIR, 'conversations.json'),
  messages: path.join(DATA_DIR, 'messages.json'),
  feedback: path.join(DATA_DIR, 'feedback.json'),
  bookmarks: path.join(DATA_DIR, 'bookmarks.json'),
  notifications: path.join(DATA_DIR, 'notifications.json')
};

// Initialize dynamic tables if they don't exist
Object.entries(TABLES).forEach(([key, filepath]) => {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify([], null, 2), 'utf-8');
  }
});

function readTable(tableName) {
  const filepath = TABLES[tableName];
  if (!filepath) throw new Error(`Unknown table: ${tableName}`);
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading table ${tableName}:`, err);
    return [];
  }
}

function writeTable(tableName, data) {
  const filepath = TABLES[tableName];
  if (!filepath) throw new Error(`Unknown table: ${tableName}`);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing table ${tableName}:`, err);
    return false;
  }
}

module.exports = {
  readTable,
  writeTable
};
