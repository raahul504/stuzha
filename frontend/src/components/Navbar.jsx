import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
          LMS Platform
        </h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/courses')} className="text-gray-700 hover:text-blue-600">
            Courses
          </button>
          {isAuthenticated && (
            <>
              <button onClick={() => navigate('/my-courses')} className="text-gray-700 hover:text-blue-600">
                My Courses
              </button>
              {(user?.role === 'ADMIN') && (
                <button onClick={() => navigate('/admin')} className="text-gray-700 hover:text-blue-600">
                  Admin
                </button>
              )}
              {(user?.role === 'INSTRUCTOR') && (
                <button onClick={() => navigate('/instructor')} className="text-gray-700 hover:text-blue-600">
                  Instructor
                </button>
              )}
              <span className="text-gray-700">{user.firstName}</span>
              <button onClick={() => navigate('/profile')} className="text-gray-700 hover:text-blue-600">
                Profile
              </button>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-blue-600">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}