import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../api/courseService';
import { progressService } from '../api/progressService';

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
        alert('You must enroll in this course first');
        navigate(`/courses/${id}`);
        return;
      }
      setCourse(data.course);
      // Auto-select first content item
      if (data.course.modules[0]?.contentItems[0]) {
        setSelectedContent(data.course.modules[0].contentItems[0]);
      }
    } catch (err) {
      alert('Failed to load course');
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
      alert(result.message);
      fetchCourse(); // Refresh progress
      return result;
    } catch (err) {
      alert('Failed to submit assessment');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

  useEffect(() => {
    fetch(`http://localhost:5000${content.videoUrl}`, { credentials: 'include' })
      .then(res => res.blob())
      .then(blob => setVideoUrl(URL.createObjectURL(blob)));
  }, [content.id]);

  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (Math.floor(video.currentTime) % 5 === 0) {
      const completed = video.currentTime / video.duration > 0.9;
      onProgress(content.id, Math.floor(video.currentTime), completed);
    }
  };

  const handleEnded = () => {
    onProgress(content.id, content.videoDurationSeconds, true);
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
          src={videoUrl}
        >
          Your browser does not support video playback.
        </video>
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
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.articleContent }} />
        
        {content.articleFileUrl && (
          <a
            href={content.articleFileUrl}
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    const result = await onSubmit(content.id, answers);
    setResult(result);
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
      {content.description && <p className="text-gray-600 mb-6">{content.description}</p>}

      {submitted && result ? (
        <div className={`p-6 rounded-lg mb-6 ${result.result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
          <h2 className="text-xl font-bold mb-2">
            {result.result.passed ? '✅ Passed!' : '❌ Not Passed'}
          </h2>
          <p>Score: {result.result.score.toFixed(0)}%</p>
          <p>Correct: {result.result.correctCount}/{result.result.totalQuestions}</p>
          <button
            onClick={() => { setSubmitted(false); setAnswers({}); setResult(null); }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      ) : (
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