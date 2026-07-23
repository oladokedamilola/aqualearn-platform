import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
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

  const badge = getLevelBadge(course.level);

  return (
    <Link to={`/courses/${course.id}`} className="block h-full">
      <div className="bg-white rounded-brand-lg shadow-card hover:shadow-card-hover transition h-full flex flex-col overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-deep-ocean/10">
          {course.image ? (
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-deep-ocean/5 to-clear-teal/5">
              🐟
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`${badge.color} text-white text-xs px-3 py-1 rounded-full font-medium`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-deep-ocean mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-dark-navy/70 mb-4 line-clamp-2 flex-1">
            {course.description}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-dark-navy/60 border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center gap-4">
              <span>📚 {course.lesson_count} lessons</span>
              <span>⏱️ {formatDuration(course.total_duration)}</span>
            </div>
            <span className="text-clear-teal font-medium">Learn More →</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;