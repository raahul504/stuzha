import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../api/adminService';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import { showSuccess, showError } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CourseSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    difficultyLevel: 'BEGINNER',
    estimatedDurationHours: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await adminService.getCourseById(id);
      const c = data.course;
      setCourse(c);
      setFormData({
        title: c.title,
        slug: c.slug,
        description: c.description,
        shortDescription: c.shortDescription || '',
        price: c.price,
        difficultyLevel: c.difficultyLevel || 'BEGINNER',
        estimatedDurationHours: c.estimatedDurationHours || '',
        isPublished: c.isPublished,
      });
    } catch (err) {
      showError('Failed to load course');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Prepare data with proper type conversions
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        estimatedDurationHours: formData.estimatedDurationHours 
          ? parseInt(formData.estimatedDurationHours) 
          : null,
      };
      await adminService.updateCourse(id, dataToSend);
      showSuccess('Course updated successfully');
      navigate(-1);
    } catch (err) {
      showError('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteCourse(id);
      showSuccess('Course deleted successfully');
      const isAdmin = window.location.pathname.includes('/admin/');
      navigate(isAdmin ? '/admin' : '/instructor');
    } catch (err) {
      showError('Failed to delete course');
    }
  };

  if (loading) return <LoadingSpinner message="Loading course settings..." />;

  return (
    <div className="min-h-screen bg-dcs-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mt-13 mb-6">
            <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
              ← Back
            </button>
            <h1 className="text-3xl font-bold">Course Settings</h1>
          </div>

          <div className="bg-dcs-dark-gray rounded-lg shadow-md p-6 border border-dcs-purple/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Price (USD) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Difficulty</label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Estimated Duration (hours)</label>
                <input
                  type="number"
                  name="estimatedDurationHours"
                  value={formData.estimatedDurationHours}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-gray-700">Published</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-6 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Delete Course
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Course"
        message="Are you sure? This will delete all modules, content, and student progress. This action cannot be undone."
        confirmText="Delete Course"
      />
    </div>
  );
}