import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowDropdown(false);
  };

  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + (lastName.charAt(0) || '')).toUpperCase() || 'U';
  };

  return (
    <nav className="fixed top-0 w-full bg-dcs-black/95 backdrop-blur-lg z-50 border-b border-dcs-purple/20 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
        
        <ul className="flex gap-6 list-none items-center">
          <li>
            <button 
              onClick={() => navigate('/')} 
              className="text-white no-underline font-medium text-sm transition-all duration-300 hover:text-dcs-purple"
            >
              Home
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('/courses')} 
              className="text-white no-underline font-medium text-sm transition-all duration-300 hover:text-dcs-purple"
            >
              Courses
            </button>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <button 
                  onClick={() => navigate('/my-courses')} 
                  className="text-white no-underline font-medium text-sm transition-all duration-300 hover:text-dcs-purple"
                >
                  My Courses
                </button>
              </li>
              {(user?.role === 'ADMIN') && (
                <li>
                  <button 
                    onClick={() => navigate('/admin')} 
                    className="text-white no-underline font-medium text-sm transition-all duration-300 hover:text-dcs-purple"
                  >
                    Admin
                  </button>
                </li>
              )}
              {(user?.role === 'INSTRUCTOR') && (
                <li>
                  <button 
                    onClick={() => navigate('/instructor')} 
                    className="text-white no-underline font-medium text-sm transition-all duration-300 hover:text-dcs-purple"
                  >
                    Instructor
                  </button>
                </li>
              )}
              <li className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center gap-2.5 cursor-pointer px-3 py-1.5 rounded-full bg-dcs-light-gray border border-dcs-purple/30 hover:border-dcs-purple/50 transition-all"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="w-8 h-8 bg-dcs-purple text-white rounded-full flex justify-center items-center font-bold text-sm">
                    {getInitials()}
                  </div>
                  <span className="text-white text-sm">{user?.firstName || 'User'}</span>
                </div>
                {showDropdown && (
                  <div className="absolute top-11 right-0 bg-dcs-dark-gray border border-dcs-purple rounded-xl w-60 p-6 z-[1100] shadow-2xl">
                    <h4 className="my-2 text-white font-semibold">
                      {user?.firstName} {user?.lastName}
                    </h4>
                    <p className="text-xs text-dcs-text-gray mb-3">{user?.email}</p>
                    <hr className="border-0 border-t border-gray-700 my-2.5" />
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left text-white hover:text-dcs-purple transition-colors text-sm py-1"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-center text-red-400 no-underline font-bold text-sm mt-2 hover:text-red-500 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </li>
            </>
          )}
          {!isAuthenticated && (
            <>
              <li>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-white no-underline font-medium text-sm transition-all duration-300 hover:text-dcs-purple"
                >
                  Login
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/register')} 
                  className="bg-dcs-purple text-white px-6 py-2 rounded-full no-underline font-bold hover:bg-dcs-dark-purple transition-all"
                >
                  Register
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}