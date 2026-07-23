import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/course';
import { progressService } from '../services/progress';
import YouTubePlayer from '../components/YouTubePlayer';
import { toast } from 'react-toastify';

const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [watchPercentage, setWatchPercentage] = useState(0);
  const [quizEligible, setQuizEligible] = useState(false);
  const [lessonStatus, setLessonStatus] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [quizAttemptsExhausted, setQuizAttemptsExhausted] = useState(false);
  const [localProgress, setLocalProgress] = useState(() => {
    const saved = localStorage.getItem(`lesson_${lessonId}_progress`);
    return saved ? parseFloat(saved) : 0;
  });
  const progressUpdated = useRef(false);
  const lastUpdateTime = useRef(0);
  const lastSentPercentage = useRef(0);
  const quizNotificationShown = useRef(false);

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get lesson details
      const lessonData = await courseService.getLesson(lessonId);
      setLesson(lessonData);

      // Get course details
      const courseData = await courseService.getCourse(courseId);
      setCourse(courseData);

      // Get lesson status (next/previous)
      const status = await progressService.getLessonStatus(lessonId);
      setLessonStatus(status);

      // Get progress
      const courseProgress = await progressService.getCourseProgress(courseId);
      const lessonProgress = courseProgress.lessons.find(l => l.lesson === parseInt(lessonId));
      
      if (lessonProgress) {
        setProgress(lessonProgress);
        setWatchPercentage(lessonProgress.watch_percentage);
        setQuizEligible(lessonProgress.is_eligible_for_quiz);
        setLessonCompleted(lessonProgress.completed);
        
        // ✅ Check if quiz attempts are exhausted (quiz_attempts >= 2 and not passed)
        if (lessonProgress.quiz_attempts >= 2 && !lessonProgress.quiz_passed) {
          setQuizAttemptsExhausted(true);
          // ✅ Reset watch progress so user can rewatch
          if (lessonProgress.watch_percentage > 0) {
            await resetWatchProgress(lessonProgress);
          }
        } else {
          setQuizAttemptsExhausted(false);
        }
        
        // If already completed or eligible, reset notification flag
        if (lessonProgress.completed || lessonProgress.is_eligible_for_quiz) {
          quizNotificationShown.current = true;
        }
      }

      // Check enrollment
      const enrollments = await progressService.getCourseProgress(courseId);
      setIsEnrolled(!!enrollments.enrollment);

    } catch (error) {
      console.error('Failed to load lesson:', error);
      toast.error('Failed to load lesson content');
    }
    setLoading(false);
  };

  // ✅ Function to reset watch progress
  const resetWatchProgress = async (lessonProgress) => {
    try {
      // Reset watch percentage to 0
      await progressService.updateWatchProgress(lessonId, 0);
      setWatchPercentage(0);
      setQuizEligible(false);
      quizNotificationShown.current = false;
      localStorage.setItem(`lesson_${lessonId}_progress`, '0');
      
      // Reset the progress object
      if (lessonProgress) {
        lessonProgress.watch_percentage = 0;
        lessonProgress.watch_threshold_met = false;
        lessonProgress.is_eligible_for_quiz = false;
      }
      
      toast.info('🔄 Watch progress has been reset. Please rewatch the video to unlock the quiz again.');
    } catch (error) {
      console.error('Failed to reset watch progress:', error);
      toast.error('Failed to reset progress. Please refresh the page.');
    }
  };

  const handleWatchProgress = async (percentage) => {
    // ✅ If quiz attempts are exhausted, don't allow progress tracking
    if (quizAttemptsExhausted) {
      toast.warning('You have exhausted your quiz attempts. Please contact support for assistance.');
      return;
    }

    // Update real-time display
    setWatchPercentage(percentage);
    setLocalProgress(percentage);
    
    // Save locally for persistence
    localStorage.setItem(`lesson_${lessonId}_progress`, percentage.toString());

    // Only show notification once when reaching 80%
    if (percentage >= 80 && !quizNotificationShown.current && !lessonCompleted) {
      quizNotificationShown.current = true;
      toast.success('🎯 Quiz unlocked! Click "Take Quiz" to start.');
    }

    // Update server with throttling
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    const isSignificantChange = Math.abs(percentage - lastSentPercentage.current) >= 5;
    const isThresholdReached = percentage >= 80 && lastSentPercentage.current < 80;
    const isTimeToUpdate = timeSinceLastUpdate > 3000;
    
    if ((isSignificantChange || isThresholdReached || isTimeToUpdate || percentage === 100) && !progressUpdated.current) {
      progressUpdated.current = true;
      lastUpdateTime.current = now;
      lastSentPercentage.current = percentage;
      
      try {
        const result = await progressService.updateWatchProgress(lessonId, percentage);
        setQuizEligible(result.is_eligible_for_quiz);
        
        // Update lesson completed status
        if (result.lesson_completed) {
          setLessonCompleted(true);
        }
        
      } catch (error) {
        console.error('Failed to update watch progress:', error);
      } finally {
        progressUpdated.current = false;
      }
    }
  };

  const handleVideoError = (error) => {
    console.error('Video error:', error);
    toast.error('Video loading error. Please check your connection.');
  };

  const handleEnroll = async () => {
    try {
      await progressService.enroll(courseId);
      setIsEnrolled(true);
      toast.success('🎉 Enrolled in course!');
      fetchData();
    } catch (error) {
      toast.error('Failed to enroll. Please try again.');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sea-foam p-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-[400px] bg-gray-200 rounded-brand-lg animate-pulse mb-6"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-deep-ocean mb-2">Lesson Not Found</h2>
          <p className="text-dark-navy/70">The lesson you're looking for doesn't exist.</p>
          <Link to={`/courses/${courseId}`} className="inline-block mt-4 bg-deep-ocean text-white px-6 py-2 rounded-brand">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = !isEnrolled;

  // ✅ Show message if quiz attempts are exhausted
  if (quizAttemptsExhausted) {
    return (
      <div className="min-h-screen bg-sea-foam p-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-dark-navy/60 mb-4">
            <Link to="/courses" className="hover:text-clear-teal">Courses</Link>
            <span className="mx-2">›</span>
            <Link to={`/courses/${courseId}`} className="hover:text-clear-teal">{course?.title}</Link>
            <span className="mx-2">›</span>
            <span>{lesson.title}</span>
          </div>

          {/* Video Player - Disabled */}
          <div className="mb-6 relative">
            <div className="aspect-video bg-gray-800 rounded-brand-lg flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold mb-2">Quiz Attempts Exhausted</h3>
                <p className="text-gray-300 max-w-md">
                  You have used all your quiz attempts for this lesson.
                  Please contact support for assistance.
                </p>
                <Link
                  to={`/courses/${courseId}`}
                  className="inline-block mt-4 bg-deep-ocean text-white px-6 py-2 rounded-brand hover:bg-deep-ocean/90 transition"
                >
                  Back to Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sea-foam p-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-dark-navy/60 mb-4">
          <Link to="/courses" className="hover:text-clear-teal">Courses</Link>
          <span className="mx-2">›</span>
          <Link to={`/courses/${courseId}`} className="hover:text-clear-teal">{course?.title}</Link>
          <span className="mx-2">›</span>
          <span>{lesson.title}</span>
        </div>

        {/* Video Player */}
        <div className="mb-6">
          <YouTubePlayer
            videoUrl={lesson.video_url}
            onProgress={handleWatchProgress}
            onError={handleVideoError}
          />
        </div>

        {/* Lesson Info */}
        <div className="bg-white rounded-brand-lg shadow-card p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-deep-ocean mb-2">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="text-dark-navy/70">{lesson.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-dark-navy/60">
              <span>⏱️ {formatDuration(lesson.video_duration)}</span>
              <span>📝 {lesson.quiz_count || 0} questions</span>
              <span>
                {lessonCompleted ? (
                  <span className="text-clear-teal font-medium">✅ Completed</span>
                ) : watchPercentage >= 80 ? (
                  <span className="text-clear-teal font-medium">✅ Quiz ready</span>
                ) : (
                  <span className="text-coral-orange font-medium">
                    {Math.round(watchPercentage)}% watched
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Watch Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-dark-navy/60 mb-1">
              <span>Watch progress</span>
              <span className="font-medium text-deep-ocean">{Math.round(watchPercentage)}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  lessonCompleted ? 'bg-clear-teal' :
                  watchPercentage >= 80 ? 'bg-clear-teal' : 'bg-deep-ocean'
                }`}
                style={{ width: `${Math.min(100, watchPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-dark-navy/40">0%</span>
              <span className="text-dark-navy/40">80% threshold</span>
              <span className="text-dark-navy/40">100%</span>
            </div>
            {!lessonCompleted && watchPercentage < 80 && (
              <p className="text-xs text-coral-orange mt-2 flex items-center gap-1">
                <span>⚠️</span>
                Watch at least 80% of the video to unlock the quiz
                <span className="font-medium ml-1">({Math.round(watchPercentage)}% / 80%)</span>
              </p>
            )}
            {!lessonCompleted && watchPercentage >= 80 && !quizEligible && (
              <p className="text-xs text-coral-orange mt-2">
                ⏳ Processing... Quiz will unlock shortly.
              </p>
            )}
            {!lessonCompleted && watchPercentage >= 80 && quizEligible && (
              <p className="text-xs text-clear-teal mt-2 flex items-center gap-1">
                <span>✅</span>
                You've unlocked the quiz! Click "Take Quiz" to start.
              </p>
            )}
            {lessonCompleted && (
              <p className="text-xs text-clear-teal mt-2 flex items-center gap-1">
                <span>🎉</span>
                Lesson completed! You can now proceed to the next lesson.
              </p>
            )}
          </div>
        </div>

        {/* Quiz Section - "Take Quiz" button */}
        {quizEligible && !lessonCompleted && (
          <div className="bg-white rounded-brand-lg shadow-card p-6 mb-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl">📝</div>
              <h3 className="text-xl font-bold text-deep-ocean">Quiz Ready!</h3>
              <p className="text-dark-navy/70">
                You've watched {Math.round(watchPercentage)}% of the video. 
                Test your knowledge with the quiz.
              </p>
              <Link
                to={`/courses/${courseId}/lessons/${lessonId}/quiz`}
                className="bg-deep-ocean text-white px-8 py-3 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-105 inline-block"
              >
                Take Quiz →
              </Link>
            </div>
          </div>
        )}

        {lessonCompleted && (
          <div className="bg-clear-teal/10 border border-clear-teal/20 rounded-brand-lg p-6 mb-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-clear-teal mb-1">Lesson Complete!</h3>
            <p className="text-dark-navy/70">You've successfully completed this lesson. Move on to the next one!</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {lessonStatus?.previous_lesson && (
              <Link
                to={`/courses/${courseId}/lessons/${lessonStatus.previous_lesson.id}`}
                className="inline-flex items-center gap-2 bg-white text-deep-ocean px-4 py-2 rounded-brand font-medium hover:bg-deep-ocean/5 transition shadow-card"
              >
                ← Previous Lesson
              </Link>
            )}
          </div>

          <div>
            {lessonStatus?.next_lesson ? (
              lessonCompleted ? (
                <Link
                  to={`/courses/${courseId}/lessons/${lessonStatus.next_lesson.id}`}
                  className="inline-flex items-center gap-2 bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-105"
                >
                  Next Lesson →
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-2 rounded-brand font-medium cursor-not-allowed opacity-70"
                >
                  🔒 Complete this lesson first
                  <span className="text-xs ml-1">
                    ({watchPercentage >= 80 ? 'Take the quiz' : `${Math.round(watchPercentage)}% watched`})
                  </span>
                </button>
              )
            ) : (
              // Last lesson - show course complete option
              <Link
                to={`/courses/${courseId}`}
                className="inline-flex items-center gap-2 bg-clear-teal text-white px-6 py-2 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-105"
              >
                🎓 Back to Course
              </Link>
            )}
          </div>
        </div>

        {/* Enroll Button (if not enrolled) */}
        {!isEnrolled && (
          <div className="mt-6 text-center">
            <button
              onClick={handleEnroll}
              className="bg-clear-teal text-white px-8 py-3 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-105"
            >
              Enroll in {course?.title}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lesson;