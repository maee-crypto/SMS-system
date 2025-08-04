import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { simulationsAPI } from '../services/api';
import { apiUtils } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import ModuleCard from '../components/ui/ModuleCard';

const Simulations = () => {
  const { user } = useContext(AuthContext);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    platform: ''
  });

  useEffect(() => {
    fetchSimulations();
  }, [filters]);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.platform) params.platform = filters.platform;

      const response = await simulationsAPI.getAll(params);
      setSimulations(response.data.simulations || []);

    } catch (error) {
      console.error('Error fetching simulations:', error);
      const { message } = apiUtils.handleError(error);
      setError(message);
      setSimulations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sms-call': return '📱';
      case 'sms-website-call': return '🌐';
      case 'email-phishing': return '📧';
      case 'voice-phishing': return '📞';
      case 'social-media': return '📱';
      case 'wallet-phishing': return '💰';
      default: return '🎯';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'metamask': return '🦊';
      case 'binance': return '📊';
      case 'trust-wallet': return '🛡️';
      case 'coinbase': return '🪙';
      case 'paypal': return '💳';
      case 'bank': return '🏦';
      case 'social-media': return '📱';
      default: return '🌐';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader 
          title="Phishing Simulations" 
          subtitle="Test your security awareness with realistic phishing scenarios"
          icon="target"
          className="mb-8"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Simulations</div>
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={fetchSimulations} 
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Simulations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="form-control"
              >
                <option value="">All Types</option>
                <option value="sms-call">SMS + Call</option>
                <option value="sms-website-call">SMS + Website + Call</option>
                <option value="email-phishing">Email Phishing</option>
                <option value="voice-phishing">Voice Phishing</option>
                <option value="social-media">Social Media</option>
                <option value="wallet-phishing">Wallet Phishing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select 
                value={filters.difficulty} 
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="form-control"
              >
                <option value="">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select 
                value={filters.platform} 
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="form-control"
              >
                <option value="">All Platforms</option>
                <option value="metamask">MetaMask</option>
                <option value="binance">Binance</option>
                <option value="trust-wallet">Trust Wallet</option>
                <option value="coinbase">Coinbase</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank</option>
                <option value="social-media">Social Media</option>
                <option value="generic">Generic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Simulations Grid */}
        {simulations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Simulations Found</h3>
            <p className="text-gray-600 mb-6">
              {error ? 'There was an error loading simulations.' : 'No simulations match your current filters.'}
            </p>
            {!error && (
              <button 
                onClick={() => setFilters({ type: '', difficulty: '', platform: '' })}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((simulation) => (
              <ModuleCard
                key={simulation._id}
                title={simulation.title}
                description={simulation.description}
                difficulty={simulation.difficulty}
                duration={`${simulation.estimatedDuration || 15} min`}
                icon={getTypeIcon(simulation.type)}
                tags={[
                  { text: simulation.type.replace('-', ' '), color: 'blue' },
                  { text: simulation.targetPlatform, color: 'green' }
                ]}
                stats={{
                  successRate: simulation.successRate || 0,
                  totalAttempts: simulation.totalAttempts || 0,
                  averageScore: simulation.averageScore || 0
                }}
                action={
                  <Link 
                    to={`/simulations/${simulation._id}`}
                    className="btn btn-primary w-full"
                  >
                    Start Simulation
                  </Link>
                }
                className="h-full"
              />
            ))}
          </div>
        )}

        {/* Educational Note */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-blue-600 text-2xl mr-4">💡</div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">About These Simulations</h3>
              <p className="text-blue-800 mb-3">
                These simulations are designed to test your ability to recognize and respond to real-world phishing attempts. 
                They use realistic scenarios that you might encounter in your daily digital life.
              </p>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>Beginner:</strong> Basic phishing techniques with obvious red flags</li>
                <li>• <strong>Intermediate:</strong> More sophisticated attacks with subtle indicators</li>
                <li>• <strong>Advanced:</strong> Highly convincing scenarios requiring careful analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulations; 