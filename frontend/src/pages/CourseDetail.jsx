import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/course';
import { progressService } from '../services/progress';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';
import { toast } from 'react-toastify';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, authService } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [userProgress, setUserProgress] = useState(null);

  console.log('🔵 CourseDetail component mounted');
  console.log('🔵 isAuthenticated:', isAuthenticated);
  console.log('🔵 user:', user);
  console.log('🔵 course id:', id);

  useEffect(() => {
    console.log('🔵 useEffect triggered - fetching course data');
    fetchCourse();
    if (isAuthenticated) {
      console.log('🔵 User is authenticated, fetching progress');
      fetchProgress();
    } else {
      console.log('🔵 User is not authenticated, skipping progress fetch');
    }
  }, [id, isAuthenticated]);

  const fetchCourse = async () => {
    console.log('📤 Fetching course data for id:', id);
    setLoading(true);
    try {
      const data = await courseService.getCourse(id);
      console.log('📚 Course data received:', data);
      setCourse(data);
    } catch (error) {
      console.error('❌ Failed to fetch course:', error);
      toast.error('Failed to load course');
    }
    setLoading(false);
  };

  const fetchProgress = async () => {
    console.log('📤 Fetching progress for course:', id);
    try {
      const data = await progressService.getCourseProgress(id);
      console.log('📊 Progress data received:', data);
      setIsEnrolled(!!data.enrollment);
      setUserProgress(data);
    } catch (error) {
      console.error('❌ Failed to fetch progress:', error);
      setIsEnrolled(false);
    }
  };

  const handleEnroll = async () => {
    console.log('🟢🟢🟢 ENROLL BUTTON CLICKED! 🟢🟢🟢');
    console.log('🟢 isAuthenticated:', isAuthenticated);
    console.log('🟢 user:', user);
    console.log('🟢 course id:', id);
    console.log('🟢 enrolling state:', enrolling);

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('🔴 User not authenticated, redirecting to register');
      authService.setRedirectAfterAuth(`/courses/${id}`);
      toast.info('Please create an account or sign in to enroll in this course.');
      navigate('/register');
      return;
    }

    // Check if user has completed onboarding
    if (user && !user.onboarding_completed) {
      console.log('🔴 User onboarding not completed');
      authService.setRedirectAfterAuth(`/courses/${id}`);
      toast.info('Please complete your onboarding first.');
      navigate('/onboarding');
      return;
    }

    // Proceed with enrollment
    console.log('🟢 Proceeding with enrollment...');
    setEnrolling(true);
    try {
      console.log('📤 Calling progressService.enroll() with courseId:', id);
      const result = await progressService.enroll(id);
      console.log('📥 Enrollment result:', result);
      setIsEnrolled(true);
      toast.success('🎉 Successfully enrolled in course!');
      await fetchProgress();
      console.log('🟢 Enrollment complete!');
    } catch (error) {
      console.error('🔴 Enrollment error:', error);
      console.error('🔴 Error response:', error.response);
      console.error('🔴 Error status:', error.response?.status);
      console.error('🔴 Error data:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to enroll. Please try again.');
    }
    setEnrolling(false);
    console.log('🟢 Enrollment function finished');
  };

  const getLevelBadge = (level) => {
    const badges = {
      beginner: { label: '🌱 Beginner', color: 'bg-clear-teal' },
      intermediate: { label: '🌿 Intermediate', color: 'bg-blue-500' },
      advanced: { label: '🌳 Advanced', color: 'bg-coral-orange' },
    };
    return badges[level] || badges.beginner;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Render CTA Button
  const renderCTAButton = () => {
    console.log('🔵 renderCTAButton called');
    console.log('🔵 isAuthenticated:', isAuthenticated);
    console.log('🔵 isEnrolled:', isEnrolled);
    console.log('🔵 user?.onboarding_completed:', user?.onboarding_completed);
    
    if (!isAuthenticated) {
      console.log('🔵 Rendering: Enroll Now (unauthenticated)');
      return (
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="bg-deep-ocean text-white px-8 py-3 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      );
    }

    if (isAuthenticated && !user?.onboarding_completed) {
      console.log('🔵 Rendering: Complete Onboarding to Enroll');
      return (
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="bg-coral-orange text-white px-8 py-3 rounded-brand font-medium hover:bg-coral-orange/90 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enrolling ? 'Checking...' : 'Complete Onboarding to Enroll'}
        </button>
      );
    }

    if (isEnrolled && userProgress?.lessons?.length > 0) {
      // Find first incomplete lesson
      const firstIncomplete = userProgress.lessons.find(l => !l.completed);
      const allCompleted = userProgress.lessons.every(l => l.completed);
      
      if (allCompleted) {
        console.log('🔵 Rendering: Get Certificate');
        return (
          <Link
            to="/certificates"
            className="bg-clear-teal text-white px-8 py-3 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block"
          >
            🎓 Get Certificate
          </Link>
        );
      }
      
      if (firstIncomplete) {
        console.log('🔵 Rendering: Continue Learning');
        return (
          <Link
            to={`/courses/${course.id}/lessons/${firstIncomplete.lesson}`}
            className="bg-clear-teal text-white px-8 py-3 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block"
          >
            Continue Learning →
          </Link>
        );
      }
    }

    console.log('🔵 Rendering: Enroll Now (default)');
    return (
      <button
        onClick={handleEnroll}
        disabled={enrolling}
        className="bg-deep-ocean text-white px-8 py-3 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {enrolling ? 'Enrolling...' : 'Enroll Now'}
      </button>
    );
  };

  if (loading) {
    return (
      <>
        <PageTitle title="Course Details" />
        <div className="min-h-screen bg-sea-foam p-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="h-64 bg-gray-200 rounded-brand-lg animate-pulse mb-6"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <PageTitle title="Course Not Found" />
        <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-deep-ocean mb-2">Course Not Found</h2>
            <p className="text-dark-navy/70">The course you're looking for doesn't exist.</p>
            <Link to="/courses" className="inline-block mt-4 bg-deep-ocean text-white px-6 py-2 rounded-brand hover:bg-deep-ocean/90 transition">
              Browse Courses
            </Link>
          </div>
        </div>
      </>
    );
  }

  const badge = getLevelBadge(course.level);
  const progress = userProgress?.enrollment?.progress_percentage || 0;
  const isCompleted = userProgress?.enrollment?.is_completed || false;

  return (
    <>
      <PageTitle title={course.title} description={course.description} />
      
      <div className="min-h-screen bg-sea-foam p-4 pb-20 m-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-dark-navy/60 mb-4">
            <Link to="/courses" className="hover:text-clear-teal">Courses</Link>
            <span className="mx-2">›</span>
            <span>{course.title}</span>
          </div>

          {/* Course Header */}
          <AnimatedSection animation="fade-up">
            <div className="bg-white rounded-brand-lg shadow-card overflow-hidden mb-8">
              <div className="relative h-64 bg-gradient-to-r from-deep-ocean to-clear-teal">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    🐟
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`${badge.color} text-white px-4 py-2 rounded-full font-medium text-sm`}>
                    {badge.label}
                  </span>
                </div>
                {isCompleted && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
                      ✅ Completed
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-bold text-deep-ocean mb-3">
                  {course.title}
                </h1>
                <p className="text-dark-navy/70 mb-4 leading-relaxed">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span className="text-dark-navy/60">📚 {course.lesson_count} lessons</span>
                  <span className="text-dark-navy/60">⏱️ {formatDuration(course.total_duration)}</span>
                  <span className="text-dark-navy/60">📅 Added {new Date(course.created_at).toLocaleDateString()}</span>
                </div>

                {/* Progress Bar for enrolled users */}
                {isEnrolled && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-dark-navy/60 mb-1">
                      <span>Your Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          progress === 100 ? 'bg-clear-teal' : 'bg-deep-ocean'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* Curriculum */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-white rounded-brand-lg shadow-card p-6">
              <h2 className="text-2xl font-bold text-deep-ocean mb-6">
                📖 Course Curriculum
              </h2>
              
              {course.lessons && course.lessons.length > 0 ? (
                <div className="space-y-3">
                  {course.lessons.map((lesson, index) => {
                    // Find user progress for this lesson
                    const lessonProgress = userProgress?.lessons?.find(
                      l => l.lesson === lesson.id
                    );
                    const isLessonCompleted = lessonProgress?.completed || false;
                    const isLessonLocked = isEnrolled && !isLessonCompleted && index > 0 && 
                      !userProgress?.lessons?.find(l => l.lesson === course.lessons[index - 1].id)?.completed;

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-4 p-4 rounded-brand transition border ${
                          isLessonCompleted
                            ? 'bg-clear-teal/5 border-clear-teal/20'
                            : isLessonLocked
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'hover:bg-deep-ocean/5 border-gray-100 hover:border-deep-ocean/20'
                        }`}
                      >
                        {/* Lesson Number */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                          isLessonCompleted
                            ? 'bg-clear-teal text-white'
                            : isLessonLocked
                            ? 'bg-gray-300 text-gray-500'
                            : 'bg-deep-ocean/10 text-deep-ocean'
                        }`}>
                          {isLessonCompleted ? '✓' : index + 1}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium truncate ${
                              isLessonCompleted
                                ? 'text-clear-teal'
                                : isLessonLocked
                                ? 'text-gray-500'
                                : 'text-deep-ocean'
                            }`}>
                              {lesson.title}
                            </h3>
                            {isLessonCompleted && (
                              <span className="text-clear-teal text-sm">✅</span>
                            )}
                            {isLessonLocked && (
                              <span className="text-gray-400 text-sm">🔒</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-dark-navy/60">
                            <span>⏱️ {formatDuration(lesson.video_duration)}</span>
                            <span>📝 {lesson.quiz_count || 0} questions</span>
                            {lessonProgress && (
                              <span className="text-clear-teal">
                                {Math.round(lessonProgress.watch_percentage)}% watched
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        {isEnrolled && !isLessonLocked ? (
                          <Link
                            to={`/courses/${course.id}/lessons/${lesson.id}`}
                            className={`px-4 py-2 rounded-brand font-medium text-sm transition-all duration-300 hover:scale-105 flex-shrink-0 ${
                              isLessonCompleted
                                ? 'bg-gray-100 text-dark-navy hover:bg-gray-200'
                                : 'bg-clear-teal text-white hover:bg-clear-teal/90'
                            }`}
                          >
                            {isLessonCompleted ? 'Review' : 'Start'}
                          </Link>
                        ) : isLessonLocked ? (
                          <span className="px-4 py-2 rounded-brand font-medium text-sm bg-gray-200 text-gray-500 flex-shrink-0">
                            Locked
                          </span>
                        ) : (
                          <span className="px-4 py-2 rounded-brand font-medium text-sm bg-gray-200 text-gray-500 flex-shrink-0">
                            Enroll to Start
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-dark-navy/60">No lessons available yet.</p>
              )}
            </div>
          </AnimatedSection>

          {/* CTA Section */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="mt-8 text-center pb-8">
              {renderCTAButton()}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
};

export default CourseDetail;