// frontend/src/pages/Courses.jsx - UPDATE

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../api/courseService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedDifficulty, priceRange, courses]);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      const published = data.courses.filter(c => c.isPublished);
      setCourses(published);
      setFilteredCourses(published);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(course => course.difficultyLevel === selectedDifficulty);
    }

    // Price filter
    if (priceRange) {
      filtered = filtered.filter(course => {
        const price = parseFloat(course.price);
        switch (priceRange) {
          case 'free':
            return price === 0;
          case 'under50':
            return price > 0 && price < 50;
          case '50to100':
            return price >= 50 && price <= 100;
          case 'over100':
            return price > 100;
          default:
            return true;
        }
      });
    }

    setFilteredCourses(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('');
    setPriceRange('');
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Available Courses</h1>
          <p className="text-gray-600 mt-2">Browse and enroll in our courses</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Search Courses
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Prices</option>
                <option value="free">Free</option>
                <option value="under50">Under $50</option>
                <option value="50to100">$50 - $100</option>
                <option value="over100">Over $100</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedDifficulty || priceRange) && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {courses.length === 0 
                ? 'No courses available yet.' 
                : 'No courses match your filters. Try adjusting your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {course.title.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Purchased Badge */}
                  {course.isPurchased && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2">
                      Enrolled
                    </span>
                  )}

                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.shortDescription || course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    {course.difficultyLevel && (
                      <span className="capitalize">{course.difficultyLevel.toLowerCase()}</span>
                    )}
                    {course.estimatedDurationHours && (
                      <span>{course.estimatedDurationHours}h</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ${parseFloat(course.price).toFixed(2)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course.id);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}