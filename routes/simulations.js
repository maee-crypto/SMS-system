const express = require('express');
const { body, validationResult } = require('express-validator');
const Simulation = require('../models/Simulation');
const Session = require('../models/Session');
const FakeWebsite = require('../models/FakeWebsite');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all active simulations
router.get('/', async (req, res) => {
  try {
    const { type, difficulty, platform, limit = 20, page = 1 } = req.query;
    
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (platform) filter.targetPlatform = platform;

    const simulations = await Simulation.find(filter)
      .populate('createdBy', 'username organization')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Simulation.countDocuments(filter);

    res.json({
      simulations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get simulations error:', error);
    res.status(500).json({ error: 'Server error fetching simulations' });
  }
});

// Get simulation by ID
router.get('/:id', async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id)
      .populate('createdBy', 'username organization');
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    if (!simulation.isActive) {
      return res.status(404).json({ error: 'Simulation is not active' });
    }

    res.json({ simulation });
  } catch (error) {
    console.error('Get simulation error:', error);
    res.status(500).json({ error: 'Server error fetching simulation' });
  }
});

// Create new simulation (admin/instructor only)
router.post('/', auth, authorize('instructor', 'admin'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['sms-call', 'sms-website-call', 'email-phishing', 'voice-phishing', 'social-media', 'wallet-phishing'])
    .withMessage('Invalid simulation type'),
  body('targetPlatform').isIn(['metamask', 'binance', 'trust-wallet', 'coinbase', 'paypal', 'bank', 'social-media', 'generic'])
    .withMessage('Invalid target platform'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const simulation = new Simulation({
      ...req.body,
      createdBy: req.user.userId
    });

    await simulation.save();
    await simulation.populate('createdBy', 'username organization');

    res.status(201).json({
      message: 'Simulation created successfully',
      simulation
    });
  } catch (error) {
    console.error('Create simulation error:', error);
    res.status(500).json({ error: 'Server error creating simulation' });
  }
});

// Start a simulation session
router.post('/:id/start', auth, async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation || !simulation.isActive) {
      return res.status(404).json({ error: 'Simulation not found or inactive' });
    }

    // Check if user already has an active session for this simulation
    const existingSession = await Session.findOne({
      userId: req.user.userId,
      simulationId: req.params.id,
      status: 'active'
    });

    if (existingSession) {
      return res.json({
        message: 'Resuming existing session',
        session: existingSession,
        simulation
      });
    }

    // Create new session
    const session = new Session({
      userId: req.user.userId,
      simulationId: req.params.id,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        deviceType: req.headers['sec-ch-ua-platform'] || 'unknown',
        browser: req.headers['sec-ch-ua'] || 'unknown',
        screenResolution: req.headers['sec-ch-viewport-width'] ? 
          `${req.headers['sec-ch-viewport-width']}x${req.headers['sec-ch-viewport-height']}` : 'unknown',
        timezone: req.headers['sec-ch-ua-platform-version'] || 'unknown',
        language: req.headers['accept-language'] || 'en'
      }
    });

    await session.save();

    // Add initial interaction
    session.interactions.push({
      type: 'simulation-started',
      timestamp: new Date(),
      stepNumber: 1,
      points: 0
    });

    await session.save();

    res.json({
      message: 'Simulation session started',
      session,
      simulation
    });
  } catch (error) {
    console.error('Start simulation error:', error);
    res.status(500).json({ error: 'Server error starting simulation' });
  }
});

// Handle simulation interaction
router.post('/:id/interact', auth, async (req, res) => {
  try {
    const { sessionId, interactionType, data, userResponse, psychologicalTrigger } = req.body;

    const session = await Session.findById(sessionId);
    if (!session || session.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Add interaction to session
    const interaction = {
      type: interactionType,
      timestamp: new Date(),
      data,
      userResponse,
      psychologicalTrigger,
      stepNumber: session.currentStep,
      points: 0
    };

    session.interactions.push(interaction);
    session.analytics.totalInteractions = session.interactions.length;

    // Calculate time to respond if this is a response to a previous interaction
    if (session.interactions.length > 1) {
      const previousInteraction = session.interactions[session.interactions.length - 2];
      interaction.timeToRespond = Math.floor((interaction.timestamp - previousInteraction.timestamp) / 1000);
    }

    // Update session based on interaction type
    switch (interactionType) {
      case 'sms-received':
        session.currentStep = 2;
        break;
      case 'link-clicked':
        session.currentStep = 3;
        break;
      case 'form-submitted':
        session.currentStep = 4;
        break;
      case 'call-made':
        session.currentStep = 5;
        break;
      case 'information-provided':
        session.outcome.fellForPhish = true;
        session.status = 'completed';
        session.endTime = new Date();
        break;
    }

    await session.save();

    // Calculate score and analyze vulnerability
    session.calculateScore();
    session.analyzeVulnerability();
    await session.save();

    res.json({
      message: 'Interaction recorded',
      session,
      nextStep: simulation.simulationFlow?.steps?.find(s => s.stepNumber === session.currentStep)
    });
  } catch (error) {
    console.error('Simulation interaction error:', error);
    res.status(500).json({ error: 'Server error recording interaction' });
  }
});

// Generate fake website for simulation
router.get('/:id/fake-website', auth, async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const fakeWebsite = await FakeWebsite.findOne({
      platform: simulation.targetPlatform,
      template: simulation.scenario.fakeWebsite?.template,
      isActive: true
    });

    if (!fakeWebsite) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    // Generate custom data for the website
    const customData = {
      title: simulation.title,
      phoneNumber: simulation.scenario.phoneNumber,
      urgencyMessage: simulation.scenario.smsMessage,
      ...req.query // Allow custom parameters
    };

    const completeHtml = fakeWebsite.generateCompleteHtml(customData);

    res.set('Content-Type', 'text/html');
    res.send(completeHtml);
  } catch (error) {
    console.error('Generate fake website error:', error);
    res.status(500).json({ error: 'Server error generating fake website' });
  }
});

