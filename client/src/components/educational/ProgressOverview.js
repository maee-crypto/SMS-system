import React from 'react';
import StatCard from '../ui/StatCard';

const ProgressOverview = ({ modules = [], userProgress = {} }) => {
  const calculateStats = () => {
    const totalModules = modules.length;
    const totalLessons = modules.reduce((acc, module) => acc + (module.modules?.length || 0), 0);
    const completedLessons = Object.values(userProgress).filter(Boolean).length;
    const completedModules = modules.filter(module => {
      const moduleLessons = module.modules || [];
      return moduleLessons.every(lesson => userProgress[lesson.id]);
    }).length;
    
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    return {
      totalModules,
      totalLessons,
      completedLessons,
      completedModules,
      overallProgress
    };
  };

  const stats = calculateStats();

  const getMotivationalMessage = () => {
    if (stats.overallProgress === 0) {
      return "Ready to start your cybersecurity journey?";
    } else if (stats.overallProgress < 25) {
      return "Great start! Keep building your knowledge.";
    } else if (stats.overallProgress < 50) {
      return "You're making excellent progress!";
    } else if (stats.overallProgress < 75) {
      return "Impressive! You're becoming a security expert.";
    } else if (stats.overallProgress < 100) {
      return "Almost there! You're doing fantastic.";
    } else {
      return "Congratulations! You've completed all modules!";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'green';
    if (progress >= 50) return 'purple';
    if (progress >= 25) return 'orange';
    return 'blue';
  };

  const statCards = [
    {
      title: 'Total Modules',
      value: stats.totalModules,
      icon: '📚',
      color: 'blue',
      description: 'Available learning modules',
      trend: null
    },
    {
      title: 'Completed Lessons',
      value: `${stats.completedLessons}/${stats.totalLessons}`,
      icon: '✅',
      color: 'green',
      description: 'Lessons finished',
      trend: stats.completedLessons > 0 ? 15 : null
    },
    {
      title: 'Overall Progress',
      value: `${stats.overallProgress}%`,
      icon: '📊',
      color: getProgressColor(stats.overallProgress),
      description: 'Your learning journey',
      trend: stats.overallProgress > 0 ? 8 : null
    },
    {
      title: 'Completed Modules',
      value: `${stats.completedModules}/${stats.totalModules}`,
      icon: '🏆',
      color: 'orange',
      description: 'Full modules mastered',
      trend: stats.completedModules > 0 ? 12 : null
    }
  ];

  return (
    <div className="mb-8">
      {/* Header with Motivation */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Progress</h2>
            <p className="text-gray-600 text-lg">{getMotivationalMessage()}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600 mb-1">{stats.overallProgress}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
        
        {/* Main Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{stats.completedLessons} of {stats.totalLessons} lessons</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${stats.overallProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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
            onClick={() => console.log(`View ${stat.title} details`)}
            className="hover:shadow-xl transition-all duration-300"
          />
        ))}
      </div>

      {/* Module Progress Breakdown */}
      {modules.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Module Progress</h3>
          <div className="space-y-4">
            {modules.map((module, index) => {
              const moduleLessons = module.modules || [];
              const completedModuleLessons = moduleLessons.filter(lesson => userProgress[lesson.id]).length;
              const moduleProgress = moduleLessons.length > 0 ? Math.round((completedModuleLessons / moduleLessons.length) * 100) : 0;
              
              return (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${module.color}-500 to-${module.color}-600 rounded-xl flex items-center justify-center shadow-sm`}>
                    <span className="text-2xl text-white font-bold">{module.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{module.title}</h4>
                      <span className="text-sm font-bold text-gray-700">{moduleProgress}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{completedModuleLessons} of {moduleLessons.length} lessons completed</span>
                      <span className="text-xs">{module.duration}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          moduleProgress >= 80 ? 'bg-green-500' :
                          moduleProgress >= 50 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${moduleProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      moduleProgress === 100 ? 'bg-green-100 text-green-800' :
                      moduleProgress > 0 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {moduleProgress === 100 ? 'Completed' : moduleProgress > 0 ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">🏆</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
            <p className="text-gray-600">Track your learning milestones</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'First Steps', icon: '🌱', earned: stats.completedLessons > 0, description: 'Complete your first lesson' },
            { name: 'Dedicated Learner', icon: '📚', earned: stats.completedLessons >= 5, description: 'Complete 5 lessons' },
            { name: 'Module Master', icon: '🎯', earned: stats.completedModules > 0, description: 'Complete a full module' },
            { name: 'Security Expert', icon: '🛡️', earned: stats.overallProgress >= 80, description: 'Reach 80% progress' }
          ].map((achievement, index) => (
            <div key={index} className={`text-center p-4 rounded-xl transition-all duration-300 ${
              achievement.earned 
                ? 'bg-white shadow-md border border-yellow-200' 
                : 'bg-gray-100 opacity-50'
            }`}>
              <div className={`text-3xl mb-2 ${achievement.earned ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <h4 className={`font-semibold text-sm mb-1 ${
                achievement.earned ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.name}
              </h4>
              <p className={`text-xs ${
                achievement.earned ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview; 