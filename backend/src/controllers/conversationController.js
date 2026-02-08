const conversationService = require('../services/conversationService');
const slmService = require('../services/slmService');
const Joi = require('joi');

const chatSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required(),
  sessionToken: Joi.string().allow(null).optional(),
});

/**
 * Get or create session for current user
 * POST /api/conversation/init
 */
const initSession = async (req, res, next) => {
  try {
    console.log('=== INIT SESSION CALLED ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', req.body);
    console.log('Stack trace:', new Error().stack); // This shows WHERE it's called from
    
    const userId = req.user?.id || null;
    const { sessionToken } = req.body;
    
    const session = await conversationService.getOrCreateSession(userId, sessionToken);
    
    res.json({
      sessionToken: session.sessionToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start or continue conversation
 * POST /api/conversation/chat
 */
const chat = async (req, res, next) => {
  try {
    console.log('Received chat request:', req.body);
    const { error, value } = chatSchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details[0].message);
      return res.status(400).json({
        error: { message: error.details[0].message },
      });
    }

    const { message, sessionToken } = value;
    const userId = req.user?.id || null;

    // Get or create session
    const session = await conversationService.getOrCreateSession(userId, sessionToken);

    // Add user message to history
    await conversationService.addMessage(session.sessionToken, 'user', message);

    // Get conversation history for context
    const history = await conversationService.getConversationHistory(session.sessionToken);

    // Get all learning paths for LLM context
    const learningPaths = await conversationService.getAllLearningPaths();

    // Generate response using SLM
    const { message: assistantMessage, recommendation } = await slmService.generateResponse(
      history,
      learningPaths
    );

    // Add assistant message to history
    await conversationService.addMessage(session.sessionToken, 'assistant', assistantMessage);

    // If recommendation found, update session
    let recommendedPath = null;
    if (recommendation) {
      console.log('Recommendation found:', recommendation); // ADD THIS
      const preferences = slmService.extractPreferences(history);
      console.log('Extracted preferences:', preferences); // ADD THIS
      
      await conversationService.updateExtractedInfo(
        session.sessionToken,
        recommendation.name,
        preferences,
        recommendation.id
      );
      recommendedPath = recommendation;
    }

    res.json({
      sessionToken: session.sessionToken,
      message: assistantMessage,
      recommendation: recommendedPath,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get courses for recommended path
 * GET /api/conversation/path/:pathId/courses
 */
const getPathCourses = async (req, res, next) => {
  try {
    const { pathId } = req.params;
    const userId = req.user?.id || null;

    const courses = await conversationService.getCoursesForPath(pathId);
    const progress = userId ? await conversationService.getPathProgress(userId, pathId) : null;

    res.json({
      courses,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session details
 * GET /api/conversation/session/:sessionToken
 */
const getSession = async (req, res, next) => {
  try {
    const { sessionToken } = req.params;

    const session = await conversationService.getOrCreateSession(null, sessionToken);
    const history = await conversationService.getConversationHistory(sessionToken);

    res.json({
      session: {
        sessionToken: session.sessionToken,
        extractedGoal: session.extractedGoal,
        extractedPreferences: session.extractedPreferences,
        recommendedPathId: session.recommendedPathId,
      },
      history,
    });
  } catch (error) {
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: { message: error.message } });
    }
    next(error);
  }
};

/**
 * Reset conversation
 * DELETE /api/conversation/session/:sessionToken
 */
const resetSession = async (req, res, next) => {
  try {
    const { sessionToken } = req.params;

    await prisma.conversationSession.delete({
      where: { sessionToken },
    });

    res.json({ message: 'Session reset successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Health check for SLM
 * GET /api/conversation/health
 */
const healthCheck = async (req, res, next) => {
  try {
    const isHealthy = await slmService.checkOllamaHealth();

    res.json({
      status: isHealthy ? 'ok' : 'degraded',
      ollama: isHealthy,
      model: slmService.MODEL_NAME,
      url: slmService.OLLAMA_BASE_URL,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  getPathCourses,
  getSession,
  resetSession,
  healthCheck,
  initSession,
};