import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Quiz = ({ questions, onSubmit, loading, canRetry }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswerSelect = (questionId, option) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      toast.warning(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    setLoading(true);
    const result = await onSubmit(answers);
    setLoading(false);

    if (result.status === 'success') {
      setResults(result);
      setSubmitted(true);
      setShowFeedback(true);

      if (result.passed) {
        toast.success(`🎉 You passed! Score: ${Math.round(result.score)}%`);
      } else {
        toast.error(`❌ You need 70% to pass. Score: ${Math.round(result.score)}%`);
      }
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResults(null);
    setShowFeedback(false);
  };

  const isAnswered = (questionId) => {
    return answers[questionId] !== undefined;
  };

  const getOptionClass = (questionId, optionId) => {
    if (!submitted) {
      return answers[questionId] === optionId
        ? 'border-deep-ocean bg-deep-ocean/5'
        : 'border-gray-200 hover:border-deep-ocean/50';
    }

    const result = results?.results?.find(r => r.question_id === questionId);
    if (!result) return 'border-gray-200';

    const isCorrect = optionId === result.correct_answer;
    const isSelected = optionId === result.user_answer;

    if (isCorrect) {
      return 'border-clear-teal bg-clear-teal/10';
    }
    if (isSelected && !isCorrect) {
      return 'border-coral-orange bg-coral-orange/10';
    }
    return 'border-gray-200 opacity-50';
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-dark-navy/70">No quiz questions available for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-deep-ocean">📝 Quiz</h3>
        <div className="text-sm text-dark-navy/60">
          {submitted ? (
            <span className="text-clear-teal font-medium">✅ Completed</span>
          ) : (
            <span>
              {answeredCount} / {totalQuestions} answered
            </span>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-gray-50 rounded-brand p-4">
            <div className="flex items-start gap-3">
              <span className="font-semibold text-deep-ocean min-w-[24px]">
                {index + 1}.
              </span>
              <div className="flex-1">
                <p className="font-medium text-dark-navy mb-3">
                  {question.question}
                </p>
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(question.id, option.id)}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-2 border-2 rounded-brand transition ${
                        getOptionClass(question.id, option.id)
                      }`}
                    >
                      <span className="font-medium mr-2">
                        {getOptionLabel(option.id - 1)}.
                      </span>
                      {option.text}
                      {submitted && results?.results?.find(r => r.question_id === question.id) && (
                        <span className="ml-2">
                          {option.id === results.results.find(r => r.question_id === question.id).correct_answer && (
                            <span className="text-clear-teal">✅</span>
                          )}
                          {option.id === results.results.find(r => r.question_id === question.id).user_answer &&
                           option.id !== results.results.find(r => r.question_id === question.id).correct_answer && (
                            <span className="text-coral-orange">❌</span>
                          )}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {submitted && showFeedback && results?.results?.find(r => r.question_id === question.id) && (
                  <div className={`mt-3 p-3 rounded-brand ${
                    results.results.find(r => r.question_id === question.id).is_correct
                      ? 'bg-clear-teal/10 border border-clear-teal/20'
                      : 'bg-coral-orange/10 border border-coral-orange/20'
                  }`}>
                    <p className="text-sm">
                      {results.results.find(r => r.question_id === question.id).is_correct
                        ? '✅ Correct!'
                        : `❌ Incorrect. The correct answer is: ${getOptionLabel(results.results.find(r => r.question_id === question.id).correct_answer - 1)}`
                      }
                    </p>
                    {results.results.find(r => r.question_id === question.id).explanation && (
                      <p className="text-sm text-dark-navy/70 mt-1">
                        {results.results.find(r => r.question_id === question.id).explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={loading || answeredCount < totalQuestions}
            className="flex-1 bg-deep-ocean text-white py-3 px-6 rounded-brand font-medium hover:bg-deep-ocean/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <>
            {!results?.passed && canRetry && (
              <button
                onClick={handleRetry}
                className="flex-1 bg-coral-orange text-white py-3 px-6 rounded-brand font-medium hover:bg-coral-orange/90 transition"
              >
                🔄 Retry Quiz
              </button>
            )}
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex-1 bg-gray-200 text-dark-navy py-3 px-6 rounded-brand font-medium hover:bg-gray-300 transition"
            >
              {showFeedback ? 'Hide Feedback' : 'Show Feedback'}
            </button>
          </>
        )}
      </div>

      {/* Results */}
      {submitted && results && (
        <div className={`p-4 rounded-brand ${
          results.passed ? 'bg-clear-teal/10 border border-clear-teal/20' : 'bg-coral-orange/10 border border-coral-orange/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-deep-ocean">
                {results.passed ? '🎉 You Passed!' : '❌ Keep Learning!'}
              </p>
              <p className="text-sm text-dark-navy/70">
                Score: {Math.round(results.score)}% ({results.correct_count}/{results.total_questions})
              </p>
              {results.passed && (
                <p className="text-sm text-clear-teal font-medium mt-1">
                  ✅ Lesson completed! You can move to the next lesson.
                </p>
              )}
              {!results.passed && (
                <p className="text-sm text-coral-orange font-medium mt-1">
                  {results.can_retry ? '⚠️ You have one retry attempt left.' : '❌ No retry attempts remaining.'}
                </p>
              )}
            </div>
            {results.passed && (
              <div className="text-4xl">🏆</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;