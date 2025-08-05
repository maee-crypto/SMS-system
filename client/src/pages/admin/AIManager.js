import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';

const AIManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [aiServiceStatus, setAiServiceStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('generate-content');

  // Form states
  const [contentGenerator, setContentGenerator] = useState({
    type: 'email',
    urgency: 'medium',
    targetPlatform: '',
    customDetails: ''
  });

  const [responseAnalyzer, setResponseAnalyzer] = useState({
    userResponse: '',
    simulationContext: {
      type: 'email',
      urgency: 'medium',
      targetPlatform: 'Bank'
    }
  });

  const [educationalGenerator, setEducationalGenerator] = useState({
    topic: '',
    difficulty: 'beginner'
  });

  const [phishingDetector, setPhishingDetector] = useState({
    text: ''
  });

  // Results states
  const [generatedContent, setGeneratedContent] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [educationalContent, setEducationalContent] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);

  useEffect(() => {
    fetchAIServiceStatus();
  }, []);

  const fetchAIServiceStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/service-status`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAiServiceStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching AI service status:', error);
    }
  };

  const generateContent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedContent(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(contentGenerator)
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedContent(data.data);
        setSuccess('AI content generated successfully!');
      } else {
        setError(data.message || 'Failed to generate content');
      }
    } catch (error) {
      setError('Error generating content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeResponse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAnalysisResult(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/analyze-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(responseAnalyzer)
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
        setSuccess('Response analyzed successfully!');
      } else {
        setError(data.message || 'Failed to analyze response');
      }
    } catch (error) {
      setError('Error analyzing response: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateEducationalContent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setEducationalContent(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/generate-educational`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(educationalGenerator)
      });

      const data = await response.json();

      if (data.success) {
        setEducationalContent(data.data);
        setSuccess('Educational content generated successfully!');
      } else {
        setError(data.message || 'Failed to generate educational content');
      }
    } catch (error) {
      setError('Error generating educational content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const detectPhishing = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDetectionResult(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/detect-phishing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(phishingDetector)
      });

      const data = await response.json();

      if (data.success) {
        setDetectionResult(data.data);
        setSuccess('Phishing detection completed!');
      } else {
        setError(data.message || 'Failed to detect phishing');
      }
    } catch (error) {
      setError('Error detecting phishing: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium rounded-lg transition-colors ${
        active === id
          ? 'bg-purple-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  const getVulnerabilityColor = (score) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPhishingProbabilityColor = (probability) => {
    if (probability <= 30) return 'text-green-600';
    if (probability <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader 
          title="AI Manager" 
          subtitle="Generate AI-powered phishing content and analyze responses" 
          icon="brain" 
          className="mb-8" 
        />

        {/* AI Service Status */}
        {aiServiceStatus && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Service Status</h3>
                <p className="text-sm text-gray-600">
                  Provider: {aiServiceStatus.provider} | Model: {aiServiceStatus.model}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                aiServiceStatus.configured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {aiServiceStatus.configured ? 'Configured' : 'Simulated'}
              </div>
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
          <TabButton id="generate-content" label="Generate Content" active={activeTab} />
          <TabButton id="analyze-response" label="Analyze Response" active={activeTab} />
          <TabButton id="educational-content" label="Educational Content" active={activeTab} />
          <TabButton id="phishing-detector" label="Phishing Detector" active={activeTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'generate-content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate AI Content</h3>
              <form onSubmit={generateContent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={contentGenerator.type}
                    onChange={(e) => setContentGenerator(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Platform
                  </label>
                  <input
                    type="text"
                    value={contentGenerator.targetPlatform}
                    onChange={(e) => setContentGenerator(prev => ({ ...prev, targetPlatform: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Bank of America, PayPal, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urgency
                    </label>
                    <select
                      value={contentGenerator.urgency}
                      onChange={(e) => setContentGenerator(prev => ({ ...prev, urgency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    value={contentGenerator.customDetails}
                    onChange={(e) => setContentGenerator(prev => ({ ...prev, customDetails: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Additional context for AI generation..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Content'}
                </button>
              </form>
            </div>

            {generatedContent && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <pre className="whitespace-pre-wrap text-sm">{generatedContent.content}</pre>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {generatedContent.type}
                    </div>
                    <div>
                      <span className="font-medium">Urgency:</span> {generatedContent.urgency}
                    </div>
                    <div>
                      <span className="font-medium">Platform:</span> {generatedContent.targetPlatform}
                    </div>
                    <div>
                      <span className="font-medium">Model:</span> {generatedContent.model}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analyze-response' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyze User Response</h3>
              <form onSubmit={analyzeResponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Response
                  </label>
                  <textarea
                    value={responseAnalyzer.userResponse}
                    onChange={(e) => setResponseAnalyzer(prev => ({ ...prev, userResponse: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="4"
                    placeholder="Enter the user's response to analyze..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Simulation Context
                  </label>
                  <textarea
                    value={JSON.stringify(responseAnalyzer.simulationContext, null, 2)}
                    onChange={(e) => {
                      try {
                        const context = JSON.parse(e.target.value);
                        setResponseAnalyzer(prev => ({ ...prev, simulationContext: context }));
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="4"
                    placeholder="Simulation context in JSON format..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Response'}
                </button>
              </form>
            </div>

            {analysisResult && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vulnerability Score</label>
                    <div className={`text-2xl font-bold ${getVulnerabilityColor(analysisResult.analysis.vulnerabilityScore)}`}>
                      {analysisResult.analysis.vulnerabilityScore}/10
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Red Flags Missed</label>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisResult.analysis.redFlags?.map((flag, index) => (
                        <li key={index} className="text-sm text-red-600">{flag}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                    <ul className="list-disc list-inside space-y-1">
                      {analysisResult.analysis.recommendations?.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-600">{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      analysisResult.analysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      analysisResult.analysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysisResult.analysis.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'educational-content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Educational Content</h3>
              <form onSubmit={generateEducationalContent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={educationalGenerator.topic}
                    onChange={(e) => setEducationalGenerator(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Phishing Detection, Social Engineering, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={educationalGenerator.difficulty}
                    onChange={(e) => setEducationalGenerator(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Educational Content'}
                </button>
              </form>
            </div>

            {educationalContent && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Educational Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <pre className="whitespace-pre-wrap text-sm">{educationalContent.content}</pre>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Topic:</span> {educationalContent.topic}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span> {educationalContent.difficulty}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'phishing-detector' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phishing Detection</h3>
              <form onSubmit={detectPhishing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text to Analyze
                  </label>
                  <textarea
                    value={phishingDetector.text}
                    onChange={(e) => setPhishingDetector(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="6"
                    placeholder="Paste the text you want to analyze for phishing indicators..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Detect Phishing'}
                </button>
              </form>
            </div>

            {detectionResult && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Results</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phishing Probability</label>
                    <div className={`text-2xl font-bold ${getPhishingProbabilityColor(detectionResult.detection.phishingProbability)}`}>
                      {detectionResult.detection.phishingProbability}%
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Score</label>
                      <div className="text-lg font-semibold">{detectionResult.detection.urgencyScore}%</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Authority Score</label>
                      <div className="text-lg font-semibold">{detectionResult.detection.authorityScore}%</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emotional Score</label>
                      <div className="text-lg font-semibold">{detectionResult.detection.emotionalScore}%</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suspicious Elements</label>
                    <ul className="list-disc list-inside space-y-1">
                      {detectionResult.detection.suspiciousElements?.map((element, index) => (
                        <li key={index} className="text-sm text-red-600">{element}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grammar Issues</label>
                    <ul className="list-disc list-inside space-y-1">
                      {detectionResult.detection.grammarIssues?.map((issue, index) => (
                        <li key={index} className="text-sm text-yellow-600">{issue}</li>
                      ))}
                    </ul>
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

export default AIManager; 