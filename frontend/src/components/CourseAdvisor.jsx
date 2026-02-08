import { useState, useEffect, useRef } from 'react';
import { conversationService } from '../api/conversationService';
import { useNavigate } from 'react-router-dom';
import { showError } from '../utils/toast';
import { useAuth } from '../context/AuthContext';

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
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      const response = await conversationService.sendMessage(userMessage, sessionToken);
      
      // Store session token
      if (!sessionToken) {
        setSessionToken(response.sessionToken);
        localStorage.setItem('courseAdvisorSession', response.sessionToken);
      }

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dcs-dark-gray rounded-2xl w-full max-w-4xl h-[600px] flex flex-col border border-dcs-purple/30 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-dcs-purple/20 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Course Advisor</h2>
            <p className="text-sm text-dcs-text-gray">Find your perfect learning path</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-dcs-light-gray text-white rounded-lg hover:bg-dcs-purple/30 transition-all"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
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
          ))}

          {/* Recommendation Card */}
          {recommendation && (
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

              {courses.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Available Courses ({courses.length}):</h4>
                  <div className="space-y-2">
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
                        <p className="text-xs text-dcs-text-gray">{course.category?.name}</p>
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
                  </div>
                </div>
              )}
            </div>
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

        {/* Input */}
        <div className="p-6 border-t border-dcs-purple/20">
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
    </div>
  );
}