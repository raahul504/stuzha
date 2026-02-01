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
  const [showFilters, setShowFilters] = useState(false);

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
    <div className="min-h-screen bg-dcs-black">
      <Navbar />

      {/* Header */}
      <div className="pt-27 pb-5 px-8">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-5xl leading-normal text-center mb-2 bg-gradient-to-r from-white to-dcs-purple bg-clip-text text-transparent">
            Explore Our Programs
          </h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto" style={{ padding: '1rem 2rem' }}>
        {/* Search & Filters */}
        <div className="mb-12">
          <div className="flex gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="w-full px-6 py-4 bg-dcs-dark-gray border border-dcs-purple/30 rounded-full text-white placeholder-dcs-text-gray focus:border-dcs-purple focus:outline-none transition-all"
              />
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-dcs-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-8 py-4 bg-dcs-purple/20 border border-dcs-purple/50 rounded-full text-white font-semibold hover:bg-dcs-purple/30 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>

              {/* Dropdown */}
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-dcs-dark-gray border border-dcs-purple/30 rounded-2xl p-6 shadow-2xl z-50">
                  <div className="mb-4">
                    <label className="block text-white text-sm font-semibold mb-2">
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-4 py-3 bg-dcs-black border border-dcs-purple/30 rounded-lg text-white focus:border-dcs-purple focus:outline-none"
                    >
                      <option value="">All Levels</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-white text-sm font-semibold mb-2">
                      Price Range
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-4 py-3 bg-dcs-black border border-dcs-purple/30 rounded-lg text-white focus:border-dcs-purple focus:outline-none"
                    >
                      <option value="">All Prices</option>
                      <option value="free">Free</option>
                      <option value="under50">Under $50</option>
                      <option value="50to100">$50 - $100</option>
                      <option value="over100">Over $100</option>
                    </select>
                  </div>

                  {(selectedDifficulty || priceRange) && (
                    <button
                      onClick={clearFilters}
                      className="w-full py-2 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Count
          <div className="mt-4  text-sm text-dcs-text-gray">
            Showing {filteredCourses.length} of {courses.length} courses
          </div> */}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dcs-text-gray text-lg">
              {courses.length === 0 
                ? 'No courses available yet.' 
                : 'No courses match your filters. Try adjusting your search.'}
            </p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                className="bg-dcs-dark-gray rounded-[20px] overflow-hidden border border-dcs-purple/10 transition-all duration-400 cursor-pointer flex flex-col"
                style={{ 
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-15px)';
                  e.currentTarget.style.borderColor = '#9D50BB';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(157, 80, 187, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(157, 80, 187, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Banner */}
                <div 
                  className="h-[200px] flex items-center justify-center text-2xl font-bold text-white border-b-2 border-dcs-purple"
                  style={{ background: 'linear-gradient(135deg, #6E48AA, #0A0A0A)' }}
                >
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{course.title}</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex-grow flex flex-col">
                  {/* Tag */}
                  {course.isPurchased ? (
                    <span className="bg-dcs-purple/20 text-dcs-purple px-3 py-1.5 rounded text-xs font-bold uppercase mb-4 inline-block">
                      Enrolled
                    </span>
                  ) : course.difficultyLevel ? (
                    <span className="bg-dcs-purple/20 text-dcs-purple px-3 py-1.5 rounded text-xs font-bold uppercase mb-4 inline-block">
                      {course.difficultyLevel}
                    </span>
                  ) : null}

                  <h3 className="text-white text-xl mb-4 font-bold">{course.title}</h3>
                  <p className="text-dcs-text-gray text-sm mb-6 line-clamp-2 flex-grow">
                    {course.shortDescription || course.description}
                  </p>

                  {/* Footer */}
                  <div className="pt-6 border-t border-white/5 flex justify-between items-center mt-auto">
                    <span className="text-dcs-purple font-bold text-xl">
                      ${parseFloat(course.price).toFixed(2)}
                    </span>
                    <span className="text-white text-sm">View Details →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <footer className="bg-dcs-dark-gray py-16 px-8 text-center border-t border-dcs-purple/20 mt-20" style={{ borderTop: '1px solid rgba(157, 80, 187, 0.2)' }}>
        <h3 className="text-dcs-purple mb-4 text-2xl font-bold">Ready to start?</h3>
        <p className="text-dcs-text-gray mb-8">Join thousands of students transforming their careers.</p>
        <button
          onClick={() => navigate('/courses')}
          className="btn-purple"
        >
          Enroll in a Course
        </button>
      </footer>
    </div>
  );
}