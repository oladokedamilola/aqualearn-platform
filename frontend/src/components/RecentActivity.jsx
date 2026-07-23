import React from 'react';
import { Link } from 'react-router-dom';

const RecentActivity = ({ activities }) => {
  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000 / 60); // minutes
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getActivityText = (activity) => {
    if (activity.type === 'quiz') {
      return `Scored ${Math.round(activity.score)}% on "${activity.lesson}" - ${
        activity.passed ? '✅ Passed' : '📝 Needs review'
      }`;
    }
    if (activity.type === 'watch') {
      return `Watched ${Math.round(activity.percentage)}% of "${activity.lesson}"`;
    }
    return activity.type;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-dark-navy/60">
        <div className="text-4xl mb-3">📭</div>
        <p>No recent activity yet</p>
        <p className="text-sm">Start learning to see your progress here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 bg-gray-50 rounded-brand hover:bg-gray-100 transition"
        >
          <div className="text-2xl">{activity.icon || '📌'}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-dark-navy">
              {getActivityText(activity)}
            </p>
            <p className="text-xs text-dark-navy/40">
              {activity.course} • {formatTime(activity.completed_at || activity.last_watch)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;