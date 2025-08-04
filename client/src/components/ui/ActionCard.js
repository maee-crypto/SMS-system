import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ActionCard = ({ 
  title, 
  description, 
  icon, 
  to, 
  onClick,
  color = 'blue',
  className = '',
  badge = null,
  status = null,
  loading = false,
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 border-blue-200',
      hover: 'hover:bg-blue-100 hover:border-blue-300',
      icon: 'from-blue-500 to-blue-600',
      text: 'text-blue-700',
      arrow: 'group-hover:text-blue-600'
    },
    green: {
      bg: 'bg-green-50 border-green-200',
      hover: 'hover:bg-green-100 hover:border-green-300',
      icon: 'from-green-500 to-green-600',
      text: 'text-green-700',
      arrow: 'group-hover:text-green-600'
    },
    purple: {
      bg: 'bg-purple-50 border-purple-200',
      hover: 'hover:bg-purple-100 hover:border-purple-300',
      icon: 'from-purple-500 to-purple-600',
      text: 'text-purple-700',
      arrow: 'group-hover:text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50 border-orange-200',
      hover: 'hover:bg-orange-100 hover:border-orange-300',
      icon: 'from-orange-500 to-orange-600',
      text: 'text-orange-700',
      arrow: 'group-hover:text-orange-600'
    },
    red: {
      bg: 'bg-red-50 border-red-200',
      hover: 'hover:bg-red-100 hover:border-red-300',
      icon: 'from-red-500 to-red-600',
      text: 'text-red-700',
      arrow: 'group-hover:text-red-600'
    },
    indigo: {
      bg: 'bg-indigo-50 border-indigo-200',
      hover: 'hover:bg-indigo-100 hover:border-indigo-300',
      icon: 'from-indigo-500 to-indigo-600',
      text: 'text-indigo-700',
      arrow: 'group-hover:text-indigo-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const getStatusIndicator = () => {
    if (!status) return null;
    
    const statusConfig = {
      active: { color: 'bg-green-500', label: 'Active' },
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      completed: { color: 'bg-blue-500', label: 'Completed' },
      error: { color: 'bg-red-500', label: 'Error' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 ${config.color} rounded-full`}></div>
        <span className="text-xs text-gray-600">{config.label}</span>
      </div>
    );
  };

  const content = (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ease-out group
        ${colors.bg} ${colors.hover}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        ${isHovered && !disabled ? 'shadow-xl' : 'shadow-md'}
        ${className}
      `}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={disabled ? undefined : (e) => e.key === 'Enter' && (onClick ? onClick() : null)}
      aria-label={disabled ? undefined : `Navigate to ${title}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6">
          <div className={`w-full h-full bg-gradient-to-br ${colors.icon} rounded-full`}></div>
        </div>
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={`w-14 h-14 bg-gradient-to-br ${colors.icon} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ${isHovered && !disabled ? 'scale-110' : ''}`}>
            <span className="text-2xl text-white font-bold">{icon}</span>
          </div>

          {/* Badge and Status */}
          <div className="flex flex-col items-end space-y-2">
            {badge && (
              <span className="px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-700 shadow-sm">
                {badge}
              </span>
            )}
            {getStatusIndicator()}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-gray-800 transition-colors">
                {title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {description}
              </p>
            </>
          )}
        </div>

        {/* Arrow Indicator */}
        <div className={`absolute bottom-4 right-4 transition-all duration-300 ${colors.arrow} ${isHovered && !disabled ? 'translate-x-1' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Hover Effect Overlay */}
        {isHovered && !disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-5 rounded-2xl transition-opacity duration-300"></div>
        )}
      </div>
    </div>
  );

  if (disabled) {
    return content;
  }

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
};

export default ActionCard; 