// Handle fake website form submission
router.post('/:id/fake-website/submit', auth, async (req, res) => {
  try {
    const { sessionId, formData } = req.body;

    const session = await Session.findById(sessionId);
    if (!session || session.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const fakeWebsite = await FakeWebsite.findOne({
      platform: simulation.targetPlatform,
      template: simulation.scenario.fakeWebsite?.template,
      isActive: true
    });

    if (!fakeWebsite) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    // Validate form data
    const validation = fakeWebsite.validateFormData(formData);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Record the interaction
    session.interactions.push({
      type: 'form-submitted',
      timestamp: new Date(),
      data: { formData },
      userResponse: 'provided-info',
      psychologicalTrigger: simulation.scenario.socialEngineering?.psychologicalTriggers?.[0] || 'fear',
      stepNumber: session.currentStep,
      points: -30
    });

    session.outcome.fellForPhish = true;
    session.status = 'completed';
    session.endTime = new Date();

    // Calculate final score and analysis
    session.calculateScore();
    session.analyzeVulnerability();
    await session.save();

    // Update simulation stats
    await simulation.updateStats();

    res.json({
      message: 'Form submitted successfully',
      session,
      redirectUrl: fakeWebsite.redirectUrl || '/simulation/complete'
    });
  } catch (error) {
    console.error('Fake website submit error:', error);
    res.status(500).json({ error: 'Server error processing form submission' });
  }
});

// Complete simulation session
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { sessionId, feedback, confidenceLevel } = req.body;

    const session = await Session.findById(sessionId);
    if (!session || session.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.status = 'completed';
    session.endTime = new Date();
    session.outcome.feedback = feedback;
    session.outcome.learningOutcomes.confidenceLevel = confidenceLevel;

    // Calculate final score and analysis
    session.calculateScore();
    session.analyzeVulnerability();
    await session.save();

    // Update simulation stats
    const simulation = await Simulation.findById(req.params.id);
    if (simulation) {
      await simulation.updateStats();
    }

    res.json({
      message: 'Simulation completed',
      session,
      educationalContent: simulation?.educationalContent
    });
  } catch (error) {
    console.error('Complete simulation error:', error);
    res.status(500).json({ error: 'Server error completing simulation' });
  }
});

// Get simulation statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const sessions = await Session.find({ simulationId: req.params.id, status: 'completed' });
    
    const stats = {
      totalAttempts: sessions.length,
      successRate: simulation.successRate,
      averageScore: simulation.averageScore,
      averageDuration: sessions.length > 0 ? 
        sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length : 0,
      vulnerabilityAnalysis: {
        fearSusceptible: sessions.filter(s => 
          s.outcome.psychologicalAnalysis.vulnerabilityFactors.includes('Susceptible to fear-based manipulation')
        ).length,
        urgencySusceptible: sessions.filter(s => 
          s.outcome.psychologicalAnalysis.vulnerabilityFactors.includes('Acts impulsively under pressure')
        ).length,
        authoritySusceptible: sessions.filter(s => 
          s.outcome.psychologicalAnalysis.vulnerabilityFactors.includes('Deferential to authority figures')
        ).length
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get simulation stats error:', error);
    res.status(500).json({ error: 'Server error fetching simulation statistics' });
  }
});

// Update simulation (admin/instructor only)
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    Object.assign(simulation, req.body, { updatedAt: new Date() });
    await simulation.save();

    res.json({
      message: 'Simulation updated successfully',
      simulation
    });
  } catch (error) {
    console.error('Update simulation error:', error);
    res.status(500).json({ error: 'Server error updating simulation' });
  }
});

// Delete simulation (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    await simulation.remove();
    res.json({ message: 'Simulation deleted successfully' });
  } catch (error) {
    console.error('Delete simulation error:', error);
    res.status(500).json({ error: 'Server error deleting simulation' });
  }
});

module.exports = router; 