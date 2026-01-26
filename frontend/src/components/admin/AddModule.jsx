import { useState } from 'react';
import { adminService } from '../../api/adminService';
import { showSuccess, showError } from '../../utils/toast';

export default function AddModule({ courseId, onAdd }) {
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createModule(courseId, formData);
      alert('Module added!');
      setFormData({ title: '', description: '' });
      onAdd();
    } catch (err) {
      console.error('Full error:', JSON.stringify(err.response?.data, null, 2)); // Log the actual error
      alert('Failed to add module');
    }
  };

  return (
    <div className="bg-dcs-dark-gray rounded-lg shadow-lg p-6 border border-dcs-purple/20">
      <h2 className="text-xl font-bold mb-4 text-white">Add Module</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none transition-all"
          />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r  from-dcs-purple to-dcs-electric-indigo text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold">
          Add Module
        </button>
      </form>
    </div>
  );
}