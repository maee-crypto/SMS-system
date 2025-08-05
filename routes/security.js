const express = require('express');
const { body, validationResult } = require('express-validator');
const securityService = require('../services/securityService');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Setup 2FA for user
router.post('/setup-2fa', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate 2FA secret
    const secretResult = securityService.generateTwoFactorSecret(userId, 'PhishingSimulation');
    
    if (!secretResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate 2FA secret',
        error: secretResult.error
      });
    }

    // Generate QR code
    const qrResult = await securityService.generateQRCode(secretResult.otpauthUrl);
    
    if (!qrResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: qrResult.error
      });
    }

    // Store secret temporarily (user needs to verify before saving permanently)
    user.tempTwoFactorSecret = secretResult.secret;
    await user.save();

    res.json({
      success: true,
      message: '2FA setup initiated',
      data: {
        secret: secretResult.secret,
        qrCode: qrResult.qrCode,
        otpauthUrl: secretResult.otpauthUrl
      }
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', [
  auth,
  body('token').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { token } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.tempTwoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA setup not initiated or user not found'
      });
    }

    // Verify token
    const verifyResult = securityService.verifyTwoFactorToken(token, user.tempTwoFactorSecret);
    
    if (!verifyResult.success || !verifyResult.verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Enable 2FA permanently
    user.twoFactorSecret = user.tempTwoFactorSecret;
    user.twoFactorEnabled = true;
    user.tempTwoFactorSecret = undefined;
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Disable 2FA
router.post('/disable-2fa', [
  auth,
  body('token').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { token } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA not enabled'
      });
    }

    // Verify token
    const verifyResult = securityService.verifyTwoFactorToken(token, user.twoFactorSecret);
    
    if (!verifyResult.success || !verifyResult.verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Disable 2FA
    user.twoFactorSecret = undefined;
    user.twoFactorEnabled = false;
    await user.save();

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Verify reCAPTCHA
router.post('/verify-recaptcha', [
  body('token').trim().isLength({ min: 1 }).withMessage('reCAPTCHA token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { token } = req.body;
    const remoteip = req.ip;

    const result = await securityService.verifyRecaptcha(token, remoteip);

    if (result.success) {
      res.json({
        success: true,
        message: 'reCAPTCHA verified successfully',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed',
        error: result.error
      });
    }

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Validate password strength
router.post('/validate-password', [
  body('password').trim().isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { password } = req.body;
    const result = securityService.validatePasswordStrength(password);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Password validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get IP information
router.get('/ip-info/:ip', auth, async (req, res) => {
  try {
    const { ip } = req.params;
    const result = await securityService.getIPInfo(ip);

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to get IP information',
        error: result.error
      });
    }

  } catch (error) {
    console.error('IP info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get security service status
router.get('/service-status', auth, async (req, res) => {
  try {
    const status = securityService.getServiceStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Security service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Generate session token
router.post('/generate-session', auth, async (req, res) => {
  try {
    const result = securityService.generateSessionToken();
    
    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate session token',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Session token generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 