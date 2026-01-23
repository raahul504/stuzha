import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../api/courseService';
import { progressService } from '../api/progressService';
import { certificateService } from '../api/certificateService';
import { showSuccess, showError } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Learn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await courseService.getCourseById(id);
      if (!data.course.isPurchased) {
        showError('You must enroll in this course first');
        navigate(`/courses/${id}`);
        return;
      }
      setCourse(data.course);
      // Auto-select first content item
      if (data.course.modules[0]?.contentItems[0]) {
        setSelectedContent(data.course.modules[0].contentItems[0]);
      }
    } catch (err) {
      showError('Failed to load course');
      navigate('/my-courses');
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = (content) => {
    setSelectedContent(content);
  };

  const handleVideoProgress = async (contentId, position, completed) => {
    try {
      await progressService.updateVideoProgress(contentId, position, completed);
      if (completed) {
        fetchCourse(); // Refresh to update progress
      }
    } catch (err) {
      console.error('Failed to update progress');
    }
  };

  const handleAssessmentSubmit = async (contentId, answers) => {
    try {
      const result = await progressService.submitAssessment(contentId, answers);
      showSuccess(result.message);
      fetchCourse(); // Refresh progress
      return result;
    } catch (err) {
      showError('Failed to submit assessment');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading course content..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Course Contents */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <button onClick={() => navigate('/my-courses')} className="text-blue-600 hover:underline mb-2">
            ← My Courses
          </button>
          <h2 className="text-xl font-bold">{course.title}</h2>
          <div className="mt-2">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${course.enrollment?.progressPercentage || 0}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {parseFloat(course.enrollment?.progressPercentage || 0).toFixed(0)}%
            </div>
          </div>
        </div>

        {course.enrollment?.completed && (
            <div className="mt-4 p-3 bg-green-100 rounded">
                <p className="text-sm text-green-800 font-semibold mb-2">🎉 Course Completed!</p>
                <button
                onClick={async () => {
                  try {
                    const res = await certificateService.generateCertificate(id);
                    window.open(
                      `http://localhost:5000${res.certificate.fileUrl}`,
                      '_blank'
                    );
                  } catch (err) {
                    showError('Certificate generation failed');
                  }
                }}

                className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700"
                >
                Download Certificate
                </button>
            </div>
            )}

        {/* Modules & Content */}
        <div className="p-4">
          {course.modules.map((module, idx) => (
            <div key={module.id} className="mb-6">
              <h3 className="font-semibold mb-2">
                {idx + 1}. {module.title}
              </h3>
              <ul className="space-y-1">
                {module.contentItems.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleContentSelect(item)}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                      selectedContent?.id === item.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center text-sm">
                      <span className="mr-2">
                        {item.contentType === 'VIDEO' && '🎥'}
                        {item.contentType === 'ARTICLE' && '📄'}
                        {item.contentType === 'ASSESSMENT' && '✏️'}
                      </span>
                      <span>{item.title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {selectedContent ? (
          <ContentViewer
            content={selectedContent}
            onVideoProgress={handleVideoProgress}
            onAssessmentSubmit={handleAssessmentSubmit}
          />
        ) : (
          <div className="text-center text-gray-500 mt-20">
            Select a lesson to start learning
          </div>
        )}
      </div>
    </div>
  );
}

// Content Viewer Component
function ContentViewer({ content, onVideoProgress, onAssessmentSubmit }) {
  if (content.contentType === 'VIDEO') {
    return <VideoPlayer content={content} onProgress={onVideoProgress} />;
  }
  if (content.contentType === 'ARTICLE') {
    return <ArticleViewer content={content} />;
  }
  if (content.contentType === 'ASSESSMENT') {
    return <AssessmentViewer content={content} onSubmit={onAssessmentSubmit} />;
  }
  return null;
}

// Video Player Component
function VideoPlayer({ content, onProgress }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0); // NEW: Track actual watch time
  const [lastUpdateTime, setLastUpdateTime] = useState(null); // NEW: Track when last updated

  useEffect(() => {
    if (!content.videoUrl) {
      setError(true);
      return;
    }
    fetch(`http://localhost:5000${content.videoUrl}`, { credentials: 'include' })
      .then(res => res.blob())
      .then(blob => setVideoUrl(URL.createObjectURL(blob)))
      .catch(() => setError(true));

      // Reset watch time for new video
      setTotalWatchTime(0);
      setLastUpdateTime(null);
    }, [content.id]);

  // Set initial video position from saved progress
  const handleLoadedMetadata = (e) => {
    const video = e.target;
    
    // If video is already marked as completed, start from beginning
    if (content.videoCompleted) {
      return; // Don't seek, let it play from start
    }
    
    if (content.lastPositionSeconds && content.lastPositionSeconds > 0) {
      // Don't seek if position is too close to the end (within last 5 seconds)
      const maxSeekPosition = video.duration - 5;
      
      if (content.lastPositionSeconds < maxSeekPosition) {
        video.currentTime = content.lastPositionSeconds;
      }
    }
  };

  if (error || !content.videoUrl) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 p-6 rounded">
        <p className="text-yellow-800">⚠️ No video available for this lesson yet.</p>
      </div>
    );
  }

  const handleTimeUpdate = (e) => {
    const video = e.target;
    const currentTime = Math.floor(video.currentTime);
    const now = Date.now();
    
    // Calculate watch time increment
    if (lastUpdateTime && !video.paused && !video.seeking) {
      const timeDiff = (now - lastUpdateTime) / 1000; // Convert to seconds
      // Only count if time diff is reasonable (between 0.1 and 2 seconds to avoid skips)
      if (timeDiff > 0.1 && timeDiff < 2) {
        setTotalWatchTime(prev => prev + timeDiff);
      }
    }
    setLastUpdateTime(now);
    
    // Save progress every 5 seconds
    if (currentTime - lastSavedTime >= 5) {
      const videoDuration = content.videoDurationSeconds || video.duration;
      const completed = totalWatchTime >= videoDuration * 0.95; // 95% watch time required
      onProgress(content.id, currentTime, completed);
      setLastSavedTime(currentTime);
    }
  };

  const handlePause = () => {
    setLastUpdateTime(null); // Stop counting when paused
  };

  const handlePlay = () => {
    setLastUpdateTime(Date.now()); // Resume counting when playing
  };

  const handleSeeking = () => {
    setLastUpdateTime(null); // Stop counting during seek
  };

  const handleSeeked = () => {
    setLastUpdateTime(Date.now()); // Resume after seek
  };

  const handleEnded = () => {
    const videoDuration = content.videoDurationSeconds || 0;
    const completed = totalWatchTime >= videoDuration * 0.95;
    onProgress(content.id, videoDuration, completed);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
      {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}
      
      {videoUrl ? (
        <video
          key={content.id}
          controls
          className="w-full max-w-4xl rounded-lg shadow-lg"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleLoadedMetadata}
          onPause={handlePause}
          onPlay={handlePlay}
          onSeeking={handleSeeking}
          onSeeked={handleSeeked}
          src={videoUrl}
        />
      ) : (
        <div>Loading video...</div>
      )}
    </div>
  );
}

// Article Viewer Component
function ArticleViewer({ content }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
      {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: content.articleContent }} />
        
        {content.articleFileUrl && (
          <a
            href={`http://localhost:5000${content.articleFileUrl}`}
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            download
          >
            Download Article
          </a>
        )}
      </div>
    </div>
  );
}

