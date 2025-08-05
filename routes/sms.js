const express = require('express');
const { body, validationResult } = require('express-validator');
const twilioService = require('../services/twilioService');
const { auth, authorize } = require('../middleware/auth');
const Simulation = require('../models/Simulation');
const Session = require('../models/Session');

const router = express.Router();

// SMS Status Callback (Twilio webhook)
router.post('/status-callback', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = `${process.env.BASE_URL}/api/sms/status-callback`;
    const params = req.body;

    // Verify the request is from Twilio (optional for development)
    if (process.env.NODE_ENV === 'production') {
      const twilio = require('twilio');
      const requestIsValid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN,
        twilioSignature,
        url,
        params
      );

      if (!requestIsValid) {
        return res.status(403).json({ error: 'Invalid Twilio signature' });
      }
    }

    const messageSid = params.MessageSid;
    const messageStatus = params.MessageStatus;
    const errorCode = params.ErrorCode;
    const errorMessage = params.ErrorMessage;

    console.log(`📱 SMS Status Update: ${messageSid} - ${messageStatus}`);

    // Update session with SMS status if simulation ID is present
    if (params.Body && params.Body.includes('[Simulation ID:')) {
      const simulationIdMatch = params.Body.match(/\[Simulation ID: ([^\]]+)\]/);
      if (simulationIdMatch) {
        const simulationId = simulationIdMatch[1];
        
        // Find and update the session
        await Session.findOneAndUpdate(
          { simulationId: simulationId },
          { 
            $push: { 
              smsEvents: {
                messageSid: messageSid,
                status: messageStatus,
                errorCode: errorCode,
                errorMessage: errorMessage,
                timestamp: new Date()
              }
            }
          }
        );
      }
    }

    res.status(200).send();
  } catch (error) {
    console.error('SMS status callback error:', error);
    res.status(500).json({ error: 'Server error processing SMS status' });
  }
});

// Send SMS for simulation (Admin only)
router.post('/send-simulation', [
  auth,
  authorize('admin', 'instructor'),
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('simulationId').isMongoId().withMessage('Valid simulation ID required'),
  body('message').trim().isLength({ min: 1, max: 1600 }).withMessage('Message required (max 1600 chars)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, simulationId, message } = req.body;

    // Validate phone number
    const phoneValidation = await twilioService.validatePhoneNumber(phoneNumber);
    if (!phoneValidation.valid) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Check if simulation exists
    const simulation = await Simulation.findById(simulationId);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Send SMS
    const smsResult = await twilioService.sendSMS(phoneNumber, message, simulationId);

    if (smsResult.success) {
      // Create or update session
      let session = await Session.findOne({ 
        simulationId: simulationId,
        userId: req.user.id,
        status: { $in: ['active', 'pending'] }
      });

      if (!session) {
        session = new Session({
          userId: req.user.id,
          simulationId: simulationId,
          status: 'active',
          startTime: new Date(),
          smsEvents: [{
            messageSid: smsResult.messageSid,
            status: smsResult.status,
            timestamp: smsResult.timestamp
          }]
        });
      } else {
        session.smsEvents.push({
          messageSid: smsResult.messageSid,
          status: smsResult.status,
          timestamp: smsResult.timestamp
        });
      }

      await session.save();

      res.json({
        message: 'SMS sent successfully',
        smsResult,
        sessionId: session._id
      });
    } else {
      res.status(500).json({
        error: 'Failed to send SMS',
        details: smsResult.error
      });
    }

  } catch (error) {
    console.error('Send simulation SMS error:', error);
    res.status(500).json({ error: 'Server error sending SMS' });
  }
});

// Send bulk SMS for class training
router.post('/send-bulk', [
  auth,
  authorize('admin', 'instructor'),
  body('recipients').isArray({ min: 1, max: 100 }).withMessage('Recipients array required (1-100)'),
  body('recipients.*.phone').isMobilePhone().withMessage('Valid phone numbers required'),
  body('recipients.*.name').optional().trim().isLength({ max: 100 }),
  body('simulationId').isMongoId().withMessage('Valid simulation ID required'),
  body('messageTemplate').trim().isLength({ min: 1, max: 1600 }).withMessage('Message template required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipients, simulationId, messageTemplate } = req.body;

    // Check if simulation exists
    const simulation = await Simulation.findById(simulationId);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Validate all phone numbers
    const validationPromises = recipients.map(recipient => 
      twilioService.validatePhoneNumber(recipient.phone)
    );
    const validations = await Promise.all(validationPromises);
    
    const invalidRecipients = validations.filter(v => !v.valid);
    if (invalidRecipients.length > 0) {
      return res.status(400).json({ 
        error: 'Some phone numbers are invalid',
        invalidRecipients: invalidRecipients.map(v => v.phoneNumber)
      });
    }

    // Send bulk SMS
    const results = await twilioService.sendBulkSMS(recipients, messageTemplate, simulationId);

    // Create sessions for successful sends
    const successfulSends = results.filter(r => r.success);
    const sessionPromises = successfulSends.map(result => {
      const session = new Session({
        userId: req.user.id,
        simulationId: simulationId,
        status: 'active',
        startTime: new Date(),
        recipientPhone: result.to,
        smsEvents: [{
          messageSid: result.messageSid,
          status: result.status,
          timestamp: result.timestamp
        }]
      });
      return session.save();
    });

    await Promise.all(sessionPromises);

    res.json({
      message: 'Bulk SMS sent',
      total: recipients.length,
      successful: successfulSends.length,
      failed: results.length - successfulSends.length,
      results: results
    });

  } catch (error) {
    console.error('Send bulk SMS error:', error);
    res.status(500).json({ error: 'Server error sending bulk SMS' });
  }
});

