const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  simulationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'failed', 'paused'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in seconds
  },
  currentStep: {
    type: Number,
    default: 1
  },
  interactions: [{
    type: {
      type: String,
      enum: ['sms-received', 'call-made', 'website-visited', 'credentials-entered', 'call-answered', 'information-provided', 'link-clicked', 'form-submitted', 'page-viewed', 'button-clicked', 'timeout', 'abandoned']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    },
    userResponse: {
      type: String,
      enum: ['clicked', 'ignored', 'provided-info', 'hung-up', 'reported', 'suspicious', 'immediate', 'delayed', 'never']
    },
    psychologicalTrigger: {
      type: String,
      enum: ['fear', 'urgency', 'authority', 'greed', 'curiosity', 'social-proof', 'none']
    },
    timeToRespond: Number, // in seconds
    stepNumber: Number,
    points: Number
  }],
  outcome: {
    fellForPhish: {
      type: Boolean,
      default: false
    },
    redFlagsIdentified: [String],
    preventionActionsTaken: [String],
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: {
      type: String
    },
    learningOutcomes: {
      awarenessLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      keyLearnings: [String],
      areasForImprovement: [String],
      confidenceLevel: {
        type: Number,
        min: 1,
        max: 10
      }
    },
    psychologicalAnalysis: {
      vulnerabilityFactors: [String],
      resistanceFactors: [String],
      decisionMakingPattern: String,
      emotionalResponse: String
    }
  },
  analytics: {
    timeToFirstInteraction: Number, // seconds
    totalInteractions: {
      type: Number,
      default: 0
    },
    suspiciousBehaviorDetected: {
      type: Boolean,
      default: false
    },
    reportingBehavior: {
      type: String,
      enum: ['none', 'partial', 'complete']
    },
    engagementMetrics: {
      timeOnSite: Number,
      pagesViewed: Number,
      formCompletionRate: Number,
      bounceRate: Number
    },
    psychologicalMetrics: {
      urgencyResponse: Number,
      authorityCompliance: Number,
      fearResponse: Number,
      curiosityResponse: Number
    }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceType: String,
    browser: String,
    screenResolution: String,
    timezone: String,
    language: String
  },
  educationalProgress: {
    preAssessmentScore: Number,
    postAssessmentScore: Number,
    improvementPercentage: Number,
    completedModules: [String],
    certificatesEarned: [String]
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

// Indexes for better query performance
sessionSchema.index({ userId: 1, simulationId: 1 });
sessionSchema.index({ status: 1, startTime: 1 });
sessionSchema.index({ 'outcome.fellForPhish': 1 });
sessionSchema.index({ 'analytics.suspiciousBehaviorDetected': 1 });

// Calculate duration when session ends
sessionSchema.pre('save', function(next) {
  if (this.isModified('endTime') && this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

// Virtual for session duration in minutes
sessionSchema.virtual('durationMinutes').get(function() {
  if (this.duration) {
    return Math.round(this.duration / 60 * 100) / 100;
  }
  return 0;
});

// Method to calculate score based on interactions
sessionSchema.methods.calculateScore = function() {
  let score = 100;
  let redFlags = [];
  let preventionActions = [];
  
  this.interactions.forEach(interaction => {
    switch (interaction.userResponse) {
      case 'provided-info':
        score -= 30;
        redFlags.push('Provided sensitive information');
        break;
      case 'clicked':
        score -= 15;
        redFlags.push('Clicked on suspicious link');
        break;
      case 'ignored':
        score += 10;
        preventionActions.push('Ignored suspicious message');
        break;
      case 'reported':
        score += 20;
        preventionActions.push('Reported suspicious activity');
        break;
      case 'suspicious':
        score += 15;
        preventionActions.push('Showed suspicion');
        break;
    }
  });
  
  this.outcome.score = Math.max(0, Math.min(100, score));
  this.outcome.redFlagsIdentified = redFlags;
  this.outcome.preventionActionsTaken = preventionActions;
  
  return this.outcome.score;
};

// Method to analyze psychological vulnerability
sessionSchema.methods.analyzeVulnerability = function() {
  const vulnerabilityFactors = [];
  const resistanceFactors = [];
  
  this.interactions.forEach(interaction => {
    if (interaction.psychologicalTrigger) {
      switch (interaction.psychologicalTrigger) {
        case 'fear':
          if (interaction.userResponse === 'provided-info') {
            vulnerabilityFactors.push('Susceptible to fear-based manipulation');
          } else {
            resistanceFactors.push('Resistant to fear tactics');
          }
          break;
        case 'urgency':
          if (interaction.userResponse === 'immediate') {
            vulnerabilityFactors.push('Acts impulsively under pressure');
          } else {
            resistanceFactors.push('Maintains composure under pressure');
          }
          break;
        case 'authority':
          if (interaction.userResponse === 'provided-info') {
            vulnerabilityFactors.push('Deferential to authority figures');
          } else {
            resistanceFactors.push('Questions authority appropriately');
          }
          break;
      }
    }
  });
  
  this.outcome.psychologicalAnalysis.vulnerabilityFactors = vulnerabilityFactors;
  this.outcome.psychologicalAnalysis.resistanceFactors = resistanceFactors;
  
  return {
    vulnerabilityFactors,
    resistanceFactors
  };
};

module.exports = mongoose.model('Session', sessionSchema); 