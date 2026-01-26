import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateCourse from '../components/admin/CreateCourse';
import ManageCourses from '../components/admin/ManageCourses';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('courses');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'ADMIN' && user?.role !== 'INSTRUCTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Access Denied. Admin/Instructor only.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dcs-dark-gray">
      <Navbar />
      <nav className="bg-dcs-black shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          {/*<div className="flex items-center space-x-4">
            <button onClick={() => navigate('/')} className="text-gray-700 hover:text-blue-600">
              Home
            </button>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>*/}
        </div>
      </nav>
      <div className="container mx-auto mt-10 px-4 py-4 flex justify-between">
          <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'courses' 
                ? 'bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white shadow-lg' 
                : 'bg-dcs-light-gray text-dcs-text-gray hover:text-white'
            }`}
          >
            Manage Courses
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'create' 
                ? 'bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white shadow-lg' 
                : 'bg-dcs-light-gray text-dcs-text-gray hover:text-white'
            }`}
          >
            Create Course
          </button>
        </div>

        {activeTab === 'courses' && <ManageCourses />}
        {activeTab === 'create' && <CreateCourse />}
      </div>
    </div>
  );
}