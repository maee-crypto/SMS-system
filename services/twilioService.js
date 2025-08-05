const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = null;
    this.fromNumber = null;
    this.isConfigured = false;
    this.initializeTwilio();
  }

  initializeTwilio() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && fromNumber) {
        this.client = twilio(accountSid, authToken);
        this.fromNumber = fromNumber;
        this.isConfigured = true;
        console.log('✅ Twilio SMS service initialized successfully');
      } else {
        console.log('⚠️ Twilio credentials not found. SMS functionality will be simulated.');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Error initializing Twilio:', error);
      this.isConfigured = false;
    }
  }

  async sendSMS(to, message, simulationId = null) {
    if (!this.isConfigured) {
      // Simulate SMS sending for development/testing
      return this.simulateSMS(to, message, simulationId);
    }

    try {
      const messageData = {
        body: message,
        from: this.fromNumber,
        to: to,
        statusCallback: `${process.env.BASE_URL}/api/sms/status-callback`,
        statusCallbackEvent: ['delivered', 'failed', 'undelivered'],
        statusCallbackMethod: 'POST'
      };

      // Add simulation tracking if provided
      if (simulationId) {
        messageData.body += `\n\n[Simulation ID: ${simulationId}]`;
      }

      const result = await this.client.messages.create(messageData);
      
      console.log(`📱 SMS sent successfully to ${to}:`, result.sid);
      
      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        to: to,
        from: this.fromNumber,
        body: message,
        timestamp: new Date(),
        simulationId: simulationId
      };

    } catch (error) {
      console.error('❌ Error sending SMS:', error);
      return {
        success: false,
        error: error.message,
        to: to,
        from: this.fromNumber,
        body: message,
        timestamp: new Date(),
        simulationId: simulationId
      };
    }
  }

  async simulateSMS(to, message, simulationId = null) {
    // Simulate SMS sending for development/testing
    console.log(`📱 [SIMULATED] SMS to ${to}:`, message);
    
    return {
      success: true,
      messageSid: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'delivered',
      to: to,
      from: '+1234567890',
      body: message,
      timestamp: new Date(),
      simulationId: simulationId,
      simulated: true
    };
  }

  async getMessageStatus(messageSid) {
    if (!this.isConfigured) {
      return { status: 'delivered', simulated: true };
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateUpdated: message.dateUpdated,
        dateSent: message.dateSent
      };
    } catch (error) {
      console.error('❌ Error fetching message status:', error);
      return { status: 'unknown', error: error.message };
    }
  }

  async getMessageHistory(phoneNumber, limit = 50) {
    if (!this.isConfigured) {
      return [];
    }

    try {
      const messages = await this.client.messages.list({
        to: phoneNumber,
        limit: limit
      });

      return messages.map(msg => ({
        sid: msg.sid,
        body: msg.body,
        status: msg.status,
        direction: msg.direction,
        dateCreated: msg.dateCreated,
        dateSent: msg.dateSent,
        errorCode: msg.errorCode,
        errorMessage: msg.errorMessage
      }));
    } catch (error) {
      console.error('❌ Error fetching message history:', error);
      return [];
    }
  }

  async validatePhoneNumber(phoneNumber) {
    if (!this.isConfigured) {
      // Simulate validation for development
      return {
        valid: true,
        phoneNumber: phoneNumber,
        countryCode: 'US',
        simulated: true
      };
    }

    try {
      const lookup = await this.client.lookups.v2.phoneNumbers(phoneNumber).fetch({
        fields: ['country_code', 'line_type', 'carrier']
      });

      return {
        valid: true,
        phoneNumber: lookup.phoneNumber,
        countryCode: lookup.countryCode,
        lineType: lookup.lineType,
        carrier: lookup.carrier,
        nationalFormat: lookup.nationalFormat,
        internationalFormat: lookup.internationalFormat
      };
    } catch (error) {
      console.error('❌ Error validating phone number:', error);
      return {
        valid: false,
        error: error.message,
        phoneNumber: phoneNumber
      };
    }
  }

  async sendBulkSMS(recipients, message, simulationId = null) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS(recipient.phone, message, simulationId);
      results.push({
        ...result,
        recipient: recipient
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  async createSMSWebhook(simulationId, webhookUrl) {
    if (!this.isConfigured) {
      return { success: true, simulated: true };
    }

    try {
      // Create webhook for SMS status updates
      const webhook = await this.client.webhooks.create({
        targetUrl: webhookUrl,
        target: 'webhook',
        eventTypes: ['message.delivered', 'message.failed', 'message.undelivered']
      });

      return {
        success: true,
        webhookSid: webhook.sid,
        targetUrl: webhook.targetUrl,
        eventTypes: webhook.eventTypes
      };
    } catch (error) {
      console.error('❌ Error creating SMS webhook:', error);
      return { success: false, error: error.message };
    }
  }

  getServiceStatus() {
    return {
      configured: this.isConfigured,
      fromNumber: this.fromNumber,
      clientAvailable: !!this.client
    };
  }

  // Generate realistic phishing SMS messages
  generatePhishingSMS(type = 'general', urgency = 'medium') {
    const messages = {
      'bank': {
        high: [
          "🚨 URGENT: Your bank account has been SUSPENDED due to suspicious activity. Verify immediately: {link}",
          "⚠️ SECURITY ALERT: Unauthorized login detected. Lock your account now: {link}",
          "🔒 CRITICAL: Your account will be CLOSED in 2 hours unless verified: {link}"
        ],
        medium: [
          "Your account requires verification. Please update your information: {link}",
          "Security check required. Verify your account details: {link}",
          "Account maintenance needed. Complete verification: {link}"
        ],
        low: [
          "Please verify your account information: {link}",
          "Update your account details: {link}",
          "Account verification pending: {link}"
        ]
      },
      'crypto': {
        high: [
          "🚨 CRITICAL: Your wallet has been COMPROMISED. Secure immediately: {link}",
          "⚠️ URGENT: Unauthorized transaction detected. Lock wallet now: {link}",
          "🔒 ALERT: Your crypto assets are at risk. Verify now: {link}"
        ],
        medium: [
          "Your wallet requires security verification: {link}",
          "Crypto account needs verification: {link}",
          "Wallet security check required: {link}"
        ],
        low: [
          "Please verify your wallet: {link}",
          "Update wallet security: {link}",
          "Wallet verification needed: {link}"
        ]
      },
      'general': {
        high: [
          "🚨 URGENT: Your account has been LOCKED. Unlock immediately: {link}",
          "⚠️ CRITICAL: Security breach detected. Secure account now: {link}",
          "🔒 ALERT: Account suspension pending. Verify now: {link}"
        ],
        medium: [
          "Your account requires verification: {link}",
          "Security check needed: {link}",
          "Account verification pending: {link}"
        ],
        low: [
          "Please verify your account: {link}",
          "Update your information: {link}",
          "Account check required: {link}"
        ]
      }
    };

    const typeMessages = messages[type] || messages.general;
    const urgencyMessages = typeMessages[urgency] || typeMessages.medium;
    
    return urgencyMessages[Math.floor(Math.random() * urgencyMessages.length)];
  }
}

module.exports = new TwilioService(); 