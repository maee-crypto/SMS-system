const express = require('express');
const { body, validationResult } = require('express-validator');
const aiService = require('../services/aiService');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate AI-powered phishing content
router.post('/generate-content', [
  auth, 
  authorize('admin', 'instructor'),
  body('type').isIn(['email', 'sms']).withMessage('Valid type is required'),
  body('urgency').isIn(['low', 'medium', 'high']).withMessage('Valid urgency level is required'),
  body('targetPlatform').trim().isLength({ min: 1 }).withMessage('Target platform is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { type, urgency, targetPlatform, customDetails } = req.body;

    const result = await aiService.generatePhishingContent(type, urgency, targetPlatform, customDetails);

    if (result.success) {
      res.json({
        success: true,
        message: 'AI content generated successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate AI content',
        error: result.error
      });
    }

  } catch (error) {
    console.error('AI content generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Analyze user response to phishing simulation
router.post('/analyze-response', [
  auth,
  body('userResponse').trim().isLength({ min: 1 }).withMessage('User response is required'),
  body('simulationContext').isObject().withMessage('Simulation context is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { userResponse, simulationContext } = req.body;

    const result = await aiService.analyzePhishingResponse(userResponse, simulationContext);

    if (result.success) {
      res.json({
        success: true,
        message: 'Response analyzed successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to analyze response',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Response analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Generate educational content
router.post('/generate-educational', [
  auth, 
  authorize('admin', 'instructor'),
  body('topic').trim().isLength({ min: 1 }).withMessage('Topic is required'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Valid difficulty level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { topic, difficulty } = req.body;

    const result = await aiService.generateEducationalContent(topic, difficulty);

    if (result.success) {
      res.json({
        success: true,
        message: 'Educational content generated successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate educational content',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Educational content generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Detect phishing attempts in text
router.post('/detect-phishing', [
  auth,
  body('text').trim().isLength({ min: 1 }).withMessage('Text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { text } = req.body;

    const result = await aiService.detectPhishingAttempts(text);

    if (result.success) {
      res.json({
        success: true,
        message: 'Phishing detection completed',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to detect phishing',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Phishing detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get AI service status
router.get('/service-status', auth, async (req, res) => {
  try {
    const status = aiService.getServiceStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('AI service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 