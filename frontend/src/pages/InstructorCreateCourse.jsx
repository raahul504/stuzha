// frontend/src/pages/InstructorCreateCourse.jsx - NEW FILE

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../api/adminService';
import Navbar from '../components/Navbar';
import { showSuccess, showError } from '../utils/toast';

export default function InstructorCreateCourse() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminService.createCourse(formData);
      showSuccess('Course created successfully!');
      navigate(`/instructor/course/${response.course.id}`);
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dcs-black">
      <Navbar />

      <div className="container mx-auto px-4 py-8 bg-dcs-black">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/instructor')}
              className="text-blue-600 hover:underline mb-4 mt-12"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Create New Course</h1>
          </div>

          <div className="bg-dcs-black rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Slug * (URL-friendly)</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
                  placeholder="intro-to-react"
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
                 className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
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
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Difficulty</label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
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
                <label className="text-gray-700">Publish course immediately</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}