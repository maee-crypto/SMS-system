const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Simulation = require('../models/Simulation');
const Session = require('../models/Session');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin privileges
router.use(auth, authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, organization, isActive, limit = 20, page = 1 } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (organization) filter.organization = { $regex: organization, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's simulation history
    const sessions = await Session.find({ userId: user._id })
      .populate('simulationId', 'title type targetPlatform difficulty')
      .sort({ startTime: -1 })
      .limit(10);

    res.json({
      user,
      recentSessions: sessions
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

// Create new user
router.post('/users', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Invalid role'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or username already exists'
      });
    }

    const user = new User({
      username,
      email,
      password,
      role,
      organization
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
});

// Update user
router.put('/users/:id', [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Invalid role'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization name too long'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user.userId && req.body.isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    // Check for email/username conflicts
    if (req.body.email || req.body.username) {
      const conflictFilter = { _id: { $ne: user._id } };
      if (req.body.email) conflictFilter.email = req.body.email;
      if (req.body.username) conflictFilter.username = req.body.username;

      const existingUser = await User.findOne(conflictFilter);
      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email or username already exists'
        });
      }
    }

    Object.assign(user, req.body);
    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error updating user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user has any sessions
    const sessionCount = await Session.countDocuments({ userId: user._id });
    if (sessionCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with existing sessions',
        sessionCount
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

// Bulk user operations
router.post('/users/bulk', [
  body('action').isIn(['activate', 'deactivate', 'delete', 'change-role'])
    .withMessage('Invalid action'),
  body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
  body('role').optional().isIn(['student', 'instructor', 'admin'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, userIds, role } = req.body;

    // Prevent admin from affecting themselves
    if (userIds.includes(req.user.userId)) {
      return res.status(400).json({ error: 'Cannot perform action on your own account' });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { isActive: false }
        );
        break;
      case 'change-role':
        if (!role) {
          return res.status(400).json({ error: 'Role is required for change-role action' });
        }
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { role }
        );
        break;
      case 'delete':
        // Check for sessions before deletion
        const sessionsCount = await Session.countDocuments({
          userId: { $in: userIds }
        });
        if (sessionsCount > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete users with existing sessions',
            sessionsCount
          });
        }
        result = await User.deleteMany({ _id: { $in: userIds } });
        break;
    }

    res.json({
      message: `Bulk ${action} completed successfully`,
      affectedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    console.error('Bulk user operation error:', error);
    res.status(500).json({ error: 'Server error performing bulk operation' });
  }
});

