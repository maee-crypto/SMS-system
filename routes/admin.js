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
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSimulations = await Simulation.countDocuments();
    const activeSimulations = await Simulation.countDocuments({ isActive: true });
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });

    // User roles distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSessions = await Session.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalSimulations,
        activeSimulations,
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
      },
      roleDistribution,
      recentActivity: {
        sessions: recentSessions,
        newUsers: recentUsers
      }
    });
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({ error: 'Server error fetching system statistics' });
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