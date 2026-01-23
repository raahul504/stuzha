import { useState } from 'react';
import { adminService } from '../../api/adminService';
import { showSuccess, showError } from '../../utils/toast';

export default function AddContent({ moduleId, onAdd }) {
  const [type, setType] = useState('VIDEO');
  const [formData, setFormData] = useState({ title: '', description: '', isPreview: false });
  const [videoFile, setVideoFile] = useState(null);
  const [articleFile, setArticleFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'VIDEO' && videoFile) {
        await adminService.uploadVideo(moduleId, { ...formData, videoDurationSeconds: 300 }, videoFile);
      } else if (type === 'ARTICLE' && articleFile) {
        await adminService.createContent(moduleId, formData, articleFile);
      } else if (type === 'ASSESSMENT') {
        await adminService.createContent(moduleId, { ...formData, contentType: 'ASSESSMENT' });
      }
      showSuccess('Content added!');
      setFormData({ title: '', description: '', isPreview: false });
      setVideoFile(null);
      setArticleFile(null);
      onAdd();
    } catch (err) {
      showError('Failed to add content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded border">
      <h4 className="font-semibold mb-3">Add Content</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded">
          <option value="VIDEO">Video</option>
          <option value="ARTICLE">Article</option>
          <option value="ASSESSMENT">Assessment</option>
        </select>

        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={2}
        />

        {type === 'VIDEO' && (
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full" />
        )}

        {type === 'ARTICLE' && (
          <div>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif" 
              onChange={(e) => setArticleFile(e.target.files[0])} 
              className="w-full" 
              required 
            />
            <p className="text-xs text-gray-500 mt-1">Supported: PDF, Word, PowerPoint, Excel, Images</p>
          </div>
        )}

        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={formData.isPreview}
            onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
            className="mr-2"
          />
          Make this a preview
        </label>

        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {loading ? 'Adding...' : 'Add {type}'}
        </button>
      </form>
    </div>
  );
}