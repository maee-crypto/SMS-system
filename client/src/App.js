import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Simulations from './pages/Simulations';
import SimulationDetail from './pages/SimulationDetail';
import SimulationRunner from './pages/SimulationRunner';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import EducationalModules from './pages/EducationalModules';
import DeveloperAPI from './pages/DeveloperAPI';
import PolicyDashboard from './pages/PolicyDashboard';
import SecurityFeatures from './pages/SecurityFeatures';
import Admin from './pages/admin/Admin';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSimulations from './pages/admin/AdminSimulations';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import NotFound from './pages/NotFound';
import EducationalBanner from './components/common/EducationalBanner';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <EducationalBanner />
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" replace /> : <Register />
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/simulations" element={
            <ProtectedRoute>
              <Simulations />
            </ProtectedRoute>
          } />
          
          <Route path="/simulations/:id" element={
            <ProtectedRoute>
              <SimulationDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/simulations/:id/run" element={
            <ProtectedRoute>
              <SimulationRunner />
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/educational-modules" element={
            <ProtectedRoute>
              <EducationalModules />
            </ProtectedRoute>
          } />
          
          <Route path="/developer-api" element={
            <ProtectedRoute>
              <DeveloperAPI />
            </ProtectedRoute>
          } />
          
          <Route path="/policy-dashboard" element={
            <ProtectedRoute>
              <PolicyDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/security-features" element={
            <ProtectedRoute>
              <SecurityFeatures />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Admin />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/simulations" element={
            <ProtectedRoute roles={['admin', 'instructor']}>
              <AdminSimulations />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['admin', 'instructor']}>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App; 