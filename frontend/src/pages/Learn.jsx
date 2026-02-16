import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../api/courseService';
import { progressService } from '../api/progressService';
import { certificateService } from '../api/certificateService';
import { showSuccess, showError } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';

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

  const handleVideoProgress = async (contentId, position, completed, totalWatchTime) => {
    try {
      console.log('handleVideoProgress called:', { contentId, position, completed, totalWatchTime });
      await progressService.updateVideoProgress(contentId, position, completed, totalWatchTime);
      if (completed) {
        console.log('Video marked as completed, refreshing course');
        fetchCourse(); // Refresh to update progress
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
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

  // Add this helper function near the top of the Learn component, after state declarations
  const isContentLocked = (contentItem, moduleContentItems) => {
    // Only lock assessments
    if (contentItem.contentType !== 'ASSESSMENT') return false;

    // Get all videos in the same module
    const moduleVideos = moduleContentItems.filter(item => item.contentType === 'VIDEO');

    // If no videos in module, assessment is not locked
    if (moduleVideos.length === 0) return false;

    // Check if all videos are completed
    const allVideosCompleted = moduleVideos.every(video => video.videoCompleted);

    return !allVideosCompleted;
  };

  if (loading) {
    return <LoadingSpinner message="Loading course content..." />;
  }

  return (
    <div className="min-h-screen bg-dcs-black flex pt-20">
      <Navbar />
      {/* Sidebar - Course Contents */}
      <div className="w-80 bg-gradient-to-b from-dcs-dark-gray to-dcs-black border-r border-dcs-purple/30 overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-dcs-purple/30 bg-dcs-dark-gray/50 backdrop-blur-sm">
          <button onClick={() => navigate('/my-courses')} className="flex items-center gap-2 text-dcs-purple hover:text-dcs-electric-indigo mb-4 transition-all hover:gap-3 font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            My Courses
          </button>
          <h2 className="text-xl font-bold text-white mb-4 leading-tight">{course.title}</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-white">Progress</div>
              <div className="text-sm font-bold text-dcs-purple">{parseFloat(course.enrollment?.progressPercentage || 0).toFixed(0)}%</div>
            </div>
            <div className="w-full bg-dcs-black/50 rounded-full h-3 overflow-hidden border border-dcs-purple/20">
              <div
                className="bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo h-3 rounded-full transition-all duration-500 shadow-lg shadow-dcs-purple/50"
                style={{ width: `${course.enrollment?.progressPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {course.enrollment?.completed && (
          <div className="m-4 p-5 bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl border border-green-500/40 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎉</span>
              <p className="text-sm text-green-300 font-bold">Course Completed!</p>
            </div>
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

              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-green-500 hover:to-green-400 transition-all shadow-lg hover:shadow-green-500/30 hover:scale-105"
            >
              Download Certificate
            </button>
          </div>
        )}

        {/* Modules & Content */}
        <div className="p-4">
          {course.modules.map((module, idx) => (
            <div key={module.id} className="mb-6">
              <h3 className="font-bold mb-3 text-white px-2 py-1 text-base">
                {idx + 1}. {module.title}
              </h3>
              <ul className="space-y-1.5">
                {module.contentItems.map((item) => {
                  const locked = isContentLocked(item, module.contentItems);

                  return (
                    <li
                      key={item.id}
                      onClick={() => !locked && handleContentSelect(item)}
                      className={`p-3 rounded-lg transition-all duration-200 ${locked
                        ? 'opacity-50 cursor-not-allowed bg-dcs-light-gray/20'
                        : selectedContent?.id === item.id
                          ? 'bg-gradient-to-r from-dcs-purple/30 to-dcs-purple/10 border-l-4 border-dcs-purple text-white cursor-pointer shadow-lg shadow-dcs-purple/20'
                          : 'hover:bg-dcs-light-gray/50 text-dcs-text-gray hover:text-white cursor-pointer hover:translate-x-1'
                        }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {item.contentType === 'VIDEO' && '🎥'}
                            {item.contentType === 'ARTICLE' && '📄'}
                            {item.contentType === 'ASSESSMENT' && (locked ? '🔒' : '✏️')}
                          </span>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        {item.contentType === 'VIDEO' && item.videoCompleted && (
                          <span className="text-green-400 text-base font-bold">✓</span>
                        )}
                        {item.contentType === 'ASSESSMENT' && item.hasPassed && (
                          <span className="text-green-400 text-base font-bold">✓</span>
                        )}
                      </div>
                      {locked && (
                        <p className="text-xs text-dcs-text-gray/80 mt-1.5 ml-7">
                          Complete all videos to unlock
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-dcs-black via-dcs-black to-dcs-dark-gray/30">
        {selectedContent ? (
          <ContentViewer
            key={selectedContent.id}
            content={selectedContent}
            onVideoProgress={handleVideoProgress}
            onAssessmentSubmit={handleAssessmentSubmit}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-dcs-text-gray text-lg">Select a lesson to start learning</p>
            </div>
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
  const totalWatchTimeRef = useRef(content.totalWatchTimeSeconds || 0); // Use ref to track watch time
  const lastUpdateTimeRef = useRef(null);

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
    totalWatchTimeRef.current = 0;
    lastUpdateTimeRef.current = null;
    setLastSavedTime(0);
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
      <div className="bg-yellow-900/30 border border-yellow-500/30 p-6 rounded">
        <p className="text-yellow-400">⚠️ No video available for this lesson yet.</p>
      </div>
    );
  }

  const handleTimeUpdate = (e) => {
    const video = e.target;
    const currentTime = Math.floor(video.currentTime);
    const now = Date.now();

    // Calculate watch time increment
    if (lastUpdateTimeRef.current && !video.paused && !video.seeking) {
      const timeDiff = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
      // Only count if time diff is reasonable (between 0.1 and 2 seconds to avoid skips)
      if (timeDiff > 0.1 && timeDiff < 2) {
        totalWatchTimeRef.current += timeDiff;
      }
    }
    lastUpdateTimeRef.current = now;

    // Save progress every 5 seconds
    if (currentTime - lastSavedTime >= 5) {
      const videoDuration = content.videoDurationSeconds || video.duration;
      const completed = totalWatchTimeRef.current >= videoDuration * 0.90; // 90% watch time required
      onProgress(content.id, currentTime, completed, totalWatchTimeRef.current);
      setLastSavedTime(currentTime);
    }
  };

  const handlePause = () => {
    lastUpdateTimeRef.current = null; // Stop counting when paused
  };

  const handlePlay = () => {
    lastUpdateTimeRef.current = Date.now(); // Resume counting when playing
  };

  const handleSeeking = () => {
    lastUpdateTimeRef.current = null; // Stop counting during seek
  };

  const handleSeeked = () => {
    lastUpdateTimeRef.current = Date.now(); // Resume after seek
  };

  const handleEnded = () => {
    const videoDuration = content.videoDurationSeconds || 0;
    const completed = totalWatchTimeRef.current >= videoDuration * 0.90;
    onProgress(content.id, videoDuration, completed, totalWatchTimeRef.current);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3 text-white bg-gradient-to-r from-white to-dcs-purple bg-clip-text text-transparent">{content.title}</h1>
        {content.description && <p className="text-dcs-text-gray text-lg leading-relaxed">{content.description}</p>}
      </div>

      {videoUrl ? (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-dcs-purple/20 bg-black">
          <video
            key={content.id}
            controls
            className="w-full aspect-video"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={handleLoadedMetadata}
            onPause={handlePause}
            onPlay={handlePlay}
            onSeeking={handleSeeking}
            onSeeked={handleSeeked}
            src={videoUrl}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 bg-dcs-dark-gray/50 rounded-2xl border border-dcs-purple/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dcs-purple mx-auto mb-4"></div>
            <p className="text-dcs-text-gray">Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Article Viewer Component
function ArticleViewer({ content }) {
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (content.articleFileUrl) {
      const extension = content.articleFileUrl.split('.').pop().toLowerCase();
      setFileType(extension);

      const url = content.articleFileUrl.replace('/download/', '/view/');

      // Fetch and create blob URL
      fetch(`http://localhost:5000${url}`, {
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          setFileUrl(blobUrl);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load article:', err);
          setLoading(false);
        });
    }

    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [content.id]);

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-white">{content.title}</h1>
        {content.description && <p className="text-dcs-text-gray mb-6 text-lg">{content.description}</p>}
        <div className="card">
          <p className="text-dcs-text-gray">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3 text-white bg-gradient-to-r from-white to-dcs-purple bg-clip-text text-transparent">{content.title}</h1>
        {content.description && <p className="text-dcs-text-gray text-lg leading-relaxed">{content.description}</p>}
      </div>

      <div className="bg-dcs-dark-gray/50 backdrop-blur-sm border border-dcs-purple/20 rounded-2xl p-8 shadow-2xl">
        {content.articleContent && (
          <div className="prose prose-invert prose-lg max-w-none mb-6 text-dcs-text-gray"
            dangerouslySetInnerHTML={{ __html: content.articleContent }} />
        )}

        {fileUrl && (
          <div className="mt-6">
            {fileType === 'pdf' ? (
              <iframe
                src={fileUrl}
                className="w-full h-[800px] border border-dcs-purple/30 rounded-xl bg-white"
                title="PDF Viewer"
              />
            ) : (
              <img
                src={fileUrl}
                alt={content.title}
                className="w-full rounded-xl border border-dcs-purple/30 shadow-lg"
              />
            )}
          </div>
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3 text-white bg-gradient-to-r from-white to-dcs-purple bg-clip-text text-transparent">{content.title}</h1>
        {content.description && <p className="text-dcs-text-gray text-lg leading-relaxed">{content.description}</p>}
      </div>

      {content.attemptCount > 0 && !showQuestions && (
        <div className="bg-dcs-dark-gray/50 backdrop-blur-sm border border-dcs-purple/20 rounded-2xl p-8 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Assessment Summary</h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-dcs-purple/30 to-dcs-purple/10 p-6 rounded-xl border border-dcs-purple/40 shadow-lg">
              <p className="text-sm text-dcs-text-gray mb-2 font-semibold">Latest Score</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo bg-clip-text text-transparent">{content.latestScore.toFixed(0)}%</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-6 rounded-xl border border-green-500/40 shadow-lg">
              <p className="text-sm text-dcs-text-gray mb-2 font-semibold">Best Score</p>
              <p className="text-4xl font-bold text-green-400">{content.bestScore.toFixed(0)}%</p>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-sm text-dcs-text-gray">Total Attempts: <span className="font-bold text-white">{content.attemptCount}</span></p>
            <p className="text-sm text-dcs-text-gray">Status:
              <span className={`font-bold ml-2 ${content.hasPassed ? 'text-green-400' : 'text-orange-400'}`}>
                {content.hasPassed ? '✓ Passed' : 'Not Passed'}
              </span>
            </p>
          </div>

          <button
            onClick={handleRetake}
            className="w-full bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-dcs-purple/30 transition-all hover:scale-105"
          >
            Retake Assessment
          </button>
        </div>
      )}

      {/* Show questions */}
      {showQuestions && (
        <div className="bg-dcs-dark-gray/50 backdrop-blur-sm border border-dcs-purple/20 rounded-2xl p-8 shadow-2xl">
          {content.questions?.map((q, idx) => (
            <div key={q.id} className="mb-8 pb-8 border-b border-white/5 last:border-0">
              <p className="font-bold mb-4 text-white text-lg">
                {idx + 1}. {q.questionText}
              </p>

              {q.questionType === 'MCQ' ? (
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    q[`option${opt}`] && (
                      <label key={opt} className="flex items-center p-4 rounded-lg hover:bg-dcs-light-gray/50 cursor-pointer transition-all border border-transparent hover:border-dcs-purple/30">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="mr-3 w-5 h-5 text-dcs-purple accent-dcs-purple"
                        />
                        <span className="text-dcs-text-gray font-medium">{opt}. {q[`option${opt}`]}</span>
                      </label>
                    )
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center p-4 rounded-lg hover:bg-dcs-light-gray/50 cursor-pointer transition-all border border-transparent hover:border-dcs-purple/30">
                    <input
                      type="radio"
                      name={q.id}
                      value="TRUE"
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="mr-3 w-5 h-5 text-dcs-purple accent-dcs-purple"
                    />
                    <span className="text-dcs-text-gray font-medium">True</span>
                  </label>
                  <label className="flex items-center p-4 rounded-lg hover:bg-dcs-light-gray/50 cursor-pointer transition-all border border-transparent hover:border-dcs-purple/30">
                    <input
                      type="radio"
                      name={q.id}
                      value="FALSE"
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="mr-3 w-5 h-5 text-dcs-purple accent-dcs-purple"
                    />
                    <span className="text-dcs-text-gray font-medium">False</span>
                  </label>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== content.questions?.length}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-xl font-bold hover:from-green-500 hover:to-green-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-green-500 transition-all shadow-lg hover:shadow-green-500/30 hover:scale-105 disabled:hover:scale-100"
          >
            Submit Assessment
          </button>
        </div>
      )}
    </div>
  );
}