// Assessment Viewer Component
function AssessmentViewer({ content, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showQuestions, setShowQuestions] = useState(!content.hasPassed);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    const result = await onSubmit(content.id, answers);
    setResult(result);
    setSubmitted(true);
    setShowQuestions(false);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setShowQuestions(true);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
      {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}

      {/* Show score summary if assessment has been attempted */}
      {content.attemptCount > 0 && !showQuestions && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Assessment Summary</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Latest Score</p>
              <p className="text-3xl font-bold text-blue-600">{content.latestScore.toFixed(0)}%</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Best Score</p>
              <p className="text-3xl font-bold text-green-600">{content.bestScore.toFixed(0)}%</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">Total Attempts: <span className="font-semibold">{content.attemptCount}</span></p>
            <p className="text-sm text-gray-600">Status: 
              <span className={`font-semibold ml-2 ${content.hasPassed ? 'text-green-600' : 'text-orange-600'}`}>
                {content.hasPassed ? '✓ Passed' : 'Not Passed'}
              </span>
            </p>
          </div>

          <button
            onClick={handleRetake}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Retake Assessment
          </button>
        </div>
      )}

      {/* Show questions */}
      {showQuestions && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {content.questions?.map((q, idx) => (
            <div key={q.id} className="mb-6">
              <p className="font-semibold mb-3">
                {idx + 1}. {q.questionText}
              </p>

              {q.questionType === 'MCQ' ? (
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    q[`option${opt}`] && (
                      <label key={opt} className="flex items-center">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="mr-2"
                        />
                        {opt}. {q[`option${opt}`]}
                      </label>
                    )
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={q.id}
                      value="TRUE"
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="mr-2"
                    />
                    True
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={q.id}
                      value="FALSE"
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="mr-2"
                    />
                    False
                  </label>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== content.questions?.length}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Submit Assessment
          </button>
        </div>
      )}
    </div>
  );
}