import { useState } from 'react';
import { adminService } from '../../api/adminService';
import { showSuccess, showError } from '../../utils/toast';

export default function AddContent({ moduleId, onAdd }) {
  const [type, setType] = useState('VIDEO');
  const [formData, setFormData] = useState({ title: '', description: '', isPreview: false });
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [articleFile, setArticleFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    
    if (file) {
      // Extract video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setVideoDuration(Math.ceil(video.duration));
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'VIDEO' && videoFile) {
        if (!videoDuration) {
          showError('Could not determine video duration. Please try again.');
          setLoading(false);
          return;
        }
        await adminService.uploadVideo(moduleId, { ...formData, videoDurationSeconds: videoDuration }, videoFile);
      } else if (type === 'ARTICLE' && articleFile) {
        await adminService.uploadArticle(moduleId, formData, articleFile);
      } else if (type === 'ASSESSMENT') {
        await adminService.createContent(moduleId, { ...formData, contentType: 'ASSESSMENT' });
      }
      showSuccess('Content added!');
      setFormData({ title: '', description: '', isPreview: false });
      setVideoFile(null);
      setVideoDuration(null);
      setArticleFile(null);
      onAdd();
    } catch (err) {
      showError('Failed to add content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dcs-dark-gray p-6 rounded-lg border border-dcs-purple/20">
      <h4 className="font-semibold mb-4 text-white text-lg">Add Content</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none">
          <option value="ARTICLE">Article</option>
          <option value="ASSESSMENT">Assessment</option>
          <option value="VIDEO">Video</option>
        </select>

        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
          rows={2}
        />

        {type === 'VIDEO' && (
          <div>
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleVideoFileChange}
              className="w-full px-2 py-1 border border-gray-600 rounded bg-gray"
              required 
            />
            {videoDuration && (
              <p className="text-xs text-green-400 mt-1">Duration: {videoDuration} seconds</p>
            )}
          </div>
        )}

        {type === 'ARTICLE' && (
          <div>
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp" 
              onChange={(e) => setArticleFile(e.target.files[0])} 
              className="w-full" 
              required 
            />
            <p className="text-xs text-gray-500 mt-1">Supported: PDF, Images</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold">
          {loading ? 'Adding...' : `ADD ${type}`}
        </button>
      </form>
    </div>
  );
}