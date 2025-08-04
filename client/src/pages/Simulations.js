import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Simulations = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    setSimulations([
      {
        id: 1,
        title: 'MetaMask Wallet Security Alert',
        description: 'Learn to identify fake wallet security notifications and protect your cryptocurrency assets',
        type: 'wallet-phishing',
        difficulty: 'Medium',
        duration: '10-15 min',
        completed: false,
        icon: '🔐',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Bank Login Verification',
        description: 'Practice recognizing fake banking websites and secure login processes',
        type: 'sms-website-call',
        difficulty: 'Easy',
        duration: '5-10 min',
        completed: true,
        icon: '🏦',
        color: 'green'
      },
      {
        id: 3,
        title: 'Email Phishing Test',
        description: 'Master email security and spot sophisticated phishing emails',
        type: 'email-phishing',
        difficulty: 'Hard',
        duration: '15-20 min',
        completed: false,
        icon: '📧',
        color: 'purple'
      },
      {
        id: 4,
        title: 'SMS Phishing Attack',
        description: 'Learn to identify suspicious text messages and smishing attempts',
        type: 'sms-phishing',
        difficulty: 'Medium',
        duration: '8-12 min',
        completed: false,
        icon: '📱',
        color: 'orange'
      },
      {
        id: 5,
        title: 'Voice Phishing (Vishing)',
        description: 'Understand vishing tactics and phone-based social engineering',
        type: 'voice-phishing',
        difficulty: 'Hard',
        duration: '12-18 min',
        completed: false,
        icon: '📞',
        color: 'red'
      },
      {
        id: 6,
        title: 'Social Media Scam',
        description: 'Recognize fake social media profiles and malicious links',
        type: 'social-media',
        difficulty: 'Easy',
        duration: '6-10 min',
        completed: true,
        icon: '📱',
        color: 'indigo'
      }
    ]);
    setLoading(false);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };
    return colorMap[color] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading simulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl font-bold">🎯</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                <span className="gradient-text">Simulations</span>
              </h1>
              <p className="text-xl text-gray-600">
                Practice with realistic phishing scenarios to improve your cybersecurity awareness
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{simulations.length}</div>
            <div className="text-gray-600">Total Simulations</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text mb-2">
              {simulations.filter(s => s.completed).length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text mb-2">
              {Math.round((simulations.filter(s => s.completed).length / simulations.length) * 100)}%
            </div>
            <div className="text-gray-600">Completion Rate</div>
          </div>
        </div>

        {/* Simulations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {simulations.map((simulation) => (
            <div key={simulation.id} className="card group hover:scale-105 transition-all duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getColorClasses(simulation.color)} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <span className="text-2xl">{simulation.icon}</span>
                </div>
                {simulation.completed && (
                  <div className="badge badge-success">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </div>
                )}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {simulation.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {simulation.description}
              </p>
              
              {/* Meta Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className={`badge badge-${getDifficultyColor(simulation.difficulty)}`}>
                    {simulation.difficulty}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{simulation.duration}</span>
                </div>
              </div>
              
              {/* Action Button */}
              <Link
                to={`/simulations/${simulation.id}`}
                className={`btn w-full ${simulation.completed ? 'btn-secondary' : 'btn-primary'} group-hover:scale-105 transition-transform duration-300`}
              >
                {simulation.completed ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Review Simulation
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Simulation
                  </>
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {simulations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Simulations Available</h3>
            <p className="text-gray-600 mb-6">Check back later for new cybersecurity training scenarios.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulations; 