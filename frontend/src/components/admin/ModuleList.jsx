import { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import AddContent from './AddContent';
import AddQuestion from './AddQuestion';

export default function ModuleList({ modules, courseId, onUpdate }) {
  const [expandedModule, setExpandedModule] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

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

  const handleEdit = (module) => {
    setEditingModule(module.id);
    setEditForm({ title: module.title, description: module.description || '' });
  };

  const handleSaveEdit = async (moduleId) => {
    try {
      await adminService.updateModule(moduleId, editForm);
      alert('Module updated');
      setEditingModule(null);
      onUpdate();
    } catch (err) {
      alert('Failed to update');
    }
  };

  const handleMoveModule = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    const reordered = [...modules];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    const orders = reordered.map((mod, idx) => ({
      moduleId: mod.id,
      orderIndex: idx,
    }));

    try {
      await adminService.reorderModules(courseId, orders);
      onUpdate();
    } catch (err) {
      alert('Failed to reorder');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Course Modules</h2>
      
      {modules.map((module, index) => (
        <div key={module.id} className="bg-gray-50 rounded-lg">
          {editingModule === module.id ? (
            <div className="p-4 space-y-2">
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={2}
              />
              <div className="flex space-x-2">
                <button onClick={() => handleSaveEdit(module.id)} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                <button onClick={() => setEditingModule(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="p-4 flex justify-between items-center">
              <div className="flex-1 cursor-pointer" onClick={() => toggleModule(module.id)}>
                <h3 className="font-bold">{module.title}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMoveModule(index, 'up')}
                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveModule(index, 'down')}
                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleEdit(module); }} className="text-blue-600 hover:underline text-sm">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }} className="text-red-600 hover:underline text-sm">Delete</button>
                <span className="cursor-pointer" onClick={() => toggleModule(module.id)}>{expandedModule === module.id ? '▲' : '▼'}</span>
              </div>
            </div>
          )}

          {expandedModule === module.id && (
            <div className="px-4 pb-4">
              <ContentList moduleId={module.id} onUpdate={onUpdate} />
              <AddContent moduleId={module.id} onAdd={onUpdate} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ContentList({ moduleId, onUpdate }) {
  const [content, setContent] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);

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

  const fetchQuestions = async (contentId) => {
    try {
      const data = await adminService.getQuestions(contentId);
      setQuestions(data.questions);
      setSelectedAssessment(contentId);
    } catch (err) {
      console.error('Failed to load questions');
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

  const handleMoveContent = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.length) return;

    const reordered = [...content];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    const orders = reordered.map((item, idx) => ({
      contentId: item.id,
      orderIndex: idx,
    }));

    try {
      await adminService.reorderContent(moduleId, orders);
      onUpdate();
    } catch (err) {
      alert('Failed to reorder');
    }
  };

  return (
    <div className="mb-4">
      <h4 className="font-semibold mb-2">Content Items</h4>
      {content.length === 0 ? (
        <p className="text-sm text-gray-500">No content yet.</p>
      ) : (
        <ul className="space-y-2">
          {content.map((item, index) => (
            <li key={item.id}>
              <div className="flex justify-between items-center bg-white p-2 rounded">
                <span className="text-sm">
                  {item.contentType === 'VIDEO' && '🎥'} 
                  {item.contentType === 'ARTICLE' && '📄'} 
                  {item.contentType === 'ASSESSMENT' && '✏️'} {item.title}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMoveContent(index, 'up')}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveContent(index, 'down')}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                  {item.contentType === 'ASSESSMENT' && (
                    <button
                      onClick={() => fetchQuestions(item.id)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Questions
                    </button>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 text-xs hover:underline">
                    Delete
                  </button>
                </div>
              </div>

              {selectedAssessment === item.id && (
                <div className="ml-4 mt-2 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-semibold mb-2">{questions.length} Questions</p>
                  {questions.map((q, idx) => (
                    <div key={q.id} className="text-xs mb-3 p-3 bg-white rounded border">
                      <p className="font-semibold mb-2">
                        {idx + 1}. {q.questionText}
                      </p>
                      <p className="text-gray-600 mb-1">Type: {q.questionType}</p>
                      
                      {q.questionType === 'MCQ' ? (
                        <div className="ml-3 space-y-1">
                          {q.optionA && <p>A. {q.optionA}</p>}
                          {q.optionB && <p>B. {q.optionB}</p>}
                          {q.optionC && <p>C. {q.optionC}</p>}
                          {q.optionD && <p>D. {q.optionD}</p>}
                        </div>
                      ) : (
                        <div className="ml-3 space-y-1">
                          <p>• True</p>
                          <p>• False</p>
                        </div>
                      )}
                      
                      <p className="mt-2 text-green-700 font-medium">
                        Correct Answer: {q.correctAnswer}
                      </p>
                      
                      {q.explanation && (
                        <p className="mt-1 text-gray-600 italic">
                          Explanation: {q.explanation}
                        </p>
                      )}
                      
                      <p className="mt-1 text-gray-500">
                        Points: {q.points}
                      </p>
                    </div>
                  ))}
                  <AddQuestion contentId={item.id} onAdd={() => fetchQuestions(item.id)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}