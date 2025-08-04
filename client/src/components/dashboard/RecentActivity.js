import React, { useState } from 'react';

const RecentActivity = ({ activities = [] }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Activities', icon: '📋' },
    { id: 'simulation', label: 'Simulations', icon: '🎮' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'achievement', label: 'Achievements', icon: '🏆' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'simulation':
        return { icon: '🎮', color: 'bg-blue-100 text-blue-600' };
      case 'learning':
        return { icon: '📚', color: 'bg-purple-100 text-purple-600' };
      case 'achievement':
        return { icon: '🏆', color: 'bg-yellow-100 text-yellow-600' };
      case 'quiz':
        return { icon: '❓', color: 'bg-green-100 text-green-600' };
      default:
        return { icon: '📝', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredActivities = selectedFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedFilter);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-gray-600 mt-1">Your latest training sessions and achievements</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      {/* Activity Filter */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap
              ${selectedFilter === filter.id
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => {
            const activityIcon = getActivityIcon(activity.type);
            return (
              <div 
                key={activity.id || index}
                className="group relative p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  {/* Activity Icon */}
                  <div className={`w-12 h-12 ${activityIcon.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-lg font-bold">{activityIcon.icon}</span>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {activity.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {activity.score !== undefined && (
                          <span className={`text-sm font-bold ${getScoreColor(activity.score)}`}>
                            {activity.score}%
                          </span>
                        )}
                        {activity.status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {activity.description || `Completed ${activity.type} training session`}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatTimeAgo(activity.date)}</span>
                        </span>
                        {activity.duration && (
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{activity.duration}</span>
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                {activity.progress !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{activity.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${activity.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600 mb-4">Start your first simulation to see your activity here</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Start Training
            </button>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      {filteredActivities.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Activity Summary</h4>
              <p className="text-sm text-gray-600">
                {filteredActivities.length} activities in the last 7 days
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(filteredActivities.reduce((acc, activity) => acc + (activity.score || 0), 0) / filteredActivities.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </div>
      )}

      {/* View All Button */}
      {filteredActivities.length > 0 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            View All Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity; 