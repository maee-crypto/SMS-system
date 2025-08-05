import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';

const EmailManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [emailServiceStatus, setEmailServiceStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('send-email');

  // Form states
  const [singleEmail, setSingleEmail] = useState({
    to: '',
    simulationId: '',
    type: 'general',
    urgency: 'medium',
    customDetails: ''
  });

  const [bulkEmail, setBulkEmail] = useState({
    recipients: [{ email: '', name: '' }],
    simulationId: '',
    type: 'general',
    urgency: 'medium',
    customDetails: ''
  });

  const [templateGenerator, setTemplateGenerator] = useState({
    type: 'general',
    urgency: 'medium'
  });

  useEffect(() => {
    fetchSimulations();
    fetchEmailServiceStatus();
  }, []);

  const fetchSimulations = async () => {
    try {
      const response = await adminAPI.getSimulations();
      if (response.success) {
        setSimulations(response.data);
      }
    } catch (error) {
      console.error('Error fetching simulations:', error);
    }
  };

  const fetchEmailServiceStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/email/service-status`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEmailServiceStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching email service status:', error);
    }
  };

  const handleSingleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/email/send-simulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(singleEmail)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email sent successfully!');
        setSingleEmail({
          to: '',
          simulationId: '',
          type: 'general',
          urgency: 'medium',
          customDetails: ''
        });
      } else {
        setError(data.message || 'Failed to send email');
      }
    } catch (error) {
      setError('Error sending email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/email/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(bulkEmail)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Bulk email campaign completed! ${data.data.successful} successful, ${data.data.failed} failed`);
        setBulkEmail({
          recipients: [{ email: '', name: '' }],
          simulationId: '',
          type: 'general',
          urgency: 'medium',
          customDetails: ''
        });
      } else {
        setError(data.message || 'Failed to send bulk emails');
      }
    } catch (error) {
      setError('Error sending bulk emails: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateTemplate = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/email/generate-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(templateGenerator)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Template generated successfully!');
        // You could display the template in a modal or separate section
      } else {
        setError(data.message || 'Failed to generate template');
      }
    } catch (error) {
      setError('Error generating template: ' + error.message);
    }
  };

  const addRecipient = () => {
    setBulkEmail(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: '', name: '' }]
    }));
  };

  const removeRecipient = (index) => {
    setBulkEmail(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateRecipient = (index, field, value) => {
    setBulkEmail(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? { ...recipient, [field]: value } : recipient
      )
    }));
  };

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium rounded-lg transition-colors ${
        active === id
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader 
          title="Email Manager" 
          subtitle="Send real phishing emails using SendGrid" 
          icon="mail" 
          className="mb-8" 
        />

        {/* Email Service Status */}
        {emailServiceStatus && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Service Status</h3>
                <p className="text-sm text-gray-600">
                  Provider: {emailServiceStatus.provider}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                emailServiceStatus.configured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {emailServiceStatus.configured ? 'Configured' : 'Simulated'}
              </div>
            </div>
            {emailServiceStatus.fromEmail && (
              <p className="text-sm text-gray-600 mt-2">
                From: {emailServiceStatus.fromEmail}
              </p>
            )}
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 flex space-x-4 border-b border-gray-200">
          <TabButton id="send-email" label="Send Single Email" active={activeTab} />
          <TabButton id="bulk-email" label="Bulk Email Campaign" active={activeTab} />
          <TabButton id="template-generator" label="Template Generator" active={activeTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'send-email' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Single Email</h3>
            <form onSubmit={handleSingleEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={singleEmail.to}
                  onChange={(e) => setSingleEmail(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Simulation
                </label>
                <select
                  value={singleEmail.simulationId}
                  onChange={(e) => setSingleEmail(prev => ({ ...prev, simulationId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a simulation</option>
                  {simulations.map(sim => (
                    <option key={sim._id} value={sim._id}>
                      {sim.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={singleEmail.type}
                    onChange={(e) => setSingleEmail(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="bank">Bank</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={singleEmail.urgency}
                    onChange={(e) => setSingleEmail(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Details (Optional)
                </label>
                <textarea
                  value={singleEmail.customDetails}
                  onChange={(e) => setSingleEmail(prev => ({ ...prev, customDetails: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional details for the email template..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'bulk-email' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Email Campaign</h3>
            <form onSubmit={handleBulkEmail} className="space-y-4">
              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                {bulkEmail.recipients.map((recipient, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="email"
                      value={recipient.email}
                      onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email"
                      required
                    />
                    <input
                      type="text"
                      value={recipient.name}
                      onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Name (optional)"
                    />
                    {bulkEmail.recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRecipient(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRecipient}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Recipient
                </button>
              </div>

              {/* Simulation and Template Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Simulation
                </label>
                <select
                  value={bulkEmail.simulationId}
                  onChange={(e) => setBulkEmail(prev => ({ ...prev, simulationId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a simulation</option>
                  {simulations.map(sim => (
                    <option key={sim._id} value={sim._id}>
                      {sim.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={bulkEmail.type}
                    onChange={(e) => setBulkEmail(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="bank">Bank</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={bulkEmail.urgency}
                    onChange={(e) => setBulkEmail(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : `Send to ${bulkEmail.recipients.length} Recipients`}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'template-generator' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Template Generator</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={templateGenerator.type}
                    onChange={(e) => setTemplateGenerator(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="bank">Bank</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={templateGenerator.urgency}
                    onChange={(e) => setTemplateGenerator(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateTemplate}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Generate Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailManager; 