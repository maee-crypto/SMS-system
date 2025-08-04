import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { simulationsAPI, analyticsAPI } from '../services/api';
import { apiUtils } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import StatsOverview from '../components/dashboard/StatsOverview';
import QuickActions from '../components/dashboard/QuickActions';
import LearningResources from '../components/dashboard/LearningResources';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSimulations: 0,
      completedSimulations: 0,
      averageScore: 0,
      currentStreak: 0
    },
    simulations: [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch simulations
        const simulationsResponse = await simulationsAPI.getAll({ limit: 5 });
        const simulations = simulationsResponse.data.simulations || [];

        // Fetch user stats
        const statsResponse = await analyticsAPI.getUserStats();
        const stats = statsResponse.data || {
          totalSimulations: 0,
          completedSimulations: 0,
          averageScore: 0,
          currentStreak: 0
        };

        // Fetch recent activity
        const activityResponse = await analyticsAPI.getLearningProgress();
        const recentActivity = activityResponse.data?.recentActivity || [];

        setDashboardData({
          stats,
          simulations,
          recentActivity
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const { message } = apiUtils.handleError(error);
        setError(message);
        
        // Set fallback data
        setDashboardData({
          stats: {
            totalSimulations: 0,
            completedSimulations: 0,
            averageScore: 0,
            currentStreak: 0
          },
          simulations: [],
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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
            title="Dashboard" 
            subtitle="Welcome back to your security training dashboard"
            icon="shield"
            className="mb-8"
          />
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Dashboard</div>
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
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
          title="Dashboard" 
          subtitle={`Welcome back, ${user?.username || 'User'}! Ready to enhance your security awareness?`}
          icon="shield"
          className="mb-8"
        />

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview stats={dashboardData.stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <QuickActions simulations={dashboardData.simulations} />
          </div>

          {/* Learning Resources */}
          <div>
            <LearningResources />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <RecentActivity activities={dashboardData.recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 