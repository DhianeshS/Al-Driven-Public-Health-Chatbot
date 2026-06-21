const express = require('express');
const router = express.Router();
const { readTable, writeTable } = require('../services/db');
const { streamResponse, generateTitle } = require('../services/ai');
const { authenticateToken } = require('./auth');

// Get all conversations for user
router.get('/conversations', authenticateToken, (req, res) => {
  const conversations = readTable('conversations');
  const userConversations = conversations.filter(c => c.userId === req.user.id);
  
  // Sort by updated_at descending
  userConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  res.json(userConversations);
});

// Create a new conversation
router.post('/conversations', authenticateToken, (req, res) => {
  const { title } = req.body;
  const conversations = readTable('conversations');
  
  const newConv = {
    id: 'conv-' + Date.now(),
    userId: req.user.id,
    title: title || 'New Conversation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  conversations.push(newConv);
  writeTable('conversations', conversations);
  
  res.status(201).json(newConv);
});

// Rename conversation
router.put('/conversations/:id', authenticateToken, (req, res) => {
  const conversations = readTable('conversations');
  const index = conversations.findIndex(c => c.id === req.params.id && c.userId === req.user.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  conversations[index].title = title;
  conversations[index].updatedAt = new Date().toISOString();

  writeTable('conversations', conversations);
  res.json(conversations[index]);
});

// Delete conversation
router.delete('/conversations/:id', authenticateToken, (req, res) => {
  const conversations = readTable('conversations');
  const filteredConvs = conversations.filter(c => !(c.id === req.params.id && c.userId === req.user.id));

  if (conversations.length === filteredConvs.length) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  writeTable('conversations', filteredConvs);

  // Also delete messages for this conversation
  const messages = readTable('messages');
  const filteredMsgs = messages.filter(m => m.conversationId !== req.params.id);
  writeTable('messages', filteredMsgs);

  res.json({ message: 'Conversation deleted successfully' });
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authenticateToken, (req, res) => {
  // Verify conversation belongs to user
  const conversations = readTable('conversations');
  const conv = conversations.find(c => c.id === req.params.id && c.userId === req.user.id);
  
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found or access denied' });
  }

  const messages = readTable('messages');
  const convMessages = messages.filter(m => m.conversationId === req.params.id);
  
  // Sort by timestamp
  convMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  res.json(convMessages);
});

// POST a message & Stream the AI response (SSE Streaming)
router.get('/conversations/:id/stream', authenticateToken, (req, res) => {
  const conversationId = req.params.id;
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt query parameter is required' });
  }

  // Verify conversation
  const conversations = readTable('conversations');
  const convIndex = conversations.findIndex(c => c.id === conversationId && c.userId === req.user.id);
  if (convIndex === -1) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Establish connection

  // Save the user's message
  const messages = readTable('messages');
  const userMessage = {
    id: 'msg-' + Date.now(),
    conversationId,
    sender: 'user',
    content: prompt,
    createdAt: new Date().toISOString()
  };
  messages.push(userMessage);

  // If conversation is named "New Conversation", auto-generate a title based on the first message
  if (conversations[convIndex].title === 'New Conversation') {
    conversations[convIndex].title = generateTitle(prompt);
    writeTable('conversations', conversations);
    
    // Send event indicating the title has changed
    res.write(`event: title\ndata: ${JSON.stringify({ title: conversations[convIndex].title })}\n\n`);
  }

  // Get chat history for memory context
  const chatHistory = messages
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-10); // Last 10 messages for context

  // Trigger streaming
  streamResponse(
    prompt,
    chatHistory,
    (chunk) => {
      // On chunk, write to stream
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    },
    (result) => {
      // Save AI message to DB
      const aiMessage = {
        id: 'msg-' + (Date.now() + 1),
        conversationId,
        sender: 'ai',
        content: result.fullText,
        diseaseMatchedId: result.diseaseId,
        followUps: result.followUps,
        createdAt: new Date().toISOString()
      };
      
      messages.push(aiMessage);
      writeTable('messages', messages);

      // Update conversation timestamp
      conversations[convIndex].updatedAt = new Date().toISOString();
      writeTable('conversations', conversations);

      // Send final completion message and close
      res.write(`event: done\ndata: ${JSON.stringify({ 
        messageId: aiMessage.id,
        followUps: result.followUps,
        diseaseMatchedId: result.diseaseId
      })}\n\n`);
      res.end();
    }
  );

  // Clean up if connection closed abruptly
  req.on('close', () => {
    res.end();
  });
});

module.exports = router;
