import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../api/adminService';
import Navbar from '../components/Navbar';
import { showSuccess, showError } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (user?.role !== 'INSTRUCTOR' && user?.role !== 'ADMIN') {
      showError('Access denied. Instructors only.');
      navigate('/');
      return;
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await adminService.getAllCourses();
      // Filter only courses created by this instructor (including drafts)
      const myCourses = data.courses.filter(c => c.createdBy === user.id);
      setCourses(myCourses);

      setStats({
        total: myCourses.length,
        published: myCourses.filter(c => c.isPublished).length,
        draft: myCourses.filter(c => !c.isPublished).length,
      });
    } catch (err) {
      showError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await adminService.updateCourse(courseId, { isPublished: !currentStatus });
      showSuccess(`Course ${!currentStatus ? 'published' : 'unpublished'}`);
      fetchCourses();
    } catch (err) {
      showError('Failed to update course');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-dcs-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-dcs-purple/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dcs-electric-indigo/10 blur-[120px] rounded-full"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-3 text-white bg-gradient-to-r from-white to-dcs-purple bg-clip-text text-transparent">
              Instructor Dashboard
            </h1>
            <p className="text-dcs-text-gray text-lg leading-relaxed">Manage your educational content and student engagement</p>
          </div>
          <button
            onClick={() => navigate('/instructor/create-course')}
            className="flex items-center gap-2 bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white px-8 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(157,80,187,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(157,80,187,0.6)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Course
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-dcs-dark-gray/40 backdrop-blur-md border border-dcs-purple/20 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <svg className="w-20 h-20 text-dcs-purple" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.993 7.993 0 002 12a7.993 7.993 0 007 7.196V4.804zM11 4.804V19.196A7.993 7.993 0 0018 12a7.993 7.993 0 00-7-7.196z" />
              </svg>
            </div>
            <p className="text-dcs-text-gray font-semibold mb-2">Total Courses</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-white to-dcs-purple bg-clip-text text-transparent">{stats.total}</p>
          </div>
          <div className="bg-dcs-dark-gray/40 backdrop-blur-md border border-green-500/20 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <svg className="w-20 h-20 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-dcs-text-gray font-semibold mb-2">Published</p>
            <p className="text-5xl font-bold text-green-400">{stats.published}</p>
          </div>
          <div className="bg-dcs-dark-gray/40 backdrop-blur-md border border-dcs-text-gray/20 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <svg className="w-20 h-20 text-dcs-text-gray" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <p className="text-dcs-text-gray font-semibold mb-2">Drafts</p>
            <p className="text-5xl font-bold text-dcs-text-gray">{stats.draft}</p>
          </div>
        </div>

        {/* Courses List Container */}
        <div className="bg-dcs-dark-gray/40 backdrop-blur-md border border-dcs-purple/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">My Creative Portfolio</h2>
            <div className="flex items-center gap-2 text-dcs-text-gray text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-dcs-purple"></span>
              {courses.length} Courses Total
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="p-20 text-center">
              <div className="mb-6 opacity-20">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-dcs-text-gray text-xl mb-8">You haven't started your teaching journey yet.</p>
              <button
                onClick={() => navigate('/instructor/create-course')}
                className="bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white px-10 py-4 rounded-full font-bold shadow-lg transition-all hover:scale-105"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {courses.map((course) => (
                <div key={course.id} className="p-8 hover:bg-white/5 transition-colors group">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${course.isPublished
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-dcs-text-gray/10 text-dcs-text-gray border border-dcs-text-gray/20'
                          }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {course.difficultyLevel && (
                          <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-dcs-purple/10 text-dcs-purple border border-dcs-purple/20">
                            {course.difficultyLevel}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-dcs-purple transition-colors">{course.title}</h3>
                      <p className="text-dcs-text-gray max-w-2xl">{course.shortDescription}</p>

                      <div className="flex items-center gap-6 mt-6 text-sm font-medium">
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-dcs-purple">$</span>
                          {parseFloat(course.price).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 text-dcs-text-gray">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {course.modules?.length || 0} Modules
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap gap-4">
                      <button
                        onClick={() => navigate(`/instructor/course/${course.id}`)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-dcs-light-gray/80 hover:bg-dcs-light-gray text-white px-6 py-3 rounded-xl font-bold transition-all"
                      >
                        Edit content
                      </button>
                      <button
                        onClick={() => navigate(`/instructor/course/${course.id}/settings`)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-dcs-light-gray/80 hover:bg-dcs-light-gray text-white px-6 py-3 rounded-xl font-bold transition-all"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => handleTogglePublish(course.id, course.isPublished)}
                        className={`flex-1 lg:flex-none px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${course.isPublished
                          ? 'bg-gradient-to-r from-red-600/80 to-red-600 text-white hover:shadow-red-500/30'
                          : 'bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white hover:shadow-dcs-purple/30'
                          }`}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}