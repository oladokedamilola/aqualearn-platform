import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/course';
import CourseCard from '../components/CourseCard';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const Courses = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'all');
  const [error, setError] = useState(null);

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: '🌱 Beginner' },
    { value: 'intermediate', label: '🌿 Intermediate' },
    { value: 'advanced', label: '🌳 Advanced' },
  ];

  useEffect(() => {
    fetchCourses();
  }, [selectedLevel]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedLevel !== 'all') {
        params.level = selectedLevel;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      console.log('🔍 Fetching courses with params:', params);
      const data = await courseService.getCourses(params);
      console.log('📚 Courses data received:', data);
      console.log('📚 Number of courses:', data?.length || 0);
      
      setCourses(data || []);
    } catch (error) {
      console.error('❌ Failed to fetch courses:', error);
      setError(error.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setSearchParams({ level: level !== 'all' ? level : '' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  // Show error state
  if (error) {
    return (
      <>
        <PageTitle title="Courses" description="Browse aquaculture courses for Nigerian fish farmers." />
        <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-brand-lg shadow-card p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-deep-ocean mb-2">Something went wrong</h2>
            <p className="text-dark-navy/70 mb-4">{error}</p>
            <button
              onClick={fetchCourses}
              className="bg-deep-ocean text-white px-6 py-2 rounded-brand hover:bg-deep-ocean/90 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-sea-foam flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-deep-ocean">Loading...</div>
        </div>
      </div>
    );
  }

  // Loading skeletons for courses
  if (loading) {
    return (
      <>
        <PageTitle 
          title="Courses" 
          description="Browse aquaculture courses for Nigerian fish farmers." 
        />
        <div className="min-h-screen bg-sea-foam p-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex gap-4 flex-wrap">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-brand-lg shadow-card overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle 
        title="Courses" 
        description="Browse aquaculture courses for Nigerian fish farmers. Learn fish farming with video tutorials, quizzes, and certificates." 
      />
      
      <div className="min-h-screen bg-sea-foam p-4  pb-20 m-3">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <AnimatedSection animation="fade-up">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-deep-ocean mb-2">
                📚 All Courses
              </h1>
              <p className="text-dark-navy/70">
                Explore our collection of aquaculture courses
              </p>
            </div>
          </AnimatedSection>

          {/* Search & Filter */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-white rounded-brand-lg shadow-card p-4 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition"
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                  </div>
                </form>

                {/* Level Filters */}
                <div className="flex gap-2 flex-wrap">
                  {levels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleLevelChange(level.value)}
                      className={`px-4 py-2 rounded-brand font-medium transition-all duration-200 hover:scale-105 ${
                        selectedLevel === level.value
                          ? 'bg-deep-ocean text-white'
                          : 'bg-gray-100 text-dark-navy hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Results Count */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="mb-4">
              <p className="text-sm text-dark-navy/60">
                Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </AnimatedSection>

          {/* Course Grid */}
          {courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <AnimatedSection key={course.id} animation="fade-up" delay={index * 100}>
                  <CourseCard course={course} />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-brand-lg shadow-card">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-deep-ocean mb-2">
                No courses found
              </h3>
              <p className="text-dark-navy/70">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Courses;