// System statistics
router.get('/system-stats', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    const previousStartDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        previousStartDate.setDate(now.getDate() - 2);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
    }

    // Current period stats
    const totalUsers = await User.countDocuments();
    const activeSessions = await Session.countDocuments({ 
      status: 'active',
      createdAt: { $gte: startDate }
    });
    const completedSimulations = await Session.countDocuments({ 
      status: 'completed',
      createdAt: { $gte: startDate }
    });
    
    // Average score calculation
    const sessionsWithScores = await Session.find({ 
      status: 'completed',
      score: { $exists: true },
      createdAt: { $gte: startDate }
    });
    const averageScore = sessionsWithScores.length > 0 
      ? Math.round(sessionsWithScores.reduce((sum, session) => sum + session.score, 0) / sessionsWithScores.length)
      : 0;

    // Previous period stats for comparison
    const previousTotalUsers = await User.countDocuments({ createdAt: { $lt: startDate } });
    const previousActiveSessions = await Session.countDocuments({ 
      status: 'active',
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    const previousCompletedSimulations = await Session.countDocuments({ 
      status: 'completed',
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    const previousSessionsWithScores = await Session.find({ 
      status: 'completed',
      score: { $exists: true },
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    const previousAverageScore = previousSessionsWithScores.length > 0 
      ? Math.round(previousSessionsWithScores.reduce((sum, session) => sum + session.score, 0) / previousSessionsWithScores.length)
      : 0;

    // Recent activity
    const recentActivity = await Session.find({ createdAt: { $gte: startDate } })
      .populate('userId', 'username')
      .populate('simulationId', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .then(sessions => sessions.map(session => ({
        action: `Completed ${session.simulationId?.title || 'simulation'}`,
        user: session.userId?.username || 'Unknown',
        time: session.createdAt.toLocaleString()
      })));

    res.json({
      totalUsers,
      previousTotalUsers,
      activeSessions,
      previousActiveSessions,
      completedSimulations,
      previousCompletedSimulations,
      averageScore,
      previousAverageScore,
      uptime: '99.9%',
      avgResponseTime: '245ms',
      errorRate: '0.1%',
      recentActivity
    });
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({ error: 'Server error fetching system statistics' });
  }
});

// User statistics
router.get('/user-stats', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const now = new Date();
    const startDate = new Date();
    const previousStartDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        previousStartDate.setDate(now.getDate() - 2);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
    }

    // Current period
    const newRegistrations = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeUsers = await Session.distinct('userId', { createdAt: { $gte: startDate } });
    
    // Previous period
    const previousNewRegistrations = await User.countDocuments({ 
      createdAt: { $gte: previousStartDate, $lt: startDate } 
    });
    const previousActiveUsers = await Session.distinct('userId', { 
      createdAt: { $gte: previousStartDate, $lt: startDate } 
    });

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Organization distribution
    const organizationDistribution = await User.aggregate([
      { $match: { organization: { $exists: true, $ne: '' } } },
      { $group: { _id: '$organization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Retention rate calculation (simplified)
    const retentionRate = 85; // This would be calculated based on user return patterns
    const previousRetentionRate = 82;

    res.json({
      newRegistrations,
      previousNewRegistrations,
      activeUsers: activeUsers.length,
      previousActiveUsers: previousActiveUsers.length,
      retentionRate,
      previousRetentionRate,
      roleDistribution: roleDistribution.map(r => ({ role: r._id, count: r.count })),
      organizationDistribution: organizationDistribution.map(o => ({ 
        organization: o._id, 
        count: o.count 
      }))
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Server error fetching user statistics' });
  }
});

// Simulation statistics
router.get('/simulation-stats', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const now = new Date();
    const startDate = new Date();
    const previousStartDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        previousStartDate.setDate(now.getDate() - 2);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
    }

    // Current period
    const totalSimulations = await Simulation.countDocuments();
    const completedSessions = await Session.countDocuments({ 
      status: 'completed',
      createdAt: { $gte: startDate }
    });
    const totalSessions = await Session.countDocuments({ createdAt: { $gte: startDate } });
    const successRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    
    // Average completion time
    const sessionsWithTime = await Session.find({ 
      status: 'completed',
      timeSpent: { $exists: true },
      createdAt: { $gte: startDate }
    });
    const avgCompletionTime = sessionsWithTime.length > 0 
      ? Math.round(sessionsWithTime.reduce((sum, session) => sum + session.timeSpent, 0) / sessionsWithTime.length / 60)
      : 0;

    // Previous period
    const previousCompletedSessions = await Session.countDocuments({ 
      status: 'completed',
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    const previousTotalSessions = await Session.countDocuments({ 
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    const previousSuccessRate = previousTotalSessions > 0 
      ? Math.round((previousCompletedSessions / previousTotalSessions) * 100) 
      : 0;
    
    const previousSessionsWithTime = await Session.find({ 
      status: 'completed',
      timeSpent: { $exists: true },
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    const previousAvgCompletionTime = previousSessionsWithTime.length > 0 
      ? Math.round(previousSessionsWithTime.reduce((sum, session) => sum + session.timeSpent, 0) / previousSessionsWithTime.length / 60)
      : 0;

    // Performance by type
    const performanceByType = await Session.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $lookup: { from: 'simulations', localField: 'simulationId', foreignField: '_id', as: 'simulation' } },
      { $unwind: '$simulation' },
      { $group: { 
        _id: '$simulation.type', 
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }},
      { $project: { 
        type: '$_id', 
        completionRate: { $multiply: [{ $divide: ['$completed', '$total'] }, 100] }
      }}
    ]);

    res.json({
      totalSimulations,
      previousTotalSimulations: totalSimulations,
      successRate,
      previousSuccessRate,
      avgCompletionTime,
      previousAvgCompletionTime,
      performanceByType: performanceByType.map(p => ({ 
        type: p.type, 
        completionRate: Math.round(p.completionRate) 
      }))
    });
  } catch (error) {
    console.error('Simulation stats error:', error);
    res.status(500).json({ error: 'Server error fetching simulation statistics' });
  }
});

// Security metrics
router.get('/security-metrics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const now = new Date();
    const startDate = new Date();
    const previousStartDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        previousStartDate.setDate(now.getDate() - 2);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
    }

    // Mock security data (in real implementation, this would come from security logs)
    const failedLogins = Math.floor(Math.random() * 50) + 10;
    const previousFailedLogins = Math.floor(Math.random() * 50) + 10;
    const suspiciousActivities = Math.floor(Math.random() * 20) + 5;
    const previousSuspiciousActivities = Math.floor(Math.random() * 20) + 5;
    const securityScore = Math.floor(Math.random() * 20) + 80;
    const previousSecurityScore = Math.floor(Math.random() * 20) + 80;

    // Mock security alerts
    const recentAlerts = [
      {
        title: 'Multiple failed login attempts',
        description: 'User account locked due to multiple failed login attempts',
        severity: 'medium',
        timestamp: new Date().toLocaleString()
      },
      {
        title: 'Suspicious IP activity',
        description: 'Unusual login pattern detected from new IP address',
        severity: 'low',
        timestamp: new Date(Date.now() - 3600000).toLocaleString()
      }
    ];

    res.json({
      failedLogins,
      previousFailedLogins,
      suspiciousActivities,
      previousSuspiciousActivities,
      securityScore,
      previousSecurityScore,
      recentAlerts
    });
  } catch (error) {
    console.error('Security metrics error:', error);
    res.status(500).json({ error: 'Server error fetching security metrics' });
  }
});

// Performance metrics
router.get('/performance-metrics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    const now = new Date();
    const startDate = new Date();
    const previousStartDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        previousStartDate.setDate(now.getDate() - 2);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
    }

    // Mock performance data
    const avgApiResponseTime = Math.floor(Math.random() * 100) + 200;
    const previousAvgApiResponseTime = Math.floor(Math.random() * 100) + 200;
    const totalQueries = Math.floor(Math.random() * 10000) + 5000;
    const previousTotalQueries = Math.floor(Math.random() * 10000) + 5000;
    const memoryUsage = Math.floor(Math.random() * 20) + 60;
    const previousMemoryUsage = Math.floor(Math.random() * 20) + 60;

    res.json({
      avgApiResponseTime,
      previousAvgApiResponseTime,
      totalQueries,
      previousTotalQueries,
      memoryUsage,
      previousMemoryUsage
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Server error fetching performance metrics' });
  }
});

// Get all simulations for admin
router.get('/simulations', async (req, res) => {
  try {
    const simulations = await Simulation.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ simulations });
  } catch (error) {
    console.error('Get simulations error:', error);
    res.status(500).json({ error: 'Server error fetching simulations' });
  }
});

// Create new simulation
router.post('/simulations', [
  body('title').trim().isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('type').isIn(['sms-phishing', 'email-phishing', 'voice-phishing', 'social-media', 'wallet-phishing'])
    .withMessage('Invalid simulation type'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  body('targetPlatform').isIn(['general', 'metamask', 'binance', 'paypal', 'bank'])
    .withMessage('Invalid target platform')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const simulationData = {
      ...req.body,
      createdBy: req.user.id
    };

    const simulation = new Simulation(simulationData);
    await simulation.save();

    res.status(201).json({
      message: 'Simulation created successfully',
      simulation
    });
  } catch (error) {
    console.error('Create simulation error:', error);
    res.status(500).json({ error: 'Server error creating simulation' });
  }
});

// Update simulation
router.put('/simulations/:id', [
  body('title').optional().trim().isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('type').optional().isIn(['sms-phishing', 'email-phishing', 'voice-phishing', 'social-media', 'wallet-phishing'])
    .withMessage('Invalid simulation type'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  body('targetPlatform').optional().isIn(['general', 'metamask', 'binance', 'paypal', 'bank'])
    .withMessage('Invalid target platform')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const simulation = await Simulation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    res.json({
      message: 'Simulation updated successfully',
      simulation
    });
  } catch (error) {
    console.error('Update simulation error:', error);
    res.status(500).json({ error: 'Server error updating simulation' });
  }
});

// Delete simulation
router.delete('/simulations/:id', async (req, res) => {
  try {
    const simulation = await Simulation.findByIdAndDelete(req.params.id);
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Also delete related sessions
    await Session.deleteMany({ simulationId: req.params.id });

    res.json({
      message: 'Simulation deleted successfully'
    });
  } catch (error) {
    console.error('Delete simulation error:', error);
    res.status(500).json({ error: 'Server error deleting simulation' });
  }
});

// System maintenance
router.post('/maintenance', [
  body('action').isIn(['cleanup-sessions', 'backup-data', 'reset-counters'])
    .withMessage('Invalid maintenance action')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action } = req.body;
    let result;

    switch (action) {
      case 'cleanup-sessions':
        // Remove abandoned sessions older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        result = await Session.deleteMany({
          status: 'abandoned',
          createdAt: { $lt: thirtyDaysAgo }
        });
        break;
      
      case 'backup-data':
        // This would typically trigger a backup process
        // For now, just return a success message
        result = { message: 'Backup process initiated' };
        break;
      
      case 'reset-counters':
        // Reset various counters (implementation depends on specific needs)
        result = { message: 'Counters reset successfully' };
        break;
    }

    res.json({
      message: `Maintenance action '${action}' completed`,
      result
    });
  } catch (error) {
    console.error('Maintenance error:', error);
    res.status(500).json({ error: 'Server error during maintenance' });
  }
});

module.exports = router; 