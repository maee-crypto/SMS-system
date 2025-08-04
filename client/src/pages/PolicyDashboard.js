import React, { useState, useEffect } from 'react';

const PolicyDashboard = () => {
  const [threatData, setThreatData] = useState({});
  const [policies, setPolicies] = useState([]);
  const [compliance, setCompliance] = useState({});

  useEffect(() => {
    setThreatData({
      totalThreats: 1247,
      criticalThreats: 89,
      phishingAttempts: 892,
      socialEngineering: 234
    });

    setPolicies([
      {
        id: 1,
        title: 'Implement Multi-Factor Authentication',
        priority: 'high',
        category: 'authentication',
        description: 'Require 2FA for all user accounts',
        status: 'pending'
      },
      {
        id: 2,
        title: 'Enhanced Email Security Policies',
        priority: 'high',
        category: 'email',
        description: 'Implement advanced email filtering',
        status: 'implemented'
      }
    ]);

    setCompliance({
      gdpr: { score: 85, status: 'compliant' },
      sox: { score: 92, status: 'compliant' },
      hipaa: { score: 78, status: 'needs-improvement' }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container py-8">
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white text-2xl font-bold">🏛️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                <span className="gradient-text">Policy Dashboard</span>
              </h1>
              <p className="text-xl text-gray-600">
                Threat intelligence and policy recommendations
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{threatData.totalThreats}</div>
            <div className="text-gray-600">Total Threats</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{threatData.criticalThreats}</div>
            <div className="text-gray-600">Critical Threats</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text mb-2">{policies.length}</div>
            <div className="text-gray-600">Active Policies</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold gradient-text mb-2">
              {Object.values(compliance).filter(c => c.status === 'compliant').length}/{Object.keys(compliance).length}
            </div>
            <div className="text-gray-600">Compliance Standards</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Policy Recommendations</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{policy.title}</h3>
                    <p className="text-gray-600 mb-3">{policy.description}</p>
                    <div className="flex items-center space-x-3">
                      <span className="badge badge-primary">{policy.priority}</span>
                      <span className="badge badge-secondary">{policy.category}</span>
                      <span className="badge badge-success">{policy.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Compliance Overview</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(compliance).map(([standard, data]) => (
                  <div key={standard} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 uppercase">{standard}</h3>
                      <p className="text-sm text-gray-600">Score: {data.score}%</p>
                    </div>
                    <span className={`badge badge-${data.status === 'compliant' ? 'success' : 'warning'}`}>
                      {data.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDashboard; 