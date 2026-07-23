import React from 'react';

const DashboardStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Courses Enrolled',
      value: stats.total_courses,
      icon: '📚',
      color: 'bg-deep-ocean/10 text-deep-ocean'
    },
    {
      label: 'Courses Completed',
      value: stats.completed_courses,
      icon: '🎓',
      color: 'bg-clear-teal/10 text-clear-teal'
    },
    {
      label: 'Lessons Completed',
      value: stats.completed_lessons,
      icon: '✅',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      label: 'Quizzes Passed',
      value: stats.quizzes_passed,
      icon: '🏆',
      color: 'bg-coral-orange/10 text-coral-orange'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-brand-lg shadow-card p-4 text-center"
        >
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.color} mb-2`}>
            <span className="text-2xl">{item.icon}</span>
          </div>
          <div className="text-2xl font-bold text-deep-ocean">{item.value}</div>
          <div className="text-sm text-dark-navy/60">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;