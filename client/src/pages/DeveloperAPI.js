import React, { useState, useEffect } from 'react';

const DeveloperAPI = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKey, setApiKey] = useState('sk_test_1234567890abcdef');
  const [endpoints, setEndpoints] = useState([]);

  useEffect(() => {
    setEndpoints([
      {
        id: 1,
        name: 'Threat Detection API',
        endpoint: '/api/v1/threats/detect',
        method: 'POST',
        description: 'Analyze URLs, emails, and messages for phishing indicators',
        status: 'active'
      },
      {
        id: 2,
        name: 'User Behavior Analytics',
        endpoint: '/api/v1/analytics/behavior',
        method: 'GET',
        description: 'Get user interaction patterns and vulnerability assessments',
        status: 'active'
      },
      {
        id: 3,
        name: 'Alert Generation',
        endpoint: '/api/v1/alerts/generate',
        method: 'POST',
        description: 'Create intelligent security alerts based on threat patterns',
        status: 'beta'
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container py-8">
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl font-bold">🔧</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                <span className="gradient-text">Developer API</span>
              </h1>
              <p className="text-xl text-gray-600">
                Build better anti-phishing tools and smarter alerts
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <div className="card-header">
            <h2 className="card-title">API Authentication</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Your API Key</h3>
                <p className="text-sm text-gray-600">Use this key to authenticate your API requests</p>
              </div>
              <code className="px-3 py-2 bg-gray-100 rounded text-sm font-mono">{apiKey}</code>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
            <div className="space-y-6">
              {endpoints.map((endpoint) => (
                <div key={endpoint.id} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{endpoint.name}</h3>
                  <p className="text-gray-600 mb-3">{endpoint.description}</p>
                  <div className="flex items-center space-x-3">
                    <span className="badge badge-primary">{endpoint.method}</span>
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {endpoint.endpoint}
                    </code>
                    <span className="badge badge-success">{endpoint.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperAPI; 