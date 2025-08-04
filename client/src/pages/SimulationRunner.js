import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SimulationRunner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [userChoices, setUserChoices] = useState([]);

  const steps = [
    {
      title: 'SMS Alert',
      content: 'You receive a text message: "URGENT: Your MetaMask wallet has been compromised. Click here to secure: bit.ly/fake-link"',
      type: 'sms',
      icon: '📱',
      color: 'blue',
      choices: [
        { id: 1, text: 'Click the link immediately', correct: false, feedback: 'This is a phishing attempt! Never click suspicious links.' },
        { id: 2, text: 'Ignore the message', correct: true, feedback: 'Good choice! Legitimate companies don\'t send urgent security alerts via SMS.' },
        { id: 3, text: 'Call the number back', correct: false, feedback: 'Calling back could lead to voice phishing. Don\'t trust unknown numbers.' }
      ]
    },
    {
      title: 'Fake Website',
      content: 'You click the link and see a fake MetaMask login page asking for your seed phrase.',
      type: 'website',
      icon: '🌐',
      color: 'red',
      choices: [
        { id: 1, text: 'Enter your seed phrase', correct: false, feedback: 'Never share your seed phrase! This is a major red flag.' },
        { id: 2, text: 'Close the page immediately', correct: true, feedback: 'Excellent! You recognized the fake website and protected your assets.' },
        { id: 3, text: 'Check the URL carefully', correct: true, feedback: 'Good thinking! Always verify URLs before entering sensitive information.' }
      ]
    },
    {
      title: 'Phone Call',
      content: 'You receive a call from "MetaMask Support" asking you to verify your wallet.',
      type: 'call',
      icon: '📞',
      color: 'orange',
      choices: [
        { id: 1, text: 'Provide wallet details', correct: false, feedback: 'Never share wallet details over the phone. This is vishing!' },
        { id: 2, text: 'Hang up immediately', correct: true, feedback: 'Perfect! Legitimate companies don\'t call asking for sensitive information.' },
        { id: 3, text: 'Ask for verification', correct: false, feedback: 'Even asking for verification can lead to more social engineering attempts.' }
      ]
    }
  ];

  const handleChoice = (choiceId) => {
    const currentStepData = steps[currentStep];
    const choice = currentStepData.choices.find(c => c.id === choiceId);
    
    setUserChoices([...userChoices, { step: currentStep, choice }]);
    
    // Show feedback briefly before moving to next step
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setSimulationComplete(true);
      }
    }, 2000);
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const calculateScore = () => {
    const correctChoices = userChoices.filter(choice => choice.choice.correct).length;
    return Math.round((correctChoices / userChoices.length) * 100);
  };

  if (simulationComplete) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="card max-w-2xl w-full">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simulation Complete!</h2>
            <div className="mb-8">
              <div className="text-4xl font-bold gradient-text mb-2">{score}%</div>
              <div className="text-gray-600">Your Score</div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You've completed the phishing simulation. {score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good job!' : 'Keep practicing!'} 
              Review your choices to learn from the experience.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">{userChoices.length}</div>
                <div className="text-sm text-gray-600">Total Steps</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {userChoices.filter(choice => choice.choice.correct).length}
                </div>
                <div className="text-sm text-gray-600">Correct Choices</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {userChoices.filter(choice => !choice.choice.correct).length}
                </div>
                <div className="text-sm text-gray-600">Learning Opportunities</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/simulations')}
                className="btn btn-secondary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View All Simulations
              </button>
              <button
                onClick={handleComplete}
                className="btn btn-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const selectedChoice = userChoices.find(choice => choice.step === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br from-${currentStepData.color}-500 to-${currentStepData.color}-600 rounded-2xl flex items-center justify-center shadow-xl`}>
                <span className="text-white text-2xl">{currentStepData.icon}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentStepData.title}
                </h1>
                <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold gradient-text">{Math.round(((currentStep + 1) / steps.length) * 100)}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Scenario
                </h2>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <p className="text-gray-700 text-lg leading-relaxed">{currentStepData.content}</p>
                </div>
              </div>
            </div>

            {/* Choices */}
            <div className="card mt-6">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What would you do?
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {currentStepData.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoice(choice.id)}
                      disabled={selectedChoice}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                        selectedChoice 
                          ? choice.correct 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{choice.text}</span>
                        {selectedChoice && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            choice.correct ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {choice.correct ? (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      {selectedChoice && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          choice.correct ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <p className={`text-sm ${
                            choice.correct ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {choice.feedback}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Progress
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < currentStep 
                          ? 'bg-green-500 text-white' 
                          : index === currentStep 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index < currentStep ? '✓' : index + 1}
                      </div>
                      <span className={`text-sm ${
                        index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Quick Tips
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-700">Trust your instincts - if something feels off, it probably is</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-700">Never share passwords, seed phrases, or personal info</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-700">Legitimate companies don't pressure you to act quickly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationRunner; 