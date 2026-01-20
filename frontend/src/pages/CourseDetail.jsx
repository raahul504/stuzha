import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../api/courseService';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await courseService.getCourseById(id);
      setCourse(data.course);
    } catch (err) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await courseService.enrollInCourse(id);
      alert('Enrolled successfully!');
      fetchCourse(); // Refresh to show enrolled status
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    navigate(`/learn/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading course...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error || 'Course not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => navigate('/courses')}
            className="mb-4 text-white hover:underline"
          >
            ← Back to Courses
          </button>

          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg mb-6">{course.shortDescription}</p>

          <div className="flex items-center space-x-6 text-sm">
            {course.difficultyLevel && (
              <span className="bg-white/20 px-3 py-1 rounded">
                {course.difficultyLevel}
              </span>
            )}
            {course.estimatedDurationHours && (
              <span>{course.estimatedDurationHours} hours</span>
            )}
            <span className="text-2xl font-bold">
              ${parseFloat(course.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">About this course</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>

              {course.modules.map((module, index) => (
                <div key={module.id} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Module {index + 1}: {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-gray-600 mb-3">{module.description}</p>
                  )}

                  <ul className="space-y-2 ml-4">
                    {module.contentItems.map((item) => (
                      <li key={item.id} className="flex items-center text-gray-700">
                        <span className="mr-2">
                          {item.contentType === 'VIDEO' && '🎥'}
                          {item.contentType === 'ARTICLE' && '📄'}
                          {item.contentType === 'ASSESSMENT' && '✏️'}
                        </span>
                        <span>{item.title}</span>
                        {item.isPreview && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Preview
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              {course.isPurchased ? (
                <div>
                  <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
                    ✓ You're enrolled in this course
                  </div>

                  {course.enrollment && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{parseFloat(course.enrollment.progressPercentage).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${course.enrollment.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleStartLearning}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Continue Learning →
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-center mb-4">
                    ${parseFloat(course.price).toFixed(2)}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    {isAuthenticated ? 'Click to enroll' : 'Login required to enroll'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}