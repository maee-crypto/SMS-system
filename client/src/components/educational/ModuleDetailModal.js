import React, { useState } from 'react';

const ModuleDetailModal = ({ module, onClose, userProgress = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedLessons, setExpandedLessons] = useState(new Set());

  if (!module) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'lessons', label: 'Lessons', icon: '📚' },
    { id: 'objectives', label: 'Objectives', icon: '🎯' },
    { id: 'resources', label: 'Resources', icon: '📖' }
  ];

  const toggleLessonExpansion = (lessonId) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const getLessonStatus = (lesson) => {
    if (userProgress[lesson.id]) {
      return { status: 'completed', color: 'bg-green-100 text-green-800', icon: '✅' };
    }
    return { status: 'pending', color: 'bg-gray-100 text-gray-800', icon: '⏳' };
  };

  const getLessonTypeIcon = (type) => {
    switch (type) {
      case 'video': return '🎥';
      case 'interactive': return '🎮';
      case 'quiz': return '❓';
      case 'reading': return '📖';
      default: return '📝';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br from-${module.color}-500 to-${module.color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-3xl text-white font-bold">{module.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                  <span className="text-gray-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{module.duration}</span>
                  </span>
                  {module.progress !== undefined && (
                    <span className="text-blue-600 font-medium">{module.progress}% complete</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex space-x-1 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{module.description}</p>
              </div>

              {module.progress !== undefined && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Progress</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Module Progress</span>
                      <span className="text-sm font-bold text-gray-900">{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">What you'll learn</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Understand phishing fundamentals</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Identify common attack vectors</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Develop security best practices</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Prerequisites</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Basic computer literacy</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Internet access</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Willingness to learn</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Lessons</h3>
              {module.modules?.map((lesson, index) => {
                const lessonStatus = getLessonStatus(lesson);
                const isExpanded = expandedLessons.has(lesson.id);
                
                return (
                  <div key={lesson.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div 
                      className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => toggleLessonExpansion(lesson.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-lg">{getLessonTypeIcon(lesson.type)}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{lesson.duration}</span>
                              </span>
                              <span className="capitalize">{lesson.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${lessonStatus.color}`}>
                            {lessonStatus.icon} {lessonStatus.status}
                          </span>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <p className="text-gray-600 mb-4">{lesson.content}</p>
                        <div className="flex items-center space-x-3">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Start Lesson
                          </button>
                          {lessonStatus.status === 'completed' && (
                            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors">
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Knowledge</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">1</span>
                      </div>
                      <span className="text-gray-600">Understand the psychology behind phishing attacks</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">2</span>
                      </div>
                      <span className="text-gray-600">Identify common phishing techniques and red flags</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">3</span>
                      </div>
                      <span className="text-gray-600">Learn about social engineering tactics</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Skills</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">1</span>
                      </div>
                      <span className="text-gray-600">Analyze suspicious emails and messages</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">2</span>
                      </div>
                      <span className="text-gray-600">Implement security best practices</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm font-bold">3</span>
                      </div>
                      <span className="text-gray-600">Protect personal and organizational data</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Success Criteria</h4>
                    <p className="text-sm text-gray-600">
                      By the end of this module, you should be able to identify and avoid 90% of common phishing attempts, 
                      understand the psychological triggers used by attackers, and implement effective security measures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Reading Materials</h4>
                  <div className="space-y-3">
                    <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📖</span>
                        <div>
                          <h5 className="font-medium text-gray-900">Phishing Prevention Guide</h5>
                          <p className="text-sm text-gray-600">Comprehensive guide to preventing phishing attacks</p>
                        </div>
                      </div>
                    </a>
                    <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <h5 className="font-medium text-gray-900">Security Best Practices</h5>
                          <p className="text-sm text-gray-600">Essential security practices for everyone</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">External Links</h4>
                  <div className="space-y-3">
                    <a href="#" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🔗</span>
                        <div>
                          <h5 className="font-medium text-gray-900">CISA Phishing Resources</h5>
                          <p className="text-sm text-gray-600">Official government resources on phishing</p>
                        </div>
                      </div>
                    </a>
                    <a href="#" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🎥</span>
                        <div>
                          <h5 className="font-medium text-gray-900">Video Tutorials</h5>
                          <p className="text-sm text-gray-600">Visual guides and demonstrations</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {module.progress === 100 ? 'Module completed!' : 'Ready to start learning?'}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg">
                {module.progress === 100 ? 'Review Module' : 'Start Learning'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetailModal; 