// Get SMS status
router.get('/status/:messageSid', auth, async (req, res) => {
  try {
    const { messageSid } = req.params;
    const status = await twilioService.getMessageStatus(messageSid);
    
    res.json(status);
  } catch (error) {
    console.error('Get SMS status error:', error);
    res.status(500).json({ error: 'Server error fetching SMS status' });
  }
});

// Get SMS history for a phone number
router.get('/history/:phoneNumber', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { limit = 50 } = req.query;
    
    const history = await twilioService.getMessageHistory(phoneNumber, parseInt(limit));
    
    res.json({ history });
  } catch (error) {
    console.error('Get SMS history error:', error);
    res.status(500).json({ error: 'Server error fetching SMS history' });
  }
});

// Validate phone number
router.post('/validate', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const validation = await twilioService.validatePhoneNumber(phoneNumber);
    
    res.json(validation);
  } catch (error) {
    console.error('Validate phone number error:', error);
    res.status(500).json({ error: 'Server error validating phone number' });
  }
});

// Generate phishing SMS message
router.post('/generate-message', [
  auth,
  authorize('admin', 'instructor'),
  body('type').isIn(['bank', 'crypto', 'general']).withMessage('Valid type required'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Valid urgency level required'),
  body('customLink').optional().isURL().withMessage('Valid URL required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, urgency, customLink } = req.body;
    
    let message = twilioService.generatePhishingSMS(type, urgency);
    
    // Replace placeholder with custom link or default
    const link = customLink || 'https://example.com/verify';
    message = message.replace('{link}', link);

    res.json({
      message: message,
      type: type,
      urgency: urgency,
      link: link,
      characterCount: message.length
    });

  } catch (error) {
    console.error('Generate message error:', error);
    res.status(500).json({ error: 'Server error generating message' });
  }
});

// Get Twilio service status
router.get('/service-status', auth, async (req, res) => {
  try {
    const status = twilioService.getServiceStatus();
    res.json(status);
  } catch (error) {
    console.error('Get service status error:', error);
    res.status(500).json({ error: 'Server error fetching service status' });
  }
});

// Get SMS analytics for admin
router.get('/analytics', [
  auth,
  authorize('admin', 'instructor')
], async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    // Get SMS sessions
    const smsSessions = await Session.find({
      'smsEvents.0': { $exists: true },
      createdAt: { $gte: startDate }
    }).populate('simulationId', 'title type');

    // Calculate analytics
    const totalSMS = smsSessions.reduce((sum, session) => sum + session.smsEvents.length, 0);
    const deliveredSMS = smsSessions.reduce((sum, session) => 
      sum + session.smsEvents.filter(event => event.status === 'delivered').length, 0
    );
    const failedSMS = smsSessions.reduce((sum, session) => 
      sum + session.smsEvents.filter(event => event.status === 'failed').length, 0
    );

    const deliveryRate = totalSMS > 0 ? Math.round((deliveredSMS / totalSMS) * 100) : 0;

    // Group by simulation type
    const byType = {};
    smsSessions.forEach(session => {
      const type = session.simulationId?.type || 'unknown';
      if (!byType[type]) {
        byType[type] = { total: 0, delivered: 0, failed: 0 };
      }
      byType[type].total += session.smsEvents.length;
      byType[type].delivered += session.smsEvents.filter(e => e.status === 'delivered').length;
      byType[type].failed += session.smsEvents.filter(e => e.status === 'failed').length;
    });

    res.json({
      timeRange,
      totalSMS,
      deliveredSMS,
      failedSMS,
      deliveryRate,
      byType: Object.entries(byType).map(([type, stats]) => ({
        type,
        total: stats.total,
        delivered: stats.delivered,
        failed: stats.failed,
        deliveryRate: stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0
      }))
    });

  } catch (error) {
    console.error('SMS analytics error:', error);
    res.status(500).json({ error: 'Server error fetching SMS analytics' });
  }
});

module.exports = router; 