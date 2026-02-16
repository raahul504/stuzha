const prisma = require('../config/database');
const crypto = require('crypto');

/**
 * Generate session token for anonymous users
 */
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create or get conversation session
 */
const getOrCreateSession = async (userId = null, sessionToken = null) => {
  // If user is logged in, find their most recent session
  if (userId) {
    const userSession = await prisma.conversationSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    
    if (userSession) return userSession;
    
    // No existing session for this user, create new one
    const newToken = generateSessionToken();
    return await prisma.conversationSession.create({
      data: {
        userId,
        sessionToken: newToken,
        messagesJson: [],
      },
    });
  }
  
  // Anonymous user - use sessionToken from localStorage
  if (sessionToken) {
    const existing = await prisma.conversationSession.findUnique({
      where: { sessionToken },
    });
    if (existing && !existing.userId) { // Only return if it's anonymous
      return existing;
    }
  }

  // Create new anonymous session
  const newToken = generateSessionToken();
  return await prisma.conversationSession.create({
    data: {
      userId: null,
      sessionToken: newToken,
      messagesJson: [],
    },
  });
};

/**
 * Add message to conversation
 */
const addMessage = async (sessionToken, role, content) => {
  const session = await prisma.conversationSession.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  const message = {
    role, // 'user' or 'assistant'
    content,
    timestamp: new Date().toISOString(),
  };

  const updatedMessages = [...session.messagesJson, message];

  return await prisma.conversationSession.update({
    where: { sessionToken },
    data: {
      messagesJson: updatedMessages,
      updatedAt: new Date(),
    },
  });
};

/**
 * Get conversation history
 */
const getConversationHistory = async (sessionToken) => {
  const session = await prisma.conversationSession.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  return session.messagesJson;
};


/**
 * Update extracted information from conversation
 */
const updateExtractedInfo = async (sessionToken, extractedGoal, extractedPreferences, recommendedPathId = null) => {
  return await prisma.conversationSession.update({
    where: { sessionToken },
    data: {
      extractedGoal,
      extractedPreferences: extractedPreferences || {},
      recommendedPathId,
      updatedAt: new Date(),
    },
  });
};

/**
 * Get all learning paths
 */
const getAllLearningPaths = async () => {
  return await prisma.learningPath.findMany({
    orderBy: { name: 'asc' },
  });
};

/**
 * Find matching learning path based on keywords
 */
const findMatchingPath = async (userGoal) => {
  const allPaths = await getAllLearningPaths();
  const goalLower = userGoal.toLowerCase();

  // Score each path based on keyword matches
  const scored = allPaths.map(path => {
    let score = 0;
    path.goalKeywords.forEach(keyword => {
      if (goalLower.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    return { path, score };
  });

  // Return highest scoring path (if score > 0)
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].path : null;
};

/**
 * Get courses for learning path
 */
const getCoursesForPath = async (pathId) => {
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
  });

  if (!path) return [];

  // Get all courses in the required categories
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      categories: {
        some: {
          categoryId: {
            in: path.requiredCategoryIds,
          },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { title: 'asc' },
  });

  return courses;
};

/**
 * Get user's progress on learning path (if enrolled)
 */
const getPathProgress = async (userId, pathId) => {
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
  });

  if (!path || !userId) return null;

  // Get user's enrollments in courses within this path
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      course: {
        categories: {
          some: {
            categoryId: {
              in: path.requiredCategoryIds,
            },
          },
        },
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return enrollments;
};

// In conversationService.js - add new function
const getCoursesWithContent = async () => {
  return await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      categories: { include: { category: true } },
      modules: {
        include: {
          contentItems: {
            select: { title: true, contentType: true }
          }
        }
      }
    }
  });
};

module.exports = {
  generateSessionToken,
  getOrCreateSession,
  addMessage,
  getConversationHistory,
  updateExtractedInfo,
  getAllLearningPaths,
  findMatchingPath,
  getCoursesForPath,
  getPathProgress,
  getCoursesWithContent,
};