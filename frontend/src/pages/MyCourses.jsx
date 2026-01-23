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
    <div className="min-h-screen bg-dcs-black">
      <Navbar />
      <div className="pt-32 pb-12 px-8">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-5xl text-center mb-4 bg-gradient-to-r from-white to-dcs-purple bg-clip-text text-transparent">
            My Courses
          </h1>
          <p className="text-center text-dcs-text-gray text-lg">Continue your learning journey</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pb-20">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dcs-text-gray text-lg mb-6">You haven't enrolled in any courses yet.</p>
            <button
              onClick={() => navigate('/courses')}
              className="btn-purple"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/learn/${course.id}`)}
                className="bg-dcs-dark-gray rounded-[20px] overflow-hidden border border-dcs-purple/10 transition-all duration-400 cursor-pointer flex flex-col hover:-translate-y-4 hover:border-dcs-purple hover:shadow-2xl"
                style={{ boxShadow: '0 20px 40px rgba(157, 80, 187, 0.1)' }}
              >
                <div className="h-[200px] bg-gradient-to-br from-dcs-dark-purple to-dcs-black flex items-center justify-center border-b-2 border-dcs-purple">
                  <span className="text-white text-5xl font-bold">
                    {course.title.charAt(0)}
                  </span>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-white text-xl font-bold mb-4">{course.title}</h3>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-dcs-text-gray">Progress</span>
                      <span className="text-white font-semibold">
                        {parseFloat(course.progressPercentage).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-dcs-black rounded-full h-2">
                      <div
                        className="bg-dcs-purple h-2 rounded-full transition-all"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {course.completed && (
                    <span className="inline-block bg-green-900/30 text-green-400 text-sm px-3 py-1.5 rounded mb-4 border border-green-500/30">
                      ✓ Completed
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/learn/${course.id}`);
                    }}
                    className="w-full py-3 bg-dcs-purple text-white rounded-full font-semibold hover:bg-dcs-dark-purple transition-all mt-auto"
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