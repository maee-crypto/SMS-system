lomodule.exports = {
  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/phishing-simulation',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Email Configuration (Optional)
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },

  // SMS Configuration (Optional)
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
  },

  // Analytics Configuration
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    anonymizeData: process.env.ANONYMIZE_DATA !== 'false'
  },

  // Educational Configuration
  educational: {
    mode: process.env.EDUCATIONAL_MODE !== 'false',
    disclaimer: process.env.SIMULATION_DISCLAIMER !== 'false'
  },

  // Development Configuration
  development: {
    debug: process.env.DEBUG === 'true',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000' || "*",
    credentials: true
  }
}; 