import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../api/courseService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const data = await courseService.getMyCourses();
      setCourses(data.courses);
    } catch (err) {
      console.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your courses..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
    <Navbar />
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">You haven't enrolled in any courses yet.</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/learn/${course.id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {course.title.charAt(0)}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">
                        {parseFloat(course.progressPercentage).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {course.completed && (
                    <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded mb-2">
                      ✓ Completed
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/learn/${course.id}`);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-2"
                  >
                    Continue Learning →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}