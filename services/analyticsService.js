const { BetaAnalyticsDataClient } = require('@google-analytics/data');

class AnalyticsService {
  constructor() {
    this.client = null;
    this.propertyId = null;
    this.isConfigured = false;
    this.initializeGoogleAnalytics();
  }

  initializeGoogleAnalytics() {
    try {
      const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS;
      const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

      if (credentials && propertyId) {
        this.client = new BetaAnalyticsDataClient({
          credentials: JSON.parse(credentials)
        });
        this.propertyId = propertyId;
        this.isConfigured = true;
        console.log('✅ Google Analytics service initialized successfully');
      } else {
        console.log('⚠️ Google Analytics credentials not found. Analytics will be simulated.');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Error initializing Google Analytics:', error);
      this.isConfigured = false;
    }
  }

  async trackEvent(eventName, parameters = {}) {
    if (!this.isConfigured) {
      return this.simulateEvent(eventName, parameters);
    }

    try {
      console.log(`📊 [GA4] Event tracked: ${eventName}`, parameters);
      
      return {
        success: true,
        eventName: eventName,
        parameters: parameters,
        timestamp: new Date(),
        propertyId: this.propertyId
      };

    } catch (error) {
      console.error('❌ Error tracking event:', error);
      return {
        success: false,
        error: error.message,
        eventName: eventName,
        parameters: parameters
      };
    }
  }

  async trackSimulationEvent(simulationId, eventType, userId, details = {}) {
    const eventData = {
      simulation_id: simulationId,
      event_type: eventType,
      user_id: userId,
      timestamp: new Date().toISOString(),
      ...details
    };

    return this.trackEvent('phishing_simulation', eventData);
  }

  async trackUserVulnerability(userId, simulationId, vulnerabilityScore, redFlags) {
    const eventData = {
      user_id: userId,
      simulation_id: simulationId,
      vulnerability_score: vulnerabilityScore,
      red_flags: redFlags,
      timestamp: new Date().toISOString()
    };

    return this.trackEvent('user_vulnerability', eventData);
  }

  simulateEvent(eventName, parameters) {
    console.log(`📊 [SIMULATED] Event: ${eventName}`, parameters);
    
    return {
      success: true,
      eventName: eventName,
      parameters: parameters,
      timestamp: new Date(),
      simulated: true
    };
  }

  getServiceStatus() {
    return {
      configured: this.isConfigured,
      provider: 'Google Analytics 4',
      propertyId: this.propertyId
    };
  }
}

module.exports = new AnalyticsService(); 