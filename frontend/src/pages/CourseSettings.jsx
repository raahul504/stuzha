import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../api/adminService';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import { showSuccess, showError } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { categoryService } from '../api/categoryService';

export default function CourseSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    difficultyLevel: 'BEGINNER',
    estimatedDurationHours: '',
    courseIncludes: '',
    requirements: '',
    targetAudience: '',
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
        courseIncludes: c.courseIncludes || '',
        requirements: c.requirements || '',
        targetAudience: c.targetAudience || '',
        isPublished: c.isPublished,
      });
      // Set selected categories from the course
      if (c.categories && c.categories.length > 0) {
        setSelectedCategoryIds(c.categories.map(cc => cc.categoryId));
      }
    } catch (err) {
      showError('Failed to load course');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryService.getAllCategories()
      .then(data => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const data = await categoryService.createCategory(newCategoryName.trim());
      showSuccess('Category created!');
      setCategories([...categories, data.category]);
      setSelectedCategoryIds([...selectedCategoryIds, data.category.id]);
      setNewCategoryName('');
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Failed to create category');
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const removeCategory = (categoryId) => {
    setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.name || '';
  };

  const filterCategories = (cats) => {
    if (!categorySearchTerm.trim()) return cats;
    const searchLower = categorySearchTerm.toLowerCase();
    return cats.filter(cat => 
      cat.name.toLowerCase().includes(searchLower) ||
      (cat.subCategories && cat.subCategories.some(sub => 
        sub.name.toLowerCase().includes(searchLower)
      ))
    );
  };

  const filterSubCategories = (subCats) => {
    if (!categorySearchTerm.trim()) return subCats;
    const searchLower = categorySearchTerm.toLowerCase();
    return subCats.filter(sub => sub.name.toLowerCase().includes(searchLower));
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
        categoryIds: selectedCategoryIds,
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
                <label className="block text-gray-700 mb-2">Categories</label>
                <div className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white min-h-[120px]">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedCategoryIds.map(catId => (
                      <span key={catId} className="flex items-center gap-1.5 bg-dcs-purple/20 border border-dcs-purple/40 text-dcs-purple px-3 py-1.5 rounded-full text-sm font-medium">
                        {getCategoryName(catId)}
                        <button type="button" onClick={() => removeCategory(catId)} className="text-dcs-purple hover:text-white transition-colors ml-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {/* Search bar */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full px-3 py-2 bg-dcs-light-gray border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:border-dcs-purple focus:outline-none"
                    />
                  </div>

                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {filterCategories(categories.filter(cat => cat.level === 0).sort((a, b) => a.orderIndex - b.orderIndex)).map(mainCat => (
                      <div key={mainCat.id}>
                        <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-dcs-light-gray cursor-pointer transition-colors font-semibold">
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(mainCat.id)}
                            onChange={() => toggleCategory(mainCat.id)}
                            className="rounded border-gray-600"
                          />
                          <span className="text-sm">{mainCat.name}</span>
                        </label>
                        {mainCat.subCategories && mainCat.subCategories.length > 0 && (
                          <div className="ml-6 space-y-1 mt-1">
                            {filterSubCategories(mainCat.subCategories.sort((a, b) => a.orderIndex - b.orderIndex)).map(subCat => (
                              <label key={subCat.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-dcs-light-gray cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedCategoryIds.includes(subCat.id)}
                                  onChange={() => toggleCategory(subCat.id)}
                                  className="rounded border-gray-600"
                                />
                                <span className="text-xs text-gray-400">{subCat.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Create New Category</label>
                <div className="flex gap-2">
                  <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Web Development"
                    className="flex-1 px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none" />
                  <button type="button" onClick={handleCreateCategory}
                    className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
                    + Add
                  </button>
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

              <div>
                <label className="block text-gray-700 mb-2">This Course Includes</label>
                <textarea
                  name="courseIncludes"
                  value={formData.courseIncludes}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter each point on a new line, e.g.:&#10;10 hours on-demand video&#10;5 articles&#10;Certificate of completion&#10;Lifetime access"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Enter each point on a new line (press Enter after each point)</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter each requirement on a new line, e.g.:&#10;Basic understanding of HTML&#10;A computer with internet access&#10;Willingness to learn"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Enter each requirement on a new line</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Who This Course Is For</label>
                <textarea
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter each target audience on a new line, e.g.:&#10;Beginners who want to learn web development&#10;Students looking to build their first website&#10;Anyone interested in coding"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-dcs-black text-white focus:border-dcs-purple focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Enter each target audience on a new line</p>
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