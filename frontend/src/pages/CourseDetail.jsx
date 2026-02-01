import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../api/courseService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { showSuccess, showError } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';

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
      showSuccess('Enrolled successfully!');
      fetchCourse(); // Refresh to show enrolled status
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    navigate(`/learn/${id}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading course details..." />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error || 'Course not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dcs-black">
      <Navbar />
      
      {/* Hero */}
      <div className="pt-32 pb-16 px-8 bg-gradient-to-br from-[#0a1a2e] to-dcs-black text-center">
        <div className="max-w-[1200px] mx-auto">
          <button
            onClick={() => navigate('/courses')}
            className="mb-6 text-white hover:text-dcs-purple transition-colors"
          >
            ← Back to Courses
          </button>

          <h1 className="text-5xl font-bold mb-4 text-white">{course.title}</h1>
          <p className="text-lg mb-6 text-dcs-text-gray">{course.shortDescription || course.description}</p>

          <div className="flex items-center justify-center gap-6 text-sm">
            {course.difficultyLevel && (
              <span className="bg-dcs-purple/20 text-dcs-purple px-4 py-2 rounded">
                {course.difficultyLevel}
              </span>
            )}
            {course.estimatedDurationHours && (
              <span className="text-dcs-text-gray">{course.estimatedDurationHours} hours</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-12">
          {/* Main Content */}
          <div>
            {/* Description */}
            <div className="card mb-8">
              <h2 className="text-dcs-purple mb-6 text-2xl font-bold">What you'll learn</h2>
              <p className="text-dcs-text-gray whitespace-pre-wrap leading-relaxed">{course.description}</p>
            </div>

            {/* Course Content */}
            <div className="card">
              <h2 className="text-dcs-purple mb-6 text-2xl font-bold">Course Content</h2>
              <p className="text-dcs-text-gray mb-6">
                {course.modules.reduce((acc, m) => acc + (m.contentItems?.length || 0), 0)} lectures • 
                {course.estimatedDurationHours || 'N/A'} hours total content
              </p>

              {course.modules.map((module, index) => (
                <div key={module.id} className="mb-8 last:mb-0">
                  <h3 className="text-white text-lg font-semibold mb-3">
                    Module {index + 1}: {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-dcs-text-gray mb-4">{module.description}</p>
                  )}

                  <ul className="space-y-3 ml-4">
                    {module.contentItems?.map((item) => (
                      <li key={item.id} className="flex items-center text-dcs-text-gray">
                        <span className="mr-3 text-lg">
                          {item.contentType === 'VIDEO' && '🎥'}
                          {item.contentType === 'ARTICLE' && '📄'}
                          {item.contentType === 'ASSESSMENT' && '✏️'}
                        </span>
                        <span>{item.title}</span>
                        {/*{item.isPreview && (
                          <span className="ml-3 text-xs bg-dcs-purple/20 text-dcs-purple px-2 py-1 rounded">
                            Preview
                          </span>
                        )}*/}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card border-dcs-purple sticky top-24 text-center">
              {course.isPurchased ? (
                <div>
                  <div className="bg-green-900/30 text-green-400 p-4 rounded mb-6 border border-green-500/30">
                    ✓ You're enrolled in this course
                  </div>

                  {course.enrollment && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2 text-dcs-text-gray">
                        <span>Progress</span>
                        <span className="text-white">{parseFloat(course.enrollment.progressPercentage).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-dcs-black rounded-full h-2">
                        <div
                          className="bg-dcs-purple h-2 rounded-full transition-all"
                          style={{ width: `${course.enrollment.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleStartLearning}
                    className="w-full py-4 bg-dcs-purple text-white rounded-full font-bold hover:bg-dcs-dark-purple transition-all"
                  >
                    Continue Learning →
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl font-bold mb-6 text-white">
                    ${parseFloat(course.price).toFixed(2)}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-4 bg-dcs-purple text-white rounded-full font-bold hover:bg-dcs-dark-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>

                  <p className="text-xs text-dcs-text-gray text-center mt-4">
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