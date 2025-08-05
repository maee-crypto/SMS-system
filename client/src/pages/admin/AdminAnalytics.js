import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import { apiUtils } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    systemStats: {},
    userStats: {},
    simulationStats: {},
    securityMetrics: {},
    performanceMetrics: {}
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [systemStats, userStats, simulationStats, securityMetrics, performanceMetrics] = await Promise.all([
        adminAPI.getSystemStats({ timeRange }),
        adminAPI.getUserStats({ timeRange }),
        adminAPI.getSimulationStats({ timeRange }),
        adminAPI.getSecurityMetrics({ timeRange }),
        adminAPI.getPerformanceMetrics({ timeRange })
      ]);

      setAnalytics({
        systemStats: systemStats.data,
        userStats: userStats.data,
        simulationStats: simulationStats.data,
        securityMetrics: securityMetrics.data,
        performanceMetrics: performanceMetrics.data
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      const { message } = apiUtils.handleError(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthRate = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getStatusColor = (value, threshold = 0) => {
    if (value > threshold) return 'text-green-600';
    if (value < threshold) return 'text-red-600';
    return 'text-yellow-600';
  };

  const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${getStatusColor(change)}`}>
              {change > 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <span className={`text-${color}-600 text-xl`}>{icon}</span>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader 
            title="System Analytics" 
            subtitle="Comprehensive system performance and security metrics"
            icon="chart"
            className="mb-8"
          />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader 
          title="System Analytics" 
          subtitle="Comprehensive system performance and security metrics"
          icon="chart"
          className="mb-8"
        />

        {/* Time Range Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-2">
            {['1d', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '1d' ? '24h' : range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex space-x-4 border-b border-gray-200">
          <TabButton id="overview" label="Overview" active={activeTab} />
          <TabButton id="users" label="User Analytics" active={activeTab} />
          <TabButton id="simulations" label="Simulation Analytics" active={activeTab} />
          <TabButton id="security" label="Security Metrics" active={activeTab} />
          <TabButton id="performance" label="Performance" active={activeTab} />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={analytics.systemStats.totalUsers || 0}
                change={getGrowthRate(
                  analytics.systemStats.totalUsers,
                  analytics.systemStats.previousTotalUsers
                )}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Active Sessions"
                value={analytics.systemStats.activeSessions || 0}
                change={getGrowthRate(
                  analytics.systemStats.activeSessions,
                  analytics.systemStats.previousActiveSessions
                )}
                icon="🟢"
                color="green"
              />
              <StatCard
                title="Simulations Completed"
                value={analytics.systemStats.completedSimulations || 0}
                change={getGrowthRate(
                  analytics.systemStats.completedSimulations,
                  analytics.systemStats.previousCompletedSimulations
                )}
                icon="🎯"
                color="purple"
              />
              <StatCard
                title="Average Score"
                value={`${analytics.systemStats.averageScore || 0}%`}
                change={getGrowthRate(
                  analytics.systemStats.averageScore,
                  analytics.systemStats.previousAverageScore
                )}
                icon="📊"
                color="yellow"
              />
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="System Health">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-green-600">
                      {analytics.systemStats.uptime || '99.9%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium text-blue-600">
                      {analytics.systemStats.avgResponseTime || '245ms'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium text-red-600">
                      {analytics.systemStats.errorRate || '0.1%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '0.1%' }}></div>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Recent Activity">
                <div className="space-y-3">
                  {analytics.systemStats.recentActivity?.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      No recent activity
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>
          </div>
        )}

        {/* User Analytics Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="New Registrations"
                value={analytics.userStats.newRegistrations || 0}
                change={getGrowthRate(
                  analytics.userStats.newRegistrations,
                  analytics.userStats.previousNewRegistrations
                )}
                icon="📈"
                color="green"
              />
              <StatCard
                title="Active Users"
                value={analytics.userStats.activeUsers || 0}
                change={getGrowthRate(
                  analytics.userStats.activeUsers,
                  analytics.userStats.previousActiveUsers
                )}
                icon="👤"
                color="blue"
              />
              <StatCard
                title="User Retention"
                value={`${analytics.userStats.retentionRate || 0}%`}
                change={getGrowthRate(
                  analytics.userStats.retentionRate,
                  analytics.userStats.previousRetentionRate
                )}
                icon="🔄"
                color="purple"
              />
            </div>

            <ChartCard title="User Demographics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Role Distribution</h4>
                  <div className="space-y-2">
                    {analytics.userStats.roleDistribution?.map((role, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{role.role}</span>
                        <span className="text-sm font-medium">{role.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Organization Distribution</h4>
                  <div className="space-y-2">
                    {analytics.userStats.organizationDistribution?.map((org, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{org.organization}</span>
                        <span className="text-sm font-medium">{org.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        )}

        {/* Simulation Analytics Tab */}
        {activeTab === 'simulations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Simulations"
                value={analytics.simulationStats.totalSimulations || 0}
                change={getGrowthRate(
                  analytics.simulationStats.totalSimulations,
                  analytics.simulationStats.previousTotalSimulations
                )}
                icon="🎯"
                color="blue"
              />
              <StatCard
                title="Success Rate"
                value={`${analytics.simulationStats.successRate || 0}%`}
                change={getGrowthRate(
                  analytics.simulationStats.successRate,
                  analytics.simulationStats.previousSuccessRate
                )}
                icon="✅"
                color="green"
              />
              <StatCard
                title="Average Completion Time"
                value={`${analytics.simulationStats.avgCompletionTime || 0}m`}
                change={getGrowthRate(
                  analytics.simulationStats.avgCompletionTime,
                  analytics.simulationStats.previousAvgCompletionTime
                )}
                icon="⏱️"
                color="yellow"
              />
            </div>

            <ChartCard title="Simulation Performance by Type">
              <div className="space-y-4">
                {analytics.simulationStats.performanceByType?.map((type, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 capitalize">{type.type}</span>
                      <span className="text-sm text-gray-600">{type.completionRate}% success</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${type.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Security Metrics Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Failed Login Attempts"
                value={analytics.securityMetrics.failedLogins || 0}
                change={getGrowthRate(
                  analytics.securityMetrics.failedLogins,
                  analytics.securityMetrics.previousFailedLogins
                )}
                icon="🚫"
                color="red"
              />
              <StatCard
                title="Suspicious Activities"
                value={analytics.securityMetrics.suspiciousActivities || 0}
                change={getGrowthRate(
                  analytics.securityMetrics.suspiciousActivities,
                  analytics.securityMetrics.previousSuspiciousActivities
                )}
                icon="⚠️"
                color="yellow"
              />
              <StatCard
                title="Security Score"
                value={`${analytics.securityMetrics.securityScore || 0}/100`}
                change={getGrowthRate(
                  analytics.securityMetrics.securityScore,
                  analytics.securityMetrics.previousSecurityScore
                )}
                icon="🛡️"
                color="green"
              />
            </div>

            <ChartCard title="Security Alerts">
              <div className="space-y-3">
                {analytics.securityMetrics.recentAlerts?.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    No security alerts
                  </div>
                )}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="API Response Time"
                value={`${analytics.performanceMetrics.avgApiResponseTime || 0}ms`}
                change={getGrowthRate(
                  analytics.performanceMetrics.avgApiResponseTime,
                  analytics.performanceMetrics.previousAvgApiResponseTime
                )}
                icon="⚡"
                color="blue"
              />
              <StatCard
                title="Database Queries"
                value={analytics.performanceMetrics.totalQueries || 0}
                change={getGrowthRate(
                  analytics.performanceMetrics.totalQueries,
                  analytics.performanceMetrics.previousTotalQueries
                )}
                icon="🗄️"
                color="purple"
              />
              <StatCard
                title="Memory Usage"
                value={`${analytics.performanceMetrics.memoryUsage || 0}%`}
                change={getGrowthRate(
                  analytics.performanceMetrics.memoryUsage,
                  analytics.performanceMetrics.previousMemoryUsage
                )}
                icon="💾"
                color="green"
              />
            </div>

            <ChartCard title="Performance Trends">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Response Time Trend</h4>
                  <div className="h-32 bg-gray-100 rounded-lg flex items-end justify-around p-4">
                    {[245, 238, 252, 241, 235, 248, 240].map((value, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-blue-600 rounded-t w-8"
                          style={{ height: `${(value / 300) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-600 mt-1">{value}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics; 