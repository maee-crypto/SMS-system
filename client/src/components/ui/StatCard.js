import React, { useState } from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  size = 'medium',
  onClick,
  className = '',
  trend = null,
  description = '',
  loading = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100',
      icon: 'from-blue-500 to-blue-600',
      text: 'text-blue-700',
      border: 'border-blue-200',
      hover: 'hover:from-blue-100 hover:to-blue-200 hover:border-blue-300'
    },
    green: {
      bg: 'from-green-50 to-green-100',
      icon: 'from-green-500 to-green-600',
      text: 'text-green-700',
      border: 'border-green-200',
      hover: 'hover:from-green-100 hover:to-green-200 hover:border-green-300'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      icon: 'from-purple-500 to-purple-600',
      text: 'text-purple-700',
      border: 'border-purple-200',
      hover: 'hover:from-purple-100 hover:to-purple-200 hover:border-purple-300'
    },
    orange: {
      bg: 'from-orange-50 to-orange-100',
      icon: 'from-orange-500 to-orange-600',
      text: 'text-orange-700',
      border: 'border-orange-200',
      hover: 'hover:from-orange-100 hover:to-orange-200 hover:border-orange-300'
    },
    red: {
      bg: 'from-red-50 to-red-100',
      icon: 'from-red-500 to-red-600',
      text: 'text-red-700',
      border: 'border-red-200',
      hover: 'hover:from-red-100 hover:to-red-200 hover:border-red-300'
    },
    indigo: {
      bg: 'from-indigo-50 to-indigo-100',
      icon: 'from-indigo-500 to-indigo-600',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      hover: 'hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300'
    }
  };

  const sizeClasses = {
    small: {
      container: 'p-4',
      icon: 'w-8 h-8',
      value: 'text-xl',
      title: 'text-sm'
    },
    medium: {
      container: 'p-6',
      icon: 'w-10 h-10',
      value: 'text-2xl',
      title: 'text-sm'
    },
    large: {
      container: 'p-8',
      icon: 'w-12 h-12',
      value: 'text-3xl',
      title: 'text-base'
    }
  };

  const getIconComponent = (iconName) => {
    const iconSize = sizeClasses[size].icon;
    
    switch (iconName) {
      case 'target':
        return (
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
      case 'check':
        return (
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'chart':
        return (
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'fire':
        return (
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        );
      case 'shield':
        return (
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'users':
        return (
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const sizes = sizeClasses[size];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) {
      return (
        <div className="flex items-center text-green-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
          +{trend}%
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
          </svg>
          {trend}%
        </div>
      );
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ease-out
        ${colors.bg} ${colors.border} ${colors.hover}
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
      aria-label={onClick ? `Click to view ${title} details` : undefined}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className={`w-full h-full bg-gradient-to-br ${colors.icon} rounded-full`}></div>
        </div>
      </div>

      <div className={`relative ${sizes.container}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`${sizes.icon} bg-gradient-to-br ${colors.icon} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
            {getIconComponent(icon)}
          </div>
          {trend && (
            <div className="text-right">
              {getTrendIcon()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          {loading ? (
            <div className="animate-pulse">
              <div className={`h-8 bg-gray-300 rounded mb-2`}></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              <div className={`font-bold ${colors.text} ${sizes.value} leading-tight`}>
                {value}
              </div>
              <div className={`font-medium text-gray-700 ${sizes.title} leading-relaxed`}>
                {title}
              </div>
              {description && (
                <p className="text-gray-600 text-xs leading-relaxed">
                  {description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Interactive Indicator */}
        {onClick && (
          <div className={`absolute bottom-2 right-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-2 h-2 bg-gradient-to-r ${colors.icon} rounded-full`}></div>
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && onClick && (
        <div className="absolute inset-0 bg-black bg-opacity-5 rounded-2xl transition-opacity duration-300"></div>
      )}
    </div>
  );
};

export default StatCard; 