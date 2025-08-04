import React, { useState } from 'react';

const ModuleCard = ({ 
  title, 
  description, 
  icon, 
  color = 'blue',
  progress = 0,
  difficulty = 'beginner',
  duration = '',
  status = 'pending',
  onClick,
  className = '',
  lessons = [],
  loading = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      hover: 'hover:border-blue-300',
      text: 'text-blue-700'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'from-green-50 to-green-100',
      border: 'border-green-200',
      hover: 'hover:border-green-300',
      text: 'text-green-700'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      hover: 'hover:border-purple-300',
      text: 'text-purple-700'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      light: 'from-orange-50 to-orange-100',
      border: 'border-orange-200',
      hover: 'hover:border-orange-300',
      text: 'text-orange-700'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      light: 'from-red-50 to-red-100',
      border: 'border-red-200',
      hover: 'hover:border-red-300',
      text: 'text-red-700'
    },
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      light: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-300',
      text: 'text-indigo-700'
    }
  };

  const difficultyColors = {
    beginner: { bg: 'bg-green-100', text: 'text-green-800', icon: '🌱' },
    intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '📈' },
    advanced: { bg: 'bg-red-100', text: 'text-red-800', icon: '🚀' }
  };

  const statusColors = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⏳' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔄' }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const difficultyConfig = difficultyColors[difficulty] || difficultyColors.beginner;
  const statusConfig = statusColors[status] || statusColors.pending;

  const getProgressColor = () => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getProgressText = () => {
    if (progress === 0) return 'Not started';
    if (progress === 100) return 'Completed';
    return `${progress}% complete`;
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ease-out
        bg-white ${colors.border} ${colors.hover}
        ${onClick ? 'cursor-pointer' : ''}
        ${isHovered ? 'scale-105 shadow-xl' : 'shadow-lg'}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={onClick ? `Start learning ${title}` : undefined}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className={`w-full h-full bg-gradient-to-br ${colors.bg} rounded-full`}></div>
        </div>
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-14 h-14 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
            <span className="text-2xl text-white font-bold">{icon}</span>
          </div>
          {progress !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{progress}%</div>
              <div className="text-sm text-gray-600">{getProgressText()}</div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {description}
              </p>
            </>
          )}
        </div>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between mb-6 mt-4">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyConfig.bg} ${difficultyConfig.text} flex items-center space-x-1`}>
              <span>{difficultyConfig.icon}</span>
              <span>{difficulty}</span>
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} flex items-center space-x-1`}>
              <span>{statusConfig.icon}</span>
              <span>{status}</span>
            </span>
          </div>
          {duration && (
            <div className="flex items-center space-x-1 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{duration}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* Lessons Preview */}
        {lessons.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Lessons</h4>
            <div className="space-y-2">
              {lessons.slice(0, 3).map((lesson, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    lesson.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {lesson.completed ? '✓' : index + 1}
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{lesson.title}</span>
                  <span className="text-xs text-gray-500">{lesson.duration}</span>
                </div>
              ))}
              {lessons.length > 3 && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500">+{lessons.length - 3} more lessons</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <button 
          className={`
            w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2
            ${progress === 100 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : progress > 0 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
            ${isHovered ? 'scale-105' : ''}
          `}
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>
                {progress === 100 ? 'Review Module' : progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && onClick && (
        <div className="absolute inset-0 bg-black bg-opacity-5 rounded-2xl transition-opacity duration-300"></div>
      )}
    </div>
  );
};

export default ModuleCard; 