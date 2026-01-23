import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../api/userService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { showSuccess, showError } from '../utils/toast';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);

  // Profile info form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Fetch fresh profile data instead of using AuthContext user
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfileForm({
          firstName: data.profile.firstName || '',
          lastName: data.profile.lastName || '',
          email: data.profile.email || '',
        });
      } catch (err) {
        console.error('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await userService.updateProfile(profileForm);
      showSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error caught:', err); // Debug
      showError(err.response?.data?.error?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'password'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                Change Password
              </button>
            </div>

            <div className="p-6">

              {/* Profile Info Tab */}
              {activeTab === 'info' && (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Role:</strong> {user?.role}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Member since:</strong>{' '}
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      minLength={8}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}