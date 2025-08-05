const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const rateLimit = require('express-rate-limit');

class SecurityService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    this.isConfigured = false;
    this.initializeSecurity();
  }

  initializeSecurity() {
    try {
      if (this.recaptchaSecret) {
        this.isConfigured = true;
        console.log('✅ Security service initialized with reCAPTCHA');
      } else {
        console.log('⚠️ reCAPTCHA secret not found. Security features will be simulated.');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Error initializing security service:', error);
      this.isConfigured = false;
    }
  }

  // JWT Token Management
  generateToken(userId, role, expiresIn = '24h') {
    try {
      const payload = {
        userId: userId,
        role: role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      };

      const token = jwt.sign(payload, this.jwtSecret, { expiresIn });
      
      return {
        success: true,
        token: token,
        expiresIn: expiresIn,
        payload: payload
      };
    } catch (error) {
      console.error('❌ Error generating JWT token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return {
        success: true,
        decoded: decoded,
        valid: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        valid: false
      };
    }
  }

  // Password Security
  async hashPassword(password) {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      return {
        success: true,
        hashedPassword: hashedPassword,
        saltRounds: saltRounds
      };
    } catch (error) {
      console.error('❌ Error hashing password:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyPassword(password, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      
      return {
        success: true,
        isMatch: isMatch
      };
    } catch (error) {
      console.error('❌ Error verifying password:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Two-Factor Authentication (2FA)
  generateTwoFactorSecret(userId, issuer = 'PhishingSimulation') {
    try {
      const secret = speakeasy.generateSecret({
        name: `${issuer}:${userId}`,
        issuer: issuer,
        length: 20
      });

      return {
        success: true,
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
        qrCode: null // Will be generated separately
      };
    } catch (error) {
      console.error('❌ Error generating 2FA secret:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      
      return {
        success: true,
        qrCode: qrCodeDataUrl
      };
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  verifyTwoFactorToken(token, secret) {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps tolerance
      });

      return {
        success: true,
        verified: verified
      };
    } catch (error) {
      console.error('❌ Error verifying 2FA token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // reCAPTCHA Verification
  async verifyRecaptcha(token, remoteip = null) {
    if (!this.isConfigured) {
      return this.simulateRecaptchaVerification(token);
    }

    try {
      const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const params = new URLSearchParams({
        secret: this.recaptchaSecret,
        response: token
      });

      if (remoteip) {
        params.append('remoteip', remoteip);
      }

      const response = await fetch(verificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const result = await response.json();

      return {
        success: true,
        verified: result.success,
        score: result.score || null,
        action: result.action || null,
        challengePassed: result.success,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error verifying reCAPTCHA:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.simulateRecaptchaVerification(token)
      };
    }
  }

  // Rate Limiting
  createRateLimiter(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };

    const limiterOptions = { ...defaultOptions, ...options };

    return rateLimit(limiterOptions);
  }

  // IP Geolocation and Security
  async getIPInfo(ip) {
    try {
      // Using a free IP geolocation service
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          ip: ip,
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          city: data.city,
          timezone: data.timezone,
          isp: data.isp,
          org: data.org,
          latitude: data.lat,
          longitude: data.lon
        };
      } else {
        return {
          success: false,
          error: 'Failed to get IP information'
        };
      }
    } catch (error) {
      console.error('❌ Error getting IP info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Security Headers
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google.com/recaptcha/; frame-src https://www.google.com/recaptcha/;",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  // Password Strength Validation
  validatePasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';

    return {
      success: true,
      score: score,
      strength: strength,
      checks: checks,
      valid: score >= 4
    };
  }

  // Session Security
  generateSessionToken() {
    try {
      const token = require('crypto').randomBytes(32).toString('hex');
      
      return {
        success: true,
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      console.error('❌ Error generating session token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simulation methods for development
  simulateRecaptchaVerification(token) {
    console.log(`🔒 [SIMULATED] reCAPTCHA verification for token: ${token}`);
    
    return {
      success: true,
      verified: true,
      score: 0.9,
      action: 'login',
      challengePassed: true,
      timestamp: new Date(),
      simulated: true
    };
  }

  getServiceStatus() {
    return {
      configured: this.isConfigured,
      features: {
        jwt: true,
        passwordHashing: true,
        twoFactorAuth: true,
        recaptcha: this.isConfigured,
        rateLimiting: true,
        ipGeolocation: true,
        securityHeaders: true
      },
      provider: 'Multi-Provider Security Service'
    };
  }
}

module.exports = new SecurityService(); 