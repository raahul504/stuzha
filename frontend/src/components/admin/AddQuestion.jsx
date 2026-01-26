import { useState } from 'react';
import { adminService } from '../../api/adminService';
import { showSuccess, showError } from '../../utils/toast';

export default function AddQuestion({ contentId, onAdd }) {
  const [type, setType] = useState('MCQ');
  const [formData, setFormData] = useState({
    questionText: '',
    correctAnswer: '',
    explanation: '',
    points: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build the payload based on question type
      const payload = {
        questionType: type,
        questionText: formData.questionText,
        correctAnswer: formData.correctAnswer,
        points: Number(formData.points) || 1
      };

      // Only include explanation if it's not empty
      if (formData.explanation.trim()) {
        payload.explanation = formData.explanation;
      }

      // Only include options for MCQ questions
      if (type === 'MCQ') {
        payload.optionA = formData.optionA;
        payload.optionB = formData.optionB;
        if (formData.optionC.trim()) payload.optionC = formData.optionC;
        if (formData.optionD.trim()) payload.optionD = formData.optionD;
      }

      console.log('Sending data:', payload); // Debug
      await adminService.addQuestion(contentId, payload);
      showSuccess('Question added!');
      setFormData({ 
        questionText: '', 
        correctAnswer: '', 
        explanation: '', 
        points: '',
        optionA: '', 
        optionB: '', 
        optionC: '', 
        optionD: '' 
      });
      onAdd();
    } catch (err) {
      console.error('Full error:', err); // Debug
      console.error('Response data:', err.response?.data); // Debug
      console.error('Response status:', err.response?.status); // Debug
      showError(err.response?.data?.error?.message || 'Failed to add question');
    }
  };

  return (
    <div className="bg-dcs-dark-gray p-6 rounded-lg border border-dcs-purple/20">
      <h4 className="font-semibold mb-4 text-white text-lg">Add Question</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none">
          <option value="MCQ">Multiple Choice</option>
          <option value="TRUE_FALSE">True/False</option>
        </select>

        <textarea
          placeholder="Question"
          value={formData.questionText}
          onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
          rows={2}
        />

        {type === 'MCQ' ? (
          <>
            <input
              type="text"
              placeholder="Option A"
              value={formData.optionA}
              onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
            />
            <input
              type="text"
              placeholder="Option B"
              value={formData.optionB}
              onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
            />
            <input
              type="text"
              placeholder="Option C (optional)"
              value={formData.optionC}
              onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
            />
            <input
              type="text"
              placeholder="Option D (optional)"
              value={formData.optionD}
              onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
            />
            <input
              type="text"
              placeholder="Correct Answer (A/B/C/D)"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value.toUpperCase() })}
              required
              maxLength={1}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
            />
          </>
        ) : (
          <select
            value={formData.correctAnswer}
            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
          >
            <option value="">Select correct answer</option>
            <option value="TRUE">True</option>
            <option value="FALSE">False</option>
          </select>
        )}

        <textarea
          placeholder="Explanation (optional)"
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
          rows={2}
        />

        <input
            placeholder="Points"
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            required
        />

        <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold">
          Add Question
        </button>
      </form>
    </div>
  );
}