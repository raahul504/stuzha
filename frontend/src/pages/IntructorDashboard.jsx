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
    <div className="min-h-screen bg-dcs-black">
      <Navbar />

      <div className="container mx-auto px-4 py-8 bg-dcs-black">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-gray-600">Manage your courses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dcs-dark-gray rounded-lg shadow-lg p-6 border border-dcs-purple/20">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Courses</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-dcs-dark-gray rounded-lg shadow-lg p-6 border border-dcs-purple/20">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Published</h3>
            <p className="text-4xl font-bold text-green-600">{stats.published}</p>
          </div>
          <div className="bg-dcs-dark-gray rounded-lg shadow-lg p-6 border border-dcs-purple/20">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Drafts</h3>
            <p className="text-4xl font-bold text-gray-600">{stats.draft}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/instructor/create-course')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            + Create New Course
          </button>
        </div>

        {/* Courses List */}
        <div className="bg-dcs-dark-gray rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">My Courses</h2>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-4">You haven't created any courses yet.</p>
              <button
                onClick={() => navigate('/instructor/create-course')}
                className="bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {courses.map((course) => (
                <div key={course.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{course.shortDescription}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className={`px-3 py-1 rounded ${
                          course.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span>${parseFloat(course.price).toFixed(2)}</span>
                        {course.difficultyLevel && (
                          <span className="capitalize">{course.difficultyLevel.toLowerCase()}</span>
                        )}
                        <span>{course.modules?.length || 0} modules</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/instructor/course/${course.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Edit Content
                      </button>
                      <button
                        onClick={() => navigate(`/instructor/course/${course.id}/settings`)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => handleTogglePublish(course.id, course.isPublished)}
                        className={`px-4 py-2 rounded text-sm ${
                          course.isPublished
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold'
                            : 'bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold'
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