import React, { useState } from 'react';

const SecurityFeatures = () => {
  const [activeFeature, setActiveFeature] = useState('2fa');

  const features = [
    {
      id: '2fa',
      title: 'Two-Factor Authentication (2FA)',
      description: 'Enhance account security with multi-factor authentication',
      icon: '🔐',
      color: 'blue'
    },
    {
      id: 'biometrics',
      title: 'Biometric Authentication',
      description: 'Secure access using fingerprint, face ID, or voice recognition',
      icon: '👆',
      color: 'green'
    },
    {
      id: 'seed-phrase',
      title: 'Seed Phrase Protection',
      description: 'Advanced warnings and protection for cryptocurrency wallets',
      icon: '🔑',
      color: 'orange'
    },
    {
      id: 'ai-detection',
      title: 'AI-Powered Threat Detection',
      description: 'Machine learning algorithms to detect and prevent attacks',
      icon: '🤖',
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container py-8">
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl font-bold">🛡️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                <span className="gradient-text">Security Features</span>
              </h1>
              <p className="text-xl text-gray-600">
                Advanced security features for platforms to adopt
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature) => (
            <div key={feature.id} className="card group hover:scale-105 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{feature.description}</p>
              
              <button
                onClick={() => setActiveFeature(feature.id)}
                className={`btn w-full ${activeFeature === feature.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {activeFeature === feature.id ? 'Viewing Demo' : 'View Demo'}
              </button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {features.find(f => f.id === activeFeature)?.title} Demo
            </h2>
            
            {activeFeature === '2fa' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-gray-400">QR Code</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Scan with authenticator app</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input type="text" placeholder="Enter 6-digit code" className="form-input flex-1" maxLength="6" />
                  <button className="btn btn-primary">Verify</button>
                </div>
              </div>
            )}
            
            {activeFeature === 'biometrics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">👆</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Fingerprint</h4>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">👁️</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Face ID</h4>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🎤</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Voice</h4>
                  </div>
                </div>
                <button className="btn btn-primary w-full">Setup Biometric Authentication</button>
              </div>
            )}
            
            {activeFeature === 'seed-phrase' && (
              <div className="space-y-4">
                <div className="alert alert-warning">
                  <strong>⚠️ Security Warning:</strong> Never share your seed phrase with anyone.
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Example Seed Phrase</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['abandon', 'ability', 'able', 'about', 'above', 'absent'].map((word, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-sm font-mono">
                        {index + 1}. {word}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeFeature === 'ai-detection' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">✅ Safe URL</h4>
                    <p className="text-sm text-green-800">https://legitimate-bank.com</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">🚨 Suspicious URL</h4>
                    <p className="text-sm text-red-800">https://legitimate-bank.xyz.com</p>
                  </div>
                </div>
                <button className="btn btn-primary w-full">Test AI Detection</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityFeatures; 