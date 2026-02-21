import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../api/adminService';
import Navbar from '../components/Navbar';
import { showSuccess, showError } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { approvalService } from '../api/approvalService';

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

  const handleRequestPublish = async (courseId) => {
    try {
      await approvalService.requestPublish(courseId);
      showSuccess('Publish request submitted! Waiting for admin approval.');
      fetchCourses();
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Failed to request publish');
    }
  };

  const handleRequestUnpublish = async (courseId) => {
    try {
      await approvalService.requestUnpublish(courseId);
      showSuccess('Unpublish request submitted! Waiting for admin approval.');
      fetchCourses();
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Failed to request unpublish');
    }
  };

  const getStatusBadge = (course) => {
    switch (course.approvalStatus) {
      case 'PUBLISHED':
        return (
          <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
            Published
          </span>
        );
      case 'PENDING_PUBLISH':
        return (
          <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            Pending Approval
          </span>
        );
      case 'PENDING_UNPUBLISH':
        return (
          <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Unpublish Pending
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-dcs-text-gray/10 text-dcs-text-gray border border-dcs-text-gray/20">
            Draft
          </span>
        );
    }
  };

  const getActionButton = (course) => {
    switch (course.approvalStatus) {
      case 'DRAFT':
        return (
          <button
            onClick={() => handleRequestPublish(course.id)}
            className="flex-1 lg:flex-none px-8 py-3 rounded-xl font-bold shadow-lg transition-all bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white hover:shadow-dcs-purple/30"
          >
            Request Publish
          </button>
        );
      case 'PENDING_PUBLISH':
        return (
          <button
            disabled
            className="flex-1 lg:flex-none px-8 py-3 rounded-xl font-bold bg-dcs-text-gray/20 text-dcs-text-gray cursor-not-allowed"
          >
            Awaiting Approval
          </button>
        );
      case 'PUBLISHED':
        return (
          <button
            onClick={() => handleRequestUnpublish(course.id)}
            className="flex-1 lg:flex-none px-8 py-3 rounded-xl font-bold shadow-lg transition-all bg-gradient-to-r from-red-600/80 to-red-600 text-white hover:shadow-red-500/30"
          >
            Request Unpublish
          </button>
        );
      case 'PENDING_UNPUBLISH':
        return (
          <button
            disabled
            className="flex-1 lg:flex-none px-8 py-3 rounded-xl font-bold bg-dcs-text-gray/20 text-dcs-text-gray cursor-not-allowed"
          >
            Unpublish Pending
          </button>
        );
      default:
        return null;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-dcs-dark-gray to-dcs-light-gray/50 border border-dcs-purple/20 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dcs-text-gray text-sm font-bold uppercase tracking-widest mb-2">Total Courses</p>
                <p className="text-4xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-16 h-16 bg-dcs-purple/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-dcs-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-dcs-dark-gray to-dcs-light-gray/50 border border-green-500/20 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dcs-text-gray text-sm font-bold uppercase tracking-widest mb-2">Published</p>
                <p className="text-4xl font-bold text-green-400">{stats.published}</p>
              </div>
              <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-dcs-dark-gray to-dcs-light-gray/50 border border-dcs-text-gray/20 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dcs-text-gray text-sm font-bold uppercase tracking-widest mb-2">Drafts</p>
                <p className="text-4xl font-bold text-dcs-text-gray">{stats.draft}</p>
              </div>
              <div className="w-16 h-16 bg-dcs-text-gray/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-dcs-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
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
                        {getStatusBadge(course)}
                        {course.difficultyLevel && (
                          <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-dcs-purple/10 text-dcs-purple border border-dcs-purple/20">
                            {course.difficultyLevel}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-dcs-purple transition-colors">{course.title}</h3>
                      <p className="text-dcs-text-gray max-w-2xl">{course.shortDescription}</p>

                      {/* Show disapproval message if exists */}
                      {course.approvalMessage && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-sm font-bold text-red-400 mb-1">Admin Feedback:</p>
                          <p className="text-sm text-red-300">{course.approvalMessage}</p>
                        </div>
                      )}

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
                      {getActionButton(course)}
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