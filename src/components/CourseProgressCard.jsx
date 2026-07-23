import React from 'react';
import { Link } from 'react-router-dom';

const CourseProgressCard = ({ course }) => {
  const getLevelBadge = (level) => {
    const badges = {
      beginner: { label: '🌱 Beginner', color: 'bg-clear-teal' },
      intermediate: { label: '🌿 Intermediate', color: 'bg-blue-500' },
      advanced: { label: '🌳 Advanced', color: 'bg-coral-orange' },
    };
    return badges[level] || badges.beginner;
  };

  const badge = getLevelBadge(course.level);
  const progress = Math.round(course.progress);

  return (
    <div className="bg-white rounded-brand-lg shadow-card overflow-hidden hover:shadow-card-hover transition">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-deep-ocean line-clamp-1">
              {course.title}
            </h4>
            <span className={`text-xs ${badge.color} text-white px-2 py-0.5 rounded-full inline-block mt-1`}>
              {badge.label}
            </span>
          </div>
          {course.is_completed && (
            <span className="text-2xl">🏆</span>
          )}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm text-dark-navy/60 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                progress === 100 ? 'bg-clear-teal' : 'bg-deep-ocean'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-dark-navy/60">
          <span>
            {course.completed_lessons}/{course.total_lessons} lessons
          </span>
          {course.lessons_remaining > 0 && (
            <span>{course.lessons_remaining} remaining</span>
          )}
        </div>

        <div className="mt-4">
          {course.is_completed ? (
            <Link
              to={`/courses/${course.course_id}`}
              className="block w-full text-center bg-gray-100 text-dark-navy py-2 rounded-brand font-medium hover:bg-gray-200 transition"
            >
              Review Course
            </Link>
          ) : (
            <Link
              to={`/courses/${course.course_id}`}
              className="block w-full text-center bg-deep-ocean text-white py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition"
            >
              Continue Learning
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseProgressCard;