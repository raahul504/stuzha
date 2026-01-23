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
    <div className="bg-white rounded-lg shadow-md p-6">
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
            className="w-full px-3 py-2 border rounded"
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
            className="w-full px-3 py-2 border rounded"
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
            className="w-full px-3 py-2 border rounded"
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
            className="w-full px-3 py-2 border rounded"
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
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Difficulty</label>
            <select
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
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
            className="w-full px-3 py-2 border rounded"
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
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          Create Course
        </button>
      </form>
    </div>
  );
}