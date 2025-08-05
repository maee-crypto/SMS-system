import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import { apiUtils } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';

const SMSManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [smsAnalytics, setSmsAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('send-sms');

  // Form states
  const [singleSMS, setSingleSMS] = useState({
    phoneNumber: '',
    simulationId: '',
    message: ''
  });
  const [bulkSMS, setBulkSMS] = useState({
    recipients: [{ phone: '', name: '' }],
    simulationId: '',
    messageTemplate: ''
  });
  const [messageGenerator, setMessageGenerator] = useState({
    type: 'general',
    urgency: 'medium',
    customLink: ''
  });

  useEffect(() => {
    fetchSimulations();
    fetchServiceStatus();
    fetchSMSAnalytics();
  }, []);

  const fetchSimulations = async () => {
    try {
      const response = await adminAPI.getSimulations();
      setSimulations(response.data.simulations || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
    }
  };

  const fetchServiceStatus = async () => {
    try {
      const response = await fetch('/api/sms/service-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setServiceStatus(data);
    } catch (error) {
      console.error('Error fetching service status:', error);
    }
  };

  const fetchSMSAnalytics = async () => {
    try {
      const response = await fetch('/api/sms/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSmsAnalytics(data);
    } catch (error) {
      console.error('Error fetching SMS analytics:', error);
    }
  };

  const handleSingleSMS = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/sms/send-simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(singleSMS)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('SMS sent successfully!');
        setSingleSMS({ phoneNumber: '', simulationId: '', message: '' });
        fetchSMSAnalytics();
      } else {
        setError(data.error || 'Failed to send SMS');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSMS = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/sms/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bulkSMS)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Bulk SMS sent! ${data.successful} successful, ${data.failed} failed`);
        setBulkSMS({
          recipients: [{ phone: '', name: '' }],
          simulationId: '',
          messageTemplate: ''
        });
        fetchSMSAnalytics();
      } else {
        setError(data.error || 'Failed to send bulk SMS');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = async () => {
    try {
      const response = await fetch('/api/sms/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageGenerator)
      });

      const data = await response.json();

      if (response.ok) {
        setSingleSMS(prev => ({ ...prev, message: data.message }));
        setBulkSMS(prev => ({ ...prev, messageTemplate: data.message }));
      } else {
        setError(data.error || 'Failed to generate message');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const addRecipient = () => {
    setBulkSMS(prev => ({
      ...prev,
      recipients: [...prev.recipients, { phone: '', name: '' }]
    }));
  };

  const removeRecipient = (index) => {
    setBulkSMS(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateRecipient = (index, field, value) => {
    setBulkSMS(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? { ...recipient, [field]: value } : recipient
      )
    }));
  };

  const validatePhoneNumber = async (phoneNumber) => {
    try {
      const response = await fetch('/api/sms/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json();
      return data.valid;
    } catch (error) {
      return false;
    }
  };

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active === id
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader 
          title="SMS Manager" 
          subtitle="Send real SMS phishing simulations using Twilio"
          icon="message"
          className="mb-8"
        />

        {/* Service Status */}
        {serviceStatus && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Twilio Service Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${serviceStatus.configured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {serviceStatus.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                From: {serviceStatus.fromNumber || 'Not set'}
              </div>
              <div className="text-sm text-gray-600">
                Client: {serviceStatus.clientAvailable ? 'Available' : 'Not Available'}
              </div>
            </div>
          </div>
        )}

        {/* SMS Analytics */}
        {smsAnalytics && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{smsAnalytics.totalSMS}</div>
                <div className="text-sm text-gray-600">Total SMS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{smsAnalytics.deliveredSMS}</div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{smsAnalytics.failedSMS}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{smsAnalytics.deliveryRate}%</div>
                <div className="text-sm text-gray-600">Delivery Rate</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 flex space-x-4 border-b border-gray-200">
          <TabButton id="send-sms" label="Send Single SMS" active={activeTab} />
          <TabButton id="bulk-sms" label="Bulk SMS" active={activeTab} />
          <TabButton id="message-generator" label="Message Generator" active={activeTab} />
        </div>

        {/* Send Single SMS Tab */}
        {activeTab === 'send-sms' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Single SMS</h3>
            <form onSubmit={handleSingleSMS} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={singleSMS.phoneNumber}
                    onChange={(e) => setSingleSMS({...singleSMS, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Simulation
                  </label>
                  <select
                    value={singleSMS.simulationId}
                    onChange={(e) => setSingleSMS({...singleSMS, simulationId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Simulation</option>
                    {simulations.map(sim => (
                      <option key={sim._id} value={sim._id}>
                        {sim.title} ({sim.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={singleSMS.message}
                  onChange={(e) => setSingleSMS({...singleSMS, message: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your SMS message..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {singleSMS.message.length}/1600 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send SMS'}
              </button>
            </form>
          </div>
        )}

        {/* Bulk SMS Tab */}
        {activeTab === 'bulk-sms' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Bulk SMS</h3>
            <form onSubmit={handleBulkSMS} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Simulation
                  </label>
                  <select
                    value={bulkSMS.simulationId}
                    onChange={(e) => setBulkSMS({...bulkSMS, simulationId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Simulation</option>
                    {simulations.map(sim => (
                      <option key={sim._id} value={sim._id}>
                        {sim.title} ({sim.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Recipient
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="space-y-2">
                  {bulkSMS.recipients.map((recipient, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="tel"
                        value={recipient.phone}
                        onChange={(e) => updateRecipient(index, 'phone', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+1234567890"
                        required
                      />
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Name (optional)"
                      />
                      {bulkSMS.recipients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Template
                </label>
                <textarea
                  value={bulkSMS.messageTemplate}
                  onChange={(e) => setBulkSMS({...bulkSMS, messageTemplate: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your SMS message template..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {bulkSMS.messageTemplate.length}/1600 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : `Send to ${bulkSMS.recipients.length} Recipients`}
              </button>
            </form>
          </div>
        )}

        {/* Message Generator Tab */}
        {activeTab === 'message-generator' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Generator</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={messageGenerator.type}
                    onChange={(e) => setMessageGenerator({...messageGenerator, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="bank">Bank</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <select
                    value={messageGenerator.urgency}
                    onChange={(e) => setMessageGenerator({...messageGenerator, urgency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={generateMessage}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Generate Message
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Link (optional)
                </label>
                <input
                  type="url"
                  value={messageGenerator.customLink}
                  onChange={(e) => setMessageGenerator({...messageGenerator, customLink: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/verify"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSManager; 