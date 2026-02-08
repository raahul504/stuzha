const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.2:latest'; // Lightweight model

/**
 * Build system prompt for course advisor agent
 */
const buildSystemPrompt = (learningPaths) => {
  const pathsList = learningPaths.map(p => 
    `- ${p.name}: ${p.description} (Keywords: ${p.goalKeywords.join(', ')})`
  ).join('\n');

  return `You are a helpful course advisor AI for an online learning platform. Your job is to understand the user's learning goals and recommend the most appropriate learning path.

Available Learning Paths:
${pathsList}

Your conversation should:
1. Ask clarifying questions to understand their goals, experience level, and preferences
2. Identify which learning path best matches their needs
3. Ask about specific preferences (framework choices, tools, cloud providers, etc.) when relevant
4. Be encouraging and professional
5. Keep responses concise (2-3 sentences max)
6. Once you identify a clear match, explicitly state: "RECOMMENDATION: [Learning Path Name]"

Important: Do NOT make up courses or information. Only discuss the learning paths listed above. If user asks about something not covered, suggest the closest match or ask them to clarify.`;
};

/**
 * Extract recommendation from LLM response
 */
const extractRecommendation = (response, learningPaths) => {
  const match = response.match(/RECOMMENDATION:\s*([^\n]+)/i);
  if (!match) return null;

  const recommendedName = match[1].trim();
  const path = learningPaths.find(p => 
    p.name.toLowerCase() === recommendedName.toLowerCase()
  );

  return path || null;
};

/**
 * Extract user preferences from conversation
 */
const extractPreferences = (conversationHistory) => {
  // Simple keyword extraction for preferences
  const allMessages = conversationHistory
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ');

  const preferences = {};

  // Framework preferences
  if (allMessages.includes('react')) preferences.framework = 'React';
  else if (allMessages.includes('vue')) preferences.framework = 'Vue';
  else if (allMessages.includes('angular')) preferences.framework = 'Angular';

  // Cloud provider
  if (allMessages.includes('aws')) preferences.cloudProvider = 'AWS';
  else if (allMessages.includes('azure')) preferences.cloudProvider = 'Azure';
  else if (allMessages.includes('gcp') || allMessages.includes('google cloud')) {
    preferences.cloudProvider = 'Google Cloud';
  }

  // Experience level
  if (allMessages.includes('beginner') || allMessages.includes('new to') || allMessages.includes('never')) {
    preferences.experienceLevel = 'beginner';
  } else if (allMessages.includes('intermediate') || allMessages.includes('some experience')) {
    preferences.experienceLevel = 'intermediate';
  } else if (allMessages.includes('advanced') || allMessages.includes('experienced')) {
    preferences.experienceLevel = 'advanced';
  }

  return preferences;
};

/**
 * Call Ollama API for chat completion
 */
const generateResponse = async (messages, learningPaths) => {
  try {
    const systemPrompt = buildSystemPrompt(learningPaths);

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      },
    });

    const assistantMessage = response.data.message.content;
    console.log('LLM Response:', assistantMessage); // ADD THIS
    const recommendation = extractRecommendation(assistantMessage, learningPaths);
    console.log('Extracted recommendation:', recommendation); // ADD THIS

    return {
      message: assistantMessage,
      recommendation,
    };
  } catch (error) {
    console.error('Ollama API error:', error.message);
    
    // Fallback response if Ollama is down
    return {
      message: "I'm having trouble connecting to my knowledge base right now. Could you tell me what you're interested in learning? For example: web development, cloud computing, cybersecurity, data analysis, etc.",
      recommendation: null,
      error: true,
    };
  }
};

/**
 * Check if Ollama is available
 */
const checkOllamaHealth = async () => {
  try {
    await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    return true;
  } catch (error) {
    console.error('Ollama not available:', error.message);
    return false;
  }
};

module.exports = {
  generateResponse,
  extractPreferences,
  checkOllamaHealth,
  OLLAMA_BASE_URL,
  MODEL_NAME,
};