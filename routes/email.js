const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const { auth, authorize } = require('../middleware/auth');
const Simulation = require('../models/Simulation');

const router = express.Router();

// Send phishing email for simulation (Admin/Instructor only)
router.post('/send-simulation', [
  auth, 
  authorize('admin', 'instructor'),
  body('to').isEmail().withMessage('Valid email is required'),
  body('simulationId').isMongoId().withMessage('Valid simulation ID is required'),
  body('type').isIn(['bank', 'crypto', 'general']).withMessage('Valid type is required'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Valid urgency level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { to, simulationId, type, urgency, customDetails } = req.body;

    // Generate email template
    const template = emailService.generatePhishingEmailTemplate(type, urgency);
    const content = template.content.replace('{link}', `${process.env.FRONTEND_URL}/simulation/${simulationId}`);

    // Send email
    const result = await emailService.sendPhishingEmail(to, template.subject, content, simulationId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Send bulk emails for class training
router.post('/send-bulk', [
  auth, 
  authorize('admin', 'instructor'),
  body('recipients').isArray({ min: 1, max: 100 }).withMessage('Recipients array is required'),
  body('recipients.*.email').isEmail().withMessage('Valid email is required'),
  body('simulationId').isMongoId().withMessage('Valid simulation ID is required'),
  body('type').isIn(['bank', 'crypto', 'general']).withMessage('Valid type is required'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Valid urgency level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { recipients, simulationId, type, urgency, customDetails } = req.body;

    // Generate email template
    const template = emailService.generatePhishingEmailTemplate(type, urgency);
    const content = template.content.replace('{link}', `${process.env.FRONTEND_URL}/simulation/${simulationId}`);

    // Send bulk emails
    const results = await emailService.sendBulkEmails(recipients, template.subject, content, simulationId);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `Bulk email campaign completed`,
      data: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
        results: results
      }
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get email service status
router.get('/service-status', auth, async (req, res) => {
  try {
    const status = emailService.getServiceStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Generate email template
router.post('/generate-template', [
  auth, 
  authorize('admin', 'instructor'),
  body('type').isIn(['bank', 'crypto', 'general']).withMessage('Valid type is required'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Valid urgency level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { type, urgency } = req.body;
    const template = emailService.generatePhishingEmailTemplate(type, urgency);

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 