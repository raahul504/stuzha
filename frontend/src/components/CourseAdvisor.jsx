import { useState, useEffect, useRef } from 'react';
import { conversationService } from '../api/conversationService';
import { useNavigate } from 'react-router-dom';
import { showError } from '../utils/toast';
import { useAuth } from '../context/AuthContext';

// Component for recommendation card with courses
const RecommendationCard = ({ recommendation, navigate, onClose }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await conversationService.getPathCourses(recommendation.id);
        setCourses(coursesData.courses);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (recommendation.id) {
      loadCourses();
    }
  }, [recommendation.id]);

  return (
    <div className="bg-gradient-to-r from-dcs-purple/20 to-dcs-electric-indigo/20 border border-dcs-purple/30 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-2">
        🎯 Recommended Path: {recommendation.name}
      </h3>
      <p className="text-dcs-text-gray mb-4">{recommendation.description}</p>
      
      <div className="flex gap-4 mb-4 text-sm">
        <span className="bg-dcs-purple/30 px-3 py-1 rounded text-white">
          {recommendation.difficultyLevel}
        </span>
        {recommendation.estimatedMonths && (
          <span className="bg-dcs-light-gray px-3 py-1 rounded text-white">
            {recommendation.estimatedMonths} months
          </span>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-white mb-3">
          Available Courses{loading ? '' : ` (${courses.length})`}:
        </h4>
        <div className="space-y-2">
          {loading ? (
            <div className="p-3 bg-dcs-dark-gray rounded-lg">
              <div className="text-white text-sm">Loading courses...</div>
            </div>
          ) : (
            <>
              {courses.slice(0, 5).map(course => (
                <div
                  key={course.id}
                  onClick={() => {
                    navigate(`/courses/${course.id}`);
                    onClose();
                  }}
                  className="p-3 bg-dcs-dark-gray rounded-lg cursor-pointer hover:bg-dcs-light-gray transition-all"
                >
                  <p className="font-semibold text-white text-sm">{course.title}</p>
                  <p className="text-xs text-dcs-text-gray">
                    {course.categories?.map(cat => cat.category.name).join(', ')}
                  </p>
                </div>
              ))}
              {courses.length > 5 && (
                <button
                  onClick={() => {
                    navigate('/courses');
                    onClose();
                  }}
                  className="text-dcs-purple text-sm hover:text-dcs-electric-indigo"
                >
                  View all {courses.length} courses →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CourseAdvisor({ onClose }) {
  const { user } = useAuth();
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your course advisor. I'm here to help you find the perfect learning path. What would you like to learn or achieve?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [courses, setCourses] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clear localStorage if user changes
    const storedToken = localStorage.getItem('courseAdvisorSession');
    const storedUserId = localStorage.getItem('courseAdvisorUserId');
    
    if (user?.id && storedUserId && user.id !== storedUserId) {
      // Different user logged in, clear old session
      localStorage.removeItem('courseAdvisorSession');
      localStorage.removeItem('courseAdvisorUserId');
    }
    
    // Store current userId
    if (user?.id) {
      localStorage.setItem('courseAdvisorUserId', user.id);
    }
  }, [user?.id]);

  // Add this useEffect right after the existing useEffect for scrollToBottom
useEffect(() => {
  if (sessionInitialized) return;
  
  const loadSession = async () => {
    try {
      let sessionToken;
      
      // Get or create session
      if (user?.id) {
        // Logged-in user - check localStorage first
        const storedToken = localStorage.getItem('courseAdvisorSession');
        const initData = await conversationService.initSession(storedToken); // PASS stored token
        sessionToken = initData.sessionToken;
      } else {
        // Anonymous user - check localStorage
        const storedToken = localStorage.getItem('courseAdvisorSession');
        if (storedToken) {
          sessionToken = storedToken;
        } else {
          const initData = await conversationService.initSession();
          sessionToken = initData.sessionToken;
        }
      }
      
      setSessionToken(sessionToken);
      localStorage.setItem('courseAdvisorSession', sessionToken);
      
      const sessionData = await conversationService.getSession(sessionToken);
      
      if (sessionData.history.length > 0) {
        setMessages(sessionData.history);
      }
      
      if (sessionData.session.recommendedPathId) {
        const coursesData = await conversationService.getPathCourses(
          sessionData.session.recommendedPathId
        );
        setRecommendation({
          id: sessionData.session.recommendedPathId,
          name: sessionData.session.extractedGoal || 'Recommended Path',
        });
        setCourses(coursesData.courses);
      }
      
      setSessionInitialized(true);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };
  
  loadSession();
}, []); // Remove user?.id dependency - handle user changes separatel

  // Add separate effect for user changes
  useEffect(() => {
    if (sessionInitialized && user?.id) {
      // User logged in after session was initialized, reload
      setSessionInitialized(false);
    }
  }, [user?.id]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Ensure we have a session token before sending
      let currentSessionToken = sessionToken;
      if (!currentSessionToken) {
        const initData = await conversationService.initSession();
        currentSessionToken = initData.sessionToken;
        setSessionToken(currentSessionToken);
        localStorage.setItem('courseAdvisorSession', currentSessionToken);
      }

      const response = await conversationService.sendMessage(userMessage, currentSessionToken);

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);

      // Handle recommendation
      if (response.recommendation) {
        setRecommendation(response.recommendation);
        
        // Fetch courses for this path
        const coursesData = await conversationService.getPathCourses(response.recommendation.id);
        setCourses(coursesData.courses);
      }
    } catch (error) {
      showError('Failed to send message');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (sessionToken) {
      conversationService.resetSession(sessionToken).catch(() => {});
      localStorage.removeItem('courseAdvisorSession');
      localStorage.removeItem('courseAdvisorUserId');
    }
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your course advisor. I'm here to help you find the perfect learning path. What would you like to learn or achieve?",
      },
    ]);
    setSessionToken(null);
    setRecommendation(null);
    setCourses([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-dcs-dark-gray rounded-2xl w-full h-[500px] flex flex-col border border-dcs-purple/30 shadow-2xl relative overflow-hidden">
      {/* Header - Fixed with gradient */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-10" style={{ background: 'linear-gradient(to bottom, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0.75) 60%, rgba(18, 18, 18, 0.2) 100%)' }}>
        <div>
          <h2 className="text-xl font-regurlar text-dcs-text-gray">AI Career Consultant</h2>
          {/*<p className="text-sm text-dcs-text-gray">Find your perfect learning path</p>*/}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-2 py-1 text-red-700 rounded-lg hover:bg-dcs-light-gray/30 transition-all"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 text-dcs-text-gray rounded-lg hover:bg-red-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Messages - with top padding for header */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 pt-28 pb-32 space-y-4 scrollbar-hide">
        {messages.map((msg, idx) => {
          // Check if this is a recommendation message
          let recommendationData = null;
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed.type === 'recommendation') {
              recommendationData = parsed.recommendation;
            }
          } catch (e) {
            // Not a JSON message, regular text
          }

          return (
            <div key={idx}>
              {/* Regular message */}
              {!recommendationData && (
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-dcs-purple text-white'
                        : 'bg-dcs-light-gray text-white'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )}

              {/* Recommendation card */}
              {recommendationData && (
                <RecommendationCard 
                  recommendation={recommendationData} 
                  navigate={navigate} 
                  onClose={onClose} 
                />
              )}
            </div>
          );
        })}

        {/* Current recommendation card (for new recommendations) */}
        {recommendation && !messages.some(msg => {
          try {
            const parsed = JSON.parse(msg.content);
            return parsed.type === 'recommendation' && parsed.recommendation.id === recommendation.id;
          } catch (e) {
            return false;
          }
        }) && (
          <RecommendationCard 
            recommendation={recommendation} 
            navigate={navigate} 
            onClose={onClose} 
          />
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-dcs-light-gray text-white p-4 rounded-2xl">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10" style={{ background: 'linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.7) 70%, rgba(18, 18, 18, 0) 100%)' }}>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-dcs-black border border-dcs-purple/30 rounded-lg text-white placeholder-dcs-text-gray focus:border-dcs-purple focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-8 py-3 bg-dcs-purple text-white rounded-lg hover:bg-dcs-dark-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}