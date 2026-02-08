const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { optionalAuth } = require('../middleware/auth');

// Initialise chat session
router.post('/init', optionalAuth, conversationController.initSession);

// Chat endpoint - works for both authenticated and anonymous users
router.post('/chat', optionalAuth, conversationController.chat);

// Get courses for a learning path
router.get('/path/:pathId/courses', optionalAuth, conversationController.getPathCourses);

// Get session details
router.get('/session/:sessionToken', conversationController.getSession);

// Reset session
router.delete('/session/:sessionToken', conversationController.resetSession);

// Health check
router.get('/health', conversationController.healthCheck);

module.exports = router;