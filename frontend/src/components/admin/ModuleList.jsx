import { useState } from 'react';
import { adminService } from '../../api/adminService';
import AddContent from './AddContent';

export default function ModuleList({ modules, courseId, onUpdate }) {
  const [expandedModule, setExpandedModule] = useState(null);

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete this module?')) return;
    try {
      await adminService.deleteModule(moduleId);
      alert('Module deleted');
      onUpdate();
    } catch (err) {
      alert('Failed to delete module');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Course Modules</h2>
      
      {modules.length === 0 ? (
        <p className="text-gray-600">No modules yet. Add one to get started.</p>
      ) : (
        modules.map((module) => (
          <div key={module.id} className="bg-white rounded-lg shadow-md">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleModule(module.id)}>
              <div>
                <h3 className="font-bold">{module.title}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
                <span>{expandedModule === module.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedModule === module.id && (
              <div className="border-t p-4 bg-gray-50">
                <ContentList moduleId={module.id} onUpdate={onUpdate} />
                <AddContent moduleId={module.id} onAdd={onUpdate} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function ContentList({ moduleId, onUpdate }) {
  const [content, setContent] = useState([]);

  useEffect(() => {
    fetchContent();
  }, [moduleId]);

  const fetchContent = async () => {
    try {
      const data = await adminService.getContent(moduleId);
      setContent(data.content);
    } catch (err) {
      console.error('Failed to load content');
    }
  };

  const handleDelete = async (contentId) => {
    if (!confirm('Delete this content?')) return;
    try {
      await adminService.deleteContent(contentId);
      alert('Content deleted');
      onUpdate();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="mb-4">
      <h4 className="font-semibold mb-2">Content Items</h4>
      {content.length === 0 ? (
        <p className="text-sm text-gray-500">No content yet.</p>
      ) : (
        <ul className="space-y-2">
          {content.map((item) => (
            <li key={item.id} className="flex justify-between items-center bg-white p-2 rounded">
              <span className="text-sm">
                {item.contentType === 'VIDEO' && '🎥'} 
                {item.contentType === 'ARTICLE' && '📄'} 
                {item.contentType === 'ASSESSMENT' && '✏️'} {item.title}
              </span>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 text-xs hover:underline">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}