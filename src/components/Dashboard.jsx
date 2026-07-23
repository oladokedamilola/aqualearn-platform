import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/progress';
import DashboardStats from '../components/DashboardStats';
import CourseProgressCard from '../components/CourseProgressCard';
import RecentActivity from '../components/RecentActivity';
import CertificateCard from '../components/CertificateCard';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await progressService.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sea-foam p-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-12 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-brand-lg shadow-card p-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-brand-lg shadow-card p-5">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-deep-ocean mb-2">Unable to Load Dashboard</h2>
          <p className="text-dark-navy/70">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const { stats, course_progress, next_lesson, recent_activity, earned_certificates } = dashboardData;

  return (
    <div className="min-h-screen bg-sea-foam p-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-deep-ocean to-clear-teal rounded-brand-lg shadow-card p-6 mb-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                👋 Welcome back, {user?.first_name || 'Learner'}!
              </h1>
              <p className="text-white/80 mt-1">
                {stats.completed_courses === stats.total_courses && stats.total_courses > 0
                  ? '🎉 You\'ve completed all your courses! Explore more to continue learning.'
                  : `You've completed ${stats.completed_courses} of ${stats.total_courses} courses`
                }
              </p>
            </div>
            <Link
              to="/courses"
              className="bg-white text-deep-ocean px-6 py-2 rounded-brand font-medium hover:bg-white/90 transition"
            >
              Browse Courses
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <DashboardStats stats={stats} />

        {/* Continue Learning */}
        {next_lesson && (
          <div className="mt-8 bg-white rounded-brand-lg shadow-card p-6">
            <h2 className="text-xl font-bold text-deep-ocean mb-4">🚀 Continue Learning</h2>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-dark-navy font-medium">{next_lesson.course_title}</p>
                <p className="text-sm text-dark-navy/60">
                  {next_lesson.title} • {Math.round(next_lesson.progress)}% complete
                </p>
              </div>
              <Link
                to={`/courses/${next_lesson.course_id}/lessons/${next_lesson.id}`}
                className="bg-clear-teal text-white px-6 py-2 rounded-brand font-medium hover:bg-clear-teal/90 transition"
              >
                Continue →
              </Link>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {/* Left Column - 2/3 */}
          <div className="md:col-span-2 space-y-6">
            {/* Course Progress */}
            <div>
              <h2 className="text-xl font-bold text-deep-ocean mb-4">
                📚 Your Courses
              </h2>
              {course_progress.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {course_progress.map((course) => (
                    <CourseProgressCard key={course.course_id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-brand-lg shadow-card p-8 text-center">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-lg font-semibold text-deep-ocean mb-2">
                    No courses yet
                  </h3>
                  <p className="text-dark-navy/70 mb-4">
                    Start your learning journey by enrolling in a course.
                  </p>
                  <Link
                    to="/courses"
                    className="bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition inline-block"
                  >
                    Explore Courses
                  </Link>
                </div>
              )}
            </div>

            {/* Certificates */}
            {earned_certificates.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-deep-ocean mb-4">
                  📜 Your Certificates
                </h2>
                <div className="space-y-3">
                  {earned_certificates.map((cert, index) => (
                    <CertificateCard key={index} certificate={cert} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-bold text-deep-ocean mb-4">
                🕐 Recent Activity
              </h2>
              <div className="bg-white rounded-brand-lg shadow-card p-4">
                <RecentActivity activities={recent_activity} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-brand-lg shadow-card p-4">
              <h3 className="font-semibold text-deep-ocean mb-3">📊 Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-navy/60">Overall Progress</span>
                  <span className="font-medium text-deep-ocean">
                    {Math.round(stats.overall_progress)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-navy/60">Lessons Remaining</span>
                  <span className="font-medium text-deep-ocean">
                    {Math.max(0, stats.total_lessons - stats.completed_lessons)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-navy/60">Quizzes Passed</span>
                  <span className="font-medium text-deep-ocean">
                    {stats.quizzes_passed}
                  </span>
                </div>
                {stats.estimated_time_remaining > 0 && (
                  <div className="flex justify-between">
                    <span className="text-dark-navy/60">Est. Time Remaining</span>
                    <span className="font-medium text-deep-ocean">
                      {Math.round(stats.estimated_time_remaining)} min
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* User Profile Quick View */}
            <div className="bg-white rounded-brand-lg shadow-card p-4">
              <div className="flex items-center gap-3">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.first_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-deep-ocean/10 flex items-center justify-center text-2xl">
                    {user?.first_name?.charAt(0) || '👤'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-deep-ocean">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-dark-navy/60 truncate">
                    {user?.email}
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="text-clear-teal text-sm hover:underline"
                >
                  Edit
                </Link>
              </div>
              {user?.experience_level && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-dark-navy/60">
                    Level: <span className="font-medium text-deep-ocean capitalize">
                      {user.experience_level}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;