import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/course';
import { progressService } from '../services/progress';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';
import { toast } from 'react-toastify';

const Quiz = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [progress, setProgress] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const lessonData = await courseService.getLesson(lessonId);
      setLesson(lessonData);
      console.log('📚 Lesson data:', lessonData);

      const courseData = await courseService.getCourse(courseId);
      setCourse(courseData);

      const courseProgress = await progressService.getCourseProgress(courseId);
      const lessonProgress = courseProgress.lessons.find(l => l.lesson === parseInt(lessonId));
      setProgress(lessonProgress);

      if (!lessonProgress?.is_eligible_for_quiz) {
        toast.warning('Please watch at least 80% of the video before taking the quiz.');
        navigate(`/courses/${courseId}/lessons/${lessonId}`);
        return;
      }

      if (lessonProgress?.quiz_passed) {
        toast.info('You have already passed this quiz.');
        navigate(`/courses/${courseId}/lessons/${lessonId}`);
        return;
      }

    } catch (error) {
      console.error('Failed to load quiz:', error);
      toast.error('Failed to load quiz content');
    }
    setLoading(false);
  };

  const getOptions = (question) => {
    if (question.options && Array.isArray(question.options)) {
      return question.options;
    }
    
    const options = [];
    for (let i = 1; i <= 4; i++) {
      const optionKey = `option_${i}`;
      if (question[optionKey]) {
        options.push({
          id: i,
          text: question[optionKey]
        });
      }
    }
    return options;
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const handleSubmit = async () => {
    const totalQuestions = lesson?.quiz_questions?.length || 0;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      toast.warning(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await progressService.submitQuiz(lessonId, answers);
      setQuizResult(result);
      setQuizCompleted(true);
      setShowFeedback(true);

      if (result.passed) {
        toast.success(`🎉 You passed! Score: ${Math.round(result.score)}%`);
      } else {
        toast.error(`❌ You need 70% to pass. Score: ${Math.round(result.score)}%`);
        
        // ✅ If no retry attempts left, reset watch progress
        if (!result.can_retry) {
          setResetting(true);
          toast.info('🔄 Resetting progress. You can rewatch the video and try again.');
          
          // ✅ Reset watch progress
          try {
            await progressService.resetProgress(lessonId);
            // Wait a moment before redirecting
            setTimeout(() => {
              setResetting(false);
              navigate(`/courses/${courseId}/lessons/${lessonId}`);
            }, 2000);
          } catch (error) {
            console.error('Failed to reset progress:', error);
            toast.error('Failed to reset progress. Please refresh the page.');
            setResetting(false);
          }
        }
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Failed to submit quiz. Please try again.');
    }
    setSubmitting(false);
  };

  const handleRetry = () => {
    setAnswers({});
    setQuizCompleted(false);
    setQuizResult(null);
    setShowFeedback(false);
  };

  if (loading || resetting) {
    return (
      <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
        <div className="text-center">
          {resetting ? (
            <>
              <div className="w-12 h-12 border-4 border-deep-ocean border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-dark-navy/70">Resetting progress... Please wait.</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 border-4 border-deep-ocean border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-dark-navy/70">Loading quiz...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-deep-ocean mb-2">Quiz Not Found</h2>
          <p className="text-dark-navy/70">The quiz you're looking for doesn't exist.</p>
          <Link to={`/courses/${courseId}`} className="inline-block mt-4 bg-deep-ocean text-white px-6 py-2 rounded-brand">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const questions = lesson.quiz_questions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  return (
    <>
      <PageTitle title={`Quiz: ${lesson.title}`} description="Test your knowledge with this quiz." />
      
      <div className="min-h-screen bg-sea-foam p-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-dark-navy/60 mb-4">
            <Link to="/courses" className="hover:text-clear-teal">Courses</Link>
            <span className="mx-2">›</span>
            <Link to={`/courses/${courseId}`} className="hover:text-clear-teal">{course.title}</Link>
            <span className="mx-2">›</span>
            <Link to={`/courses/${courseId}/lessons/${lessonId}`} className="hover:text-clear-teal">{lesson.title}</Link>
            <span className="mx-2">›</span>
            <span>Quiz</span>
          </div>

          {/* Quiz Header */}
          <AnimatedSection animation="fade-up">
            <div className="bg-white rounded-brand-lg shadow-card p-6 mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-deep-ocean mb-2">
                    📝 Quiz: {lesson.title}
                  </h1>
                  <p className="text-dark-navy/70 text-sm">
                    Answer all questions to test your understanding. You need 70% to pass.
                    {progress && progress.quiz_attempts < 3 && (
                      <span className="block text-coral-orange text-xs mt-1">
                        Attempt {progress.quiz_attempts + 1} of 3
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-sm text-dark-navy/60">
                  <span className="font-medium">{answeredCount}/{totalQuestions}</span> answered
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Quiz Results */}
          {quizCompleted && quizResult && (
            <AnimatedSection animation="fade-up">
              <div className={`p-6 rounded-brand-lg mb-6 ${
                quizResult.passed 
                  ? 'bg-clear-teal/10 border border-clear-teal/20' 
                  : 'bg-coral-orange/10 border border-coral-orange/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${
                      quizResult.passed ? 'text-clear-teal' : 'text-coral-orange'
                    }`}>
                      {quizResult.passed ? '🎉 You Passed!' : '❌ Keep Learning!'}
                    </h3>
                    <p className="text-dark-navy/70 text-sm">
                      Score: {Math.round(quizResult.score)}% ({quizResult.correct_count}/{quizResult.total_questions})
                    </p>
                    {!quizResult.passed && quizResult.can_retry && (
                      <p className="text-coral-orange text-sm mt-1">
                        ⚠️ You have {3 - (progress?.quiz_attempts || 0)} retry attempt(s) left.
                      </p>
                    )}
                    {!quizResult.passed && !quizResult.can_retry && (
                      <p className="text-coral-orange text-sm mt-1">
                        🔄 No retry attempts remaining. Your progress has been reset. Please rewatch the video and try again.
                      </p>
                    )}
                    {quizResult.passed && (
                      <p className="text-clear-teal text-sm mt-1">
                        ✅ Lesson completed! You can now proceed to the next lesson.
                      </p>
                    )}
                  </div>
                  <div className="text-4xl">
                    {quizResult.passed ? '🏆' : '📚'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {!quizResult.passed && quizResult.can_retry && (
                    <button
                      onClick={handleRetry}
                      className="bg-coral-orange text-white px-6 py-2 rounded-brand font-medium hover:bg-coral-orange/90 transition"
                    >
                      🔄 Retry Quiz
                    </button>
                  )}
                  <button
                    onClick={() => setShowFeedback(!showFeedback)}
                    className="bg-gray-200 text-dark-navy px-6 py-2 rounded-brand font-medium hover:bg-gray-300 transition"
                  >
                    {showFeedback ? 'Hide Feedback' : 'Show Feedback'}
                  </button>
                  <Link
                    to={`/courses/${courseId}/lessons/${lessonId}`}
                    className={`px-6 py-2 rounded-brand font-medium transition ${
                      quizResult.passed
                        ? 'bg-clear-teal text-white hover:bg-clear-teal/90'
                        : 'bg-deep-ocean text-white hover:bg-deep-ocean/90'
                    }`}
                  >
                    {quizResult.passed ? '✅ Back to Lesson' : '🔙 Back to Lesson'}
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Quiz Questions */}
          {!quizCompleted && (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const options = getOptions(question);
                return (
                  <AnimatedSection key={question.id || index} animation="fade-up" delay={index * 100}>
                    <div className="bg-white rounded-brand-lg shadow-card p-6">
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-deep-ocean min-w-[30px] text-sm">
                          Q{index + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-dark-navy mb-3">
                            {question.question}
                          </p>
                          <div className="space-y-2">
                            {options.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleAnswerSelect(question.id, option.id)}
                                className={`w-full text-left px-4 py-2.5 border-2 rounded-brand transition-all duration-200 ${
                                  answers[question.id] === option.id
                                    ? 'border-deep-ocean bg-deep-ocean/5'
                                    : 'border-gray-200 hover:border-deep-ocean/50 hover:bg-deep-ocean/5'
                                }`}
                              >
                                <span className="font-medium mr-2">
                                  {String.fromCharCode(64 + option.id)}.
                                </span>
                                {option.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}

              {/* Submit Button */}
              <AnimatedSection animation="fade-up" delay={300}>
                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !allAnswered}
                    className={`px-8 py-3 rounded-brand font-medium transition-all duration-300 ${
                      allAnswered && !submitting
                        ? 'bg-deep-ocean text-white hover:bg-deep-ocean/90 hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Quiz'
                    )}
                  </button>
                  {!allAnswered && (
                    <p className="text-sm text-coral-orange mt-2">
                      Please answer all {totalQuestions} questions ({answeredCount} answered)
                    </p>
                  )}
                  {progress && progress.quiz_attempts < 3 && (
                    <p className="text-xs text-dark-navy/40 mt-2">
                      Attempt {progress.quiz_attempts + 1} of 3
                    </p>
                  )}
                </div>
              </AnimatedSection>
            </div>
          )}

          {/* Feedback Section */}
          {showFeedback && quizResult && (
            <AnimatedSection animation="fade-up" delay={200}>
              <div className="bg-white rounded-brand-lg shadow-card p-6 mt-6">
                <h3 className="text-lg font-bold text-deep-ocean mb-4">📖 Answer Review</h3>
                <div className="space-y-4">
                  {quizResult.results?.map((result, index) => (
                    <div key={index} className={`p-4 rounded-brand border-l-4 ${
                      result.is_correct 
                        ? 'border-clear-teal bg-clear-teal/5' 
                        : 'border-coral-orange bg-coral-orange/5'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg">
                          {result.is_correct ? '✅' : '❌'}
                        </span>
                        <div>
                          <p className="font-medium text-dark-navy">{result.question}</p>
                          <p className="text-sm mt-1">
                            Your answer: <span className={`font-medium ${
                              result.is_correct ? 'text-clear-teal' : 'text-coral-orange'
                            }`}>
                              {result.user_answer ? String.fromCharCode(64 + result.user_answer) : 'Not answered'}
                            </span>
                          </p>
                          {!result.is_correct && (
                            <p className="text-sm text-clear-teal mt-1">
                              Correct answer: {String.fromCharCode(64 + result.correct_answer)}
                            </p>
                          )}
                          {result.explanation && (
                            <p className="text-sm text-dark-navy/60 mt-2 border-t border-gray-100 pt-2">
                              💡 {result.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </>
  );
};

export default Quiz;