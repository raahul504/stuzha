import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to LMS Platform</h1>
          <p className="text-gray-600 mb-8">Please login or register to continue</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
            LMS Platform
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/courses')}
              className="text-gray-700 hover:text-blue-600"
            >
              Courses
            </button>
            <button
              onClick={() => navigate('/my-courses')}
              className="text-gray-700 hover:text-blue-600"
            >
              My Courses
            </button>
            <span className="text-gray-700">
              {user.firstName} {user.lastName}
            </span>
            <button onClick={() => navigate('/profile')} className="text-gray-700 hover:text-blue-600">
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>

          <div className="mt-6 space-x-4">
            <button
              onClick={() => navigate('/courses')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Browse All Courses
            </button>
            <button
              onClick={() => navigate('/my-courses')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              My Enrolled Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}