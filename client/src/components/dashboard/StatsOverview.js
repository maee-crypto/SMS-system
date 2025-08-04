import React from 'react';
import StatCard from '../ui/StatCard';

const StatsOverview = ({ stats, loading = false }) => {
  const statCards = [
    {
      title: 'Total Simulations',
      value: stats.totalSimulations,
      icon: 'target',
      color: 'blue',
      description: 'Available training scenarios',
      trend: 12
    },
    {
      title: 'Completed',
      value: stats.completedSimulations,
      icon: 'check',
      color: 'green',
      description: 'Successfully finished',
      trend: 8
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: 'chart',
      color: 'purple',
      description: 'Your performance level',
      trend: stats.averageScore > 80 ? 5 : -3
    },
    {
      title: 'Learning Streak',
      value: '7 days',
      icon: 'fire',
      color: 'orange',
      description: 'Consistent training',
      trend: 15
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Progress Overview</h2>
          <p className="text-gray-600 mt-1">Track your cybersecurity training journey</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            description={stat.description}
            trend={stat.trend}
            loading={loading}
            onClick={() => console.log(`View ${stat.title} details`)}
            className="hover:shadow-xl transition-all duration-300"
          />
        ))}
      </div>

      {/* Progress Summary */}
      {!loading && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Progress</h3>
              <p className="text-gray-600">You're making great progress! Keep up the momentum.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">85%</div>
              <div className="text-sm text-gray-600">Completion rate</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>This week's goal</span>
              <span>3/4 simulations</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview; 