import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SimulationContext = createContext();

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

export const SimulationProvider = ({ children }) => {
  const [simulations, setSimulations] = useState([]);
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_API_URL || window.location.origin;
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to simulation server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from simulation server');
    });

    newSocket.on('simulation-update', (data) => {
      console.log('Simulation update received:', data);
      // Handle real-time simulation updates
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch simulations
  const fetchSimulations = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/api/simulations?${params}`);
      setSimulations(response.data.simulations);
      return response.data;
    } catch (error) {
      console.error('Error fetching simulations:', error);
      toast.error('Failed to load simulations');
      return { simulations: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  };

  // Get simulation by ID
  const getSimulation = async (id) => {
    try {
      const response = await axios.get(`/api/simulations/${id}`);
      return response.data.simulation;
    } catch (error) {
      console.error('Error fetching simulation:', error);
      toast.error('Failed to load simulation');
      return null;
    }
  };

  // Start simulation session
  const startSimulation = async (simulationId) => {
    try {
      const response = await axios.post(`/api/simulations/${simulationId}/start`);
      const { sessionId, simulation } = response.data;
      
      setCurrentSession({ id: sessionId, simulationId });
      setCurrentSimulation(simulation);
      
      // Join socket room for real-time updates
      if (socket) {
        socket.emit('join-simulation', { simulationId });
      }
      
      toast.success('Simulation started!');
      return { success: true, sessionId, simulation };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to start simulation';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Record interaction
  const recordInteraction = async (simulationId, sessionId, interaction) => {
    try {
      const response = await axios.post(`/api/simulations/${simulationId}/interaction`, {
        sessionId,
        ...interaction
      });
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('simulation-event', {
          simulationId,
          type: 'interaction',
          data: interaction
        });
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error recording interaction:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to record interaction' };
    }
  };

  // Complete simulation
  const completeSimulation = async (simulationId, sessionId, outcome) => {
    try {
      const response = await axios.post(`/api/simulations/${simulationId}/complete`, {
        sessionId,
        outcome
      });
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('simulation-event', {
          simulationId,
          type: 'completion',
          data: outcome
        });
      }
      
      setCurrentSession(null);
      setCurrentSimulation(null);
      
      toast.success('Simulation completed!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to complete simulation';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get user's simulation history
  const getUserHistory = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/api/simulations/history/user?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user history:', error);
      toast.error('Failed to load simulation history');
      return { sessions: [], pagination: {} };
    }
  };

  // Create simulation (admin/instructor only)
  const createSimulation = async (simulationData) => {
    try {
      const response = await axios.post('/api/simulations', simulationData);
      toast.success('Simulation created successfully');
      return { success: true, simulation: response.data.simulation };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create simulation';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update simulation (admin/instructor only)
  const updateSimulation = async (id, simulationData) => {
    try {
      const response = await axios.put(`/api/simulations/${id}`, simulationData);
      toast.success('Simulation updated successfully');
      return { success: true, simulation: response.data.simulation };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update simulation';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete simulation (admin only)
  const deleteSimulation = async (id) => {
    try {
      await axios.delete(`/api/simulations/${id}`);
      toast.success('Simulation deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete simulation';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get analytics
  const getAnalytics = async (type, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await axios.get(`/api/analytics/${type}?${queryParams}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
      return { success: false, error: error.response?.data?.error || 'Failed to load analytics' };
    }
  };

  // Export analytics
  const exportAnalytics = async (format = 'json', filters = {}) => {
    try {
      const params = new URLSearchParams({ format, ...filters });
      const response = await axios.get(`/api/analytics/export?${params}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Download CSV file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'analytics-export.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success('Analytics exported successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to export analytics';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear current simulation
  const clearCurrentSimulation = () => {
    setCurrentSimulation(null);
    setCurrentSession(null);
  };

  const value = {
    // State
    simulations,
    currentSimulation,
    currentSession,
    loading,
    socket,
    
    // Actions
    fetchSimulations,
    getSimulation,
    startSimulation,
    recordInteraction,
    completeSimulation,
    getUserHistory,
    createSimulation,
    updateSimulation,
    deleteSimulation,
    getAnalytics,
    exportAnalytics,
    clearCurrentSimulation
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}; 