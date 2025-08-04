const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sms-call', 'sms-website-call', 'email-phishing', 'voice-phishing', 'social-media', 'wallet-phishing'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  targetPlatform: {
    type: String,
    required: true,
    enum: ['metamask', 'binance', 'trust-wallet', 'coinbase', 'paypal', 'bank', 'social-media', 'generic']
  },
  scenario: {
    smsMessage: {
      type: String,
      required: function() { return this.type === 'sms-call' || this.type === 'sms-website-call'; }
    },
    phoneNumber: {
      type: String,
      required: function() { return this.type === 'sms-call' || this.type === 'sms-website-call'; }
    },
    websiteUrl: {
      type: String,
      required: function() { return this.type === 'sms-website-call' || this.type === 'email-phishing'; }
    },
    emailTemplate: {
      subject: String,
      body: String,
      sender: String
    },
    voiceScript: {
      type: String,
      required: function() { return this.type === 'voice-phishing'; }
    },
    fakeWebsite: {
      template: {
        type: String,
        enum: ['metamask-clone', 'binance-clone', 'trust-wallet-clone', 'bank-clone', 'generic'],
        required: function() { return this.type === 'sms-website-call' || this.type === 'wallet-phishing'; }
      },
      customHtml: String,
      customCss: String,
      customJs: String,
      formFields: [{
        name: String,
        type: String,
        placeholder: String,
        required: Boolean,
        validation: String
      }],
      redirectUrl: String
    },
    socialEngineering: {
      urgencyLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      psychologicalTriggers: [{
        type: String,
        enum: ['fear', 'urgency', 'authority', 'greed', 'curiosity', 'social-proof']
      }],
      pressureTactics: [String],
      trustBuildingElements: [String]
    }
  },
  educationalContent: {
    learningObjectives: [String],
    redFlags: [String],
    preventionTips: [String],
    realWorldExamples: [String],
    debriefingQuestions: [String],
    resources: [{
      title: String,
      url: String,
      type: String
    }]
  },
  simulationFlow: {
    steps: [{
      stepNumber: Number,
      title: String,
      description: String,
      action: String,
      expectedResponse: String,
      timeLimit: Number, // in seconds
      points: Number
    }],
    branchingLogic: [{
      condition: String,
      nextStep: Number,
      alternativeStep: Number
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  estimatedDuration: {
    type: Number, // in minutes
    default: 15
  },
  successRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  averageScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
simulationSchema.index({ type: 1, difficulty: 1, isActive: 1 });
simulationSchema.index({ targetPlatform: 1, isActive: 1 });
simulationSchema.index({ tags: 1 });

// Update success rate and average score when session is completed
simulationSchema.methods.updateStats = async function() {
  const Session = mongoose.model('Session');
  const sessions = await Session.find({ 
    simulationId: this._id, 
    status: 'completed' 
  });
  
  this.totalAttempts = sessions.length;
  
  if (sessions.length > 0) {
    const fellForPhish = sessions.filter(s => s.outcome.fellForPhish).length;
    this.successRate = Math.round((fellForPhish / sessions.length) * 100);
    
    const totalScore = sessions.reduce((sum, s) => sum + (s.outcome.score || 0), 0);
    this.averageScore = Math.round(totalScore / sessions.length);
  }
  
  await this.save();
};

module.exports = mongoose.model('Simulation', simulationSchema); 