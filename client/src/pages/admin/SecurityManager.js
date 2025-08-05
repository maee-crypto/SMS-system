import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/ui/PageHeader';

const SecurityManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [securityServiceStatus, setSecurityServiceStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('2fa');

  // 2FA states
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [user2FAStatus, setUser2FAStatus] = useState(null);

  // reCAPTCHA states
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaResult, setRecaptchaResult] = useState(null);

  // Password validation states
  const [passwordToValidate, setPasswordToValidate] = useState('');
  const [passwordResult, setPasswordResult] = useState(null);

  // IP info states
  const [ipToCheck, setIpToCheck] = useState('');
  const [ipResult, setIpResult] = useState(null);

  useEffect(() => {
    fetchSecurityServiceStatus();
    fetchUser2FAStatus();
  }, []);

  const fetchSecurityServiceStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/security/service-status`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSecurityServiceStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching security service status:', error);
    }
  };

  const fetchUser2FAStatus = async () => {
    try {
      // This would typically come from user profile
      setUser2FAStatus({
        enabled: false,
        setupComplete: false
      });
    } catch (error) {
      console.error('Error fetching user 2FA status:', error);
    }
  };

  const setup2FA = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/security/setup-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setTwoFactorSetup(data.data);
        setSuccess('2FA setup initiated. Please scan the QR code and enter the token.');
      } else {
        setError(data.message || 'Failed to setup 2FA');
      }
    } catch (error) {
      setError('Error setting up 2FA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/security/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ token: twoFactorToken })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('2FA enabled successfully!');
        setTwoFactorSetup(null);
        setTwoFactorToken('');
        setUser2FAStatus({ enabled: true, setupComplete: true });
      } else {
        setError(data.message || 'Failed to verify 2FA');
      }
    } catch (error) {
      setError('Error verifying 2FA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/security/disable-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ token: twoFactorToken })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('2FA disabled successfully!');
        setTwoFactorToken('');
        setUser2FAStatus({ enabled: false, setupComplete: false });
      } else {
        setError(data.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      setError('Error disabling 2FA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyRecaptcha = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setRecaptchaResult(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/security/verify-recaptcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: recaptchaToken })
      });

      const data = await response.json();

      if (data.success) {
        setRecaptchaResult(data.data);
        setSuccess('reCAPTCHA verification completed!');
      } else {
        setError(data.message || 'Failed to verify reCAPTCHA');
      }
    } catch (error) {
      setError('Error verifying reCAPTCHA: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setPasswordResult(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/security/validate-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: passwordToValidate })
      });

      const data = await response.json();

      if (data.success) {
        setPasswordResult(data.data);
        setSuccess('Password validation completed!');
      } else {
        setError(data.message || 'Failed to validate password');
      }
    } catch (error) {
      setError('Error validating password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getIPInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setIpResult(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/security/ip-info/${ipToCheck}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setIpResult(data.data);
        setSuccess('IP information retrieved successfully!');
      } else {
        setError(data.message || 'Failed to get IP information');
      }
    } catch (error) {
      setError('Error getting IP information: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium rounded-lg transition-colors ${
        active === id
          ? 'bg-red-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 'weak': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'strong': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader 
          title="Security Manager" 
          subtitle="Manage 2FA, reCAPTCHA, and advanced security features" 
          icon="shield" 
          className="mb-8" 
        />

        {/* Security Service Status */}
        {securityServiceStatus && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security Service Status</h3>
                <p className="text-sm text-gray-600">
                  Provider: {securityServiceStatus.provider}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                securityServiceStatus.configured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {securityServiceStatus.configured ? 'Configured' : 'Simulated'}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(securityServiceStatus.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
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
          <TabButton id="2fa" label="Two-Factor Authentication" active={activeTab} />
          <TabButton id="recaptcha" label="reCAPTCHA" active={activeTab} />
          <TabButton id="password" label="Password Validation" active={activeTab} />
          <TabButton id="ip-info" label="IP Information" active={activeTab} />
        </div>

        {/* Tab Content */}
        {activeTab === '2fa' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
              
              {/* Current Status */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${user2FAStatus?.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {user2FAStatus?.enabled ? '2FA is enabled' : '2FA is disabled'}
                  </span>
                </div>
              </div>

              {/* Setup 2FA */}
              {!user2FAStatus?.enabled && (
                <div className="mb-6">
                  <button
                    onClick={setup2FA}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Setting up...' : 'Setup 2FA'}
                  </button>
                </div>
              )}

              {/* Verify/Disable 2FA */}
              {(twoFactorSetup || user2FAStatus?.enabled) && (
                <form onSubmit={user2FAStatus?.enabled ? disable2FA : verify2FA} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      6-Digit Token
                    </label>
                    <input
                      type="text"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter 6-digit token"
                      maxLength="6"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 ${
                      user2FAStatus?.enabled 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'Processing...' : (user2FAStatus?.enabled ? 'Disable 2FA' : 'Enable 2FA')}
                  </button>
                </form>
              )}
            </div>

            {/* QR Code Display */}
            {twoFactorSetup && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan QR Code</h3>
                <div className="text-center">
                  {twoFactorSetup.qrCode && (
                    <img 
                      src={twoFactorSetup.qrCode} 
                      alt="2FA QR Code" 
                      className="mx-auto mb-4 border rounded-lg"
                    />
                  )}
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-xs text-gray-500 mb-1">Manual Entry Code:</p>
                    <code className="text-sm font-mono">{twoFactorSetup.secret}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recaptcha' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">reCAPTCHA Verification</h3>
              <form onSubmit={verifyRecaptcha} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    reCAPTCHA Token
                  </label>
                  <input
                    type="text"
                    value={recaptchaToken}
                    onChange={(e) => setRecaptchaToken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter reCAPTCHA token"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify reCAPTCHA'}
                </button>
              </form>
            </div>

            {recaptchaResult && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Results</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                      recaptchaResult.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {recaptchaResult.verified ? 'Verified' : 'Failed'}
                    </div>
                  </div>

                  {recaptchaResult.score && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                      <div className="text-lg font-semibold">{recaptchaResult.score}</div>
                    </div>
                  )}

                  {recaptchaResult.action && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                      <div className="text-sm">{recaptchaResult.action}</div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                    <div className="text-sm">{new Date(recaptchaResult.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Strength Validation</h3>
              <form onSubmit={validatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password to Validate
                  </label>
                  <input
                    type="password"
                    value={passwordToValidate}
                    onChange={(e) => setPasswordToValidate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter password to validate"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? 'Validating...' : 'Validate Password'}
                </button>
              </form>
            </div>

            {passwordResult && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
                    <div className={`text-2xl font-bold ${getPasswordStrengthColor(passwordResult.strength)}`}>
                      {passwordResult.strength}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                    <div className="text-lg font-semibold">{passwordResult.score}/5</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                    <div className="space-y-2">
                      {Object.entries(passwordResult.checks).map(([check, passed]) => (
                        <div key={check} className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm capitalize">{check.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid</label>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                      passwordResult.valid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {passwordResult.valid ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ip-info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">IP Geolocation</h3>
              <form onSubmit={getIPInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={ipToCheck}
                    onChange={(e) => setIpToCheck(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter IP address (e.g., 8.8.8.8)"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? 'Getting Info...' : 'Get IP Information'}
                </button>
              </form>
            </div>

            {ipResult && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">IP Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                    <div className="text-lg font-mono">{ipResult.ip}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <div className="text-sm">{ipResult.country}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                      <div className="text-sm">{ipResult.region}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <div className="text-sm">{ipResult.city}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <div className="text-sm">{ipResult.timezone}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ISP</label>
                    <div className="text-sm">{ipResult.isp}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                    <div className="text-sm">{ipResult.org}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <div className="text-sm">{ipResult.latitude}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <div className="text-sm">{ipResult.longitude}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityManager; 