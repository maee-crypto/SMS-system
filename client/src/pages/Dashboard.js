import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import StatsOverview from '../components/dashboard/StatsOverview';
import QuickActions from '../components/dashboard/QuickActions';
import LearningResources from '../components/dashboard/LearningResources';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSimulations: 0,
    completedSimulations: 0,
    averageScore: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user stats
    const fetchStats = async () => {
      try {
        // This would be replaced with actual API calls
        setStats({
          totalSimulations: 5,
          completedSimulations: 3,
          averageScore: 75,
          recentActivity: [
            { 
              id: 1, 
              type: 'simulation', 
              title: 'MetaMask Security Alert', 
              score: 80, 
              date: '2024-01-15', 
              status: 'completed',
              duration: '15 min'
            },
            { 
              id: 2, 
              type: 'simulation', 
              title: 'Bank Login Verification', 
              score: 70, 
              date: '2024-01-14', 
              status: 'completed',
              duration: '20 min'
            },
            { 
              id: 3, 
              type: 'simulation', 
              title: 'Email Phishing Test', 
              score: 85, 
              date: '2024-01-13', 
              status: 'completed',
              duration: '12 min'
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={`Welcome back, ${user?.username || 'Security Champion'}!`}
          subtitle="Continue your cybersecurity training journey"
          icon="shield"
        />

        <StatsOverview stats={stats} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <QuickActions />
          <LearningResources />
        </div>

        <RecentActivity activities={stats.recentActivity} />
      </div>
    </div>
  );
};

export default Dashboard; 