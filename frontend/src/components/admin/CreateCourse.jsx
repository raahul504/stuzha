import { useState } from 'react';
import { adminService } from '../../api/adminService';
import { showSuccess, showError } from '../../utils/toast';

export default function CreateCourse() {
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

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createCourse(formData);
      showSuccess('Course created successfully!');
      setFormData({
        title: '',
        slug: '',
        description: '',
        shortDescription: '',
        price: '',
        difficultyLevel: 'BEGINNER',
        estimatedDurationHours: '',
        isPublished: false,
      });
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Failed to create course');
    }
  };

  return (
    <div className="bg-dcs-black rounded-lg shadow-md p-6 w-auto max-w-[80vw]">
      <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
      
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
          <label className="block text-gray-700 mb-2">Slug *</label>
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
            <label className="block text-gray-700 mb-2">Price *</label>
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
          <label className="text-gray-700">Publish course</label>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-dcs-purple to-dcs-electric-indigo text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Create Course
        </button>
      </form>
    </div>
  );
}