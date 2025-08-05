import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, simulationsAPI } from '../../services/api';
import { apiUtils } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';

const AdminSimulations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [filteredSimulations, setFilteredSimulations] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    status: '',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSimulation, setEditingSimulation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'sms-phishing',
    difficulty: 'beginner',
    targetPlatform: 'general',
    isActive: true,
    scenario: {
      smsMessage: '',
      websiteUrl: '',
      socialEngineering: {
        urgencyLevel: 'medium',
        psychologicalTriggers: [],
        pressureTactics: [],
        trustBuildingElements: []
      }
    },
    educationalContent: {
      learningObjectives: [],
      redFlags: [],
      preventionTips: [],
      realWorldExamples: [],
      debriefingQuestions: []
    }
  });

  useEffect(() => {
    fetchSimulations();
  }, []);

  useEffect(() => {
    filterSimulations();
  }, [simulations, filters]);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAPI.getSimulations();
      setSimulations(response.data.simulations || []);

    } catch (error) {
      console.error('Error fetching simulations:', error);
      const { message } = apiUtils.handleError(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filterSimulations = () => {
    let filtered = [...simulations];

    if (filters.type) {
      filtered = filtered.filter(sim => sim.type === filters.type);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(sim => sim.difficulty === filters.difficulty);
    }

    if (filters.status) {
      filtered = filtered.filter(sim => sim.isActive === (filters.status === 'active'));
    }

    if (filters.search) {
      filtered = filtered.filter(sim => 
        sim.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        sim.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredSimulations(filtered);
  };

  const handleCreateSimulation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.createSimulation(formData);
      setShowCreateModal(false);
      resetForm();
      fetchSimulations();
    } catch (error) {
      console.error('Error creating simulation:', error);
      const { message } = apiUtils.handleError(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSimulation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminAPI.updateSimulation(editingSimulation._id, formData);
      setEditingSimulation(null);
      resetForm();
      fetchSimulations();
    } catch (error) {
      console.error('Error updating simulation:', error);
      const { message } = apiUtils.handleError(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSimulation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this simulation?')) return;
    
    try {
      setLoading(true);
      await adminAPI.deleteSimulation(id);
      fetchSimulations();
    } catch (error) {
      console.error('Error deleting simulation:', error);
      const { message } = apiUtils.handleError(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      await adminAPI.updateSimulation(id, { isActive: !currentStatus });
      fetchSimulations();
    } catch (error) {
      console.error('Error toggling simulation status:', error);
      const { message } = apiUtils.handleError(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'sms-phishing',
      difficulty: 'beginner',
      targetPlatform: 'general',
      isActive: true,
      scenario: {
        smsMessage: '',
        websiteUrl: '',
        socialEngineering: {
          urgencyLevel: 'medium',
          psychologicalTriggers: [],
          pressureTactics: [],
          trustBuildingElements: []
        }
      },
      educationalContent: {
        learningObjectives: [],
        redFlags: [],
        preventionTips: [],
        realWorldExamples: [],
        debriefingQuestions: []
      }
    });
  };

  const openEditModal = (simulation) => {
    setEditingSimulation(simulation);
    setFormData({
      title: simulation.title,
      description: simulation.description,
      type: simulation.type,
      difficulty: simulation.difficulty,
      targetPlatform: simulation.targetPlatform,
      isActive: simulation.isActive,
      scenario: simulation.scenario,
      educationalContent: simulation.educationalContent
    });
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
      case 'sms-phishing': return '📱';
      case 'email-phishing': return '📧';
      case 'voice-phishing': return '📞';
      case 'social-media': return '📱';
      case 'wallet-phishing': return '💰';
      default: return '🎯';
    }
  };

  const SimulationModal = ({ isOpen, onClose, onSubmit, title, submitText }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sms-phishing">SMS Phishing</option>
                  <option value="email-phishing">Email Phishing</option>
                  <option value="voice-phishing">Voice Phishing</option>
                  <option value="social-media">Social Media</option>
                  <option value="wallet-phishing">Wallet Phishing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Platform
                </label>
                <select
                  value={formData.targetPlatform}
                  onChange={(e) => setFormData({...formData, targetPlatform: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="metamask">MetaMask</option>
                  <option value="binance">Binance</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Scenario Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Message
                  </label>
                  <textarea
                    value={formData.scenario.smsMessage}
                    onChange={(e) => setFormData({
                      ...formData, 
                      scenario: {...formData.scenario, smsMessage: e.target.value}
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the SMS message content..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={formData.scenario.websiteUrl}
                    onChange={(e) => setFormData({
                      ...formData, 
                      scenario: {...formData.scenario, websiteUrl: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://fake-site.com"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active Simulation
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading && simulations.length === 0) {
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
          title="Manage Simulations" 
          subtitle="Create, edit, and manage phishing simulation scenarios"
          icon="target"
          className="mb-8"
        />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Create Simulation</span>
            </button>
            <button
              onClick={fetchSimulations}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {filteredSimulations.length} of {simulations.length} simulations
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search simulations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="sms-phishing">SMS Phishing</option>
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
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: '', difficulty: '', status: '', search: '' })}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Simulations List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Simulation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSimulations.map((simulation) => (
                  <tr key={simulation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {simulation.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {simulation.description.substring(0, 60)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getTypeIcon(simulation.type)}</span>
                        <span className="text-sm text-gray-900 capitalize">
                          {simulation.type.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(simulation.difficulty)}`}>
                        {simulation.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        simulation.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {simulation.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(simulation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(simulation)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(simulation._id, simulation.isActive)}
                          className={`${
                            simulation.isActive 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {simulation.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteSimulation(simulation._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSimulations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No simulations found</h3>
              <p className="text-gray-500">
                {filters.search || filters.type || filters.difficulty || filters.status
                  ? 'Try adjusting your filters'
                  : 'Create your first simulation to get started'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modals */}
        <SimulationModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          onSubmit={handleCreateSimulation}
          title="Create New Simulation"
          submitText="Create Simulation"
        />

        <SimulationModal
          isOpen={!!editingSimulation}
          onClose={() => {
            setEditingSimulation(null);
            resetForm();
          }}
          onSubmit={handleUpdateSimulation}
          title="Edit Simulation"
          submitText="Update Simulation"
        />
      </div>
    </div>
  );
};

export default AdminSimulations; 