import React from 'react';
import { Link } from 'react-router-dom';

const LearningResources = () => {
  const resources = [
    {
      id: 'phishing-basics',
      title: 'Phishing Fundamentals',
      description: 'Learn the basics of phishing attacks and how to identify them',
      duration: '15 min',
      level: 'Beginner',
      progress: 100,
      status: 'completed',
      icon: 'shield'
    },
    {
      id: 'social-engineering',
      title: 'Social Engineering',
      description: 'Understand psychological manipulation techniques',
      duration: '20 min',
      level: 'Intermediate',
      progress: 60,
      status: 'in_progress',
      icon: 'users'
    },
    {
      id: 'email-security',
      title: 'Email Security Best Practices',
      description: 'Master email security and threat detection',
      duration: '25 min',
      level: 'Advanced',
      progress: 0,
      status: 'not_started',
      icon: 'mail'
    },
    {
      id: 'password-security',
      title: 'Password & Authentication',
      description: 'Learn about strong passwords and multi-factor authentication',
      duration: '18 min',
      level: 'Beginner',
      progress: 0,
      status: 'not_started',
      icon: 'lock'
    }
  ];

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'shield':
        return (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      case 'mail':
        return (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      case 'lock':
        return (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-green-600';
      case 'in_progress':
        return 'from-blue-500 to-blue-600';
      case 'not_started':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      default:
        return 'Not Started';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Learning Resources</h3>
            <p className="card-subtitle">Expand your cybersecurity knowledge</p>
          </div>
          <Link 
            to="/educational-modules" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="group p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor(resource.status)} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                {getIconComponent(resource.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {resource.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {resource.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{resource.duration}</span>
                      <span>•</span>
                      <span className="capitalize">{resource.level}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {resource.progress}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {getStatusText(resource.status)}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        resource.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600' 
                          : resource.status === 'in_progress'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'bg-gray-300'
                      }`} 
                      style={{ width: `${resource.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Ready to learn more?</span>
          <Link to="/educational-modules" className="text-blue-600 hover:text-blue-700 font-medium">
            Explore Modules
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LearningResources; 