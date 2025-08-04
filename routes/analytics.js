const express = require('express');
const Session = require('../models/Session');
const Simulation = require('../models/Simulation');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get overall platform analytics (admin/instructor only)
router.get('/overview', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total sessions
    const totalSessions = await Session.countDocuments(dateFilter);
    
    // Completed sessions
    const completedSessions = await Session.countDocuments({
      ...dateFilter,
      status: 'completed'
    });

    // Users who fell for phishing
    const phishingVictims = await Session.countDocuments({
      ...dateFilter,
      status: 'completed',
      'outcome.fellForPhish': true
    });

    // Average score
    const avgScoreResult = await Session.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$outcome.score' } } }
    ]);
    const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    // Most common simulation types
    const simulationTypes = await Session.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $lookup: { from: 'simulations', localField: 'simulationId', foreignField: '_id', as: 'simulation' } },
      { $unwind: '$simulation' },
      { $group: { _id: '$simulation.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Device types
    const deviceTypes = await Session.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: { _id: '$metadata.deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Time-based trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats = await Session.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { 
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sessions: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        victims: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'completed'] }, { $eq: ['$outcome.fellForPhish', true] }] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        phishingVictims,
        victimRate: completedSessions > 0 ? Math.round((phishingVictims / completedSessions) * 100) : 0,
        averageScore: avgScore
      },
      simulationTypes,
      deviceTypes,
      dailyStats
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Server error fetching analytics overview' });
  }
});

// Get simulation-specific analytics
router.get('/simulation/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const simulation = await Simulation.findById(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const sessions = await Session.find({ simulationId: req.params.id })
      .populate('userId', 'username email organization');

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const phishingVictims = sessions.filter(s => s.outcome?.fellForPhish).length;

    // Score distribution
    const scoreDistribution = {
      excellent: sessions.filter(s => s.outcome?.score >= 90).length,
      good: sessions.filter(s => s.outcome?.score >= 70 && s.outcome?.score < 90).length,
      fair: sessions.filter(s => s.outcome?.score >= 50 && s.outcome?.score < 70).length,
      poor: sessions.filter(s => s.outcome?.score < 50).length
    };

    // Average completion time
    const completionTimes = sessions
      .filter(s => s.duration)
      .map(s => s.duration);
    const avgCompletionTime = completionTimes.length > 0 
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;

    // Most common red flags identified
    const redFlags = {};
    sessions.forEach(session => {
      if (session.outcome?.redFlagsIdentified) {
        session.outcome.redFlagsIdentified.forEach(flag => {
          redFlags[flag] = (redFlags[flag] || 0) + 1;
        });
      }
    });

    // Interaction patterns
    const interactionPatterns = {};
    sessions.forEach(session => {
      session.interactions.forEach(interaction => {
        const key = `${interaction.type}-${interaction.userResponse || 'none'}`;
        interactionPatterns[key] = (interactionPatterns[key] || 0) + 1;
      });
    });

    res.json({
      simulation: {
        id: simulation._id,
        title: simulation.title,
        type: simulation.type,
        targetPlatform: simulation.targetPlatform
      },
      stats: {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        phishingVictims,
        victimRate: completedSessions > 0 ? Math.round((phishingVictims / completedSessions) * 100) : 0,
        avgCompletionTime,
        scoreDistribution
      },
      redFlags,
      interactionPatterns,
      recentSessions: sessions.slice(0, 10) // Last 10 sessions
    });
  } catch (error) {
    console.error('Simulation analytics error:', error);
    res.status(500).json({ error: 'Server error fetching simulation analytics' });
  }
});

// Get user performance analytics
router.get('/user/:userId', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sessions = await Session.find({ userId: req.params.userId })
      .populate('simulationId', 'title type targetPlatform difficulty');

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const phishingVictims = sessions.filter(s => s.outcome?.fellForPhish).length;

    // Performance by simulation type
    const performanceByType = {};
    sessions.forEach(session => {
      if (session.simulationId && session.outcome) {
        const type = session.simulationId.type;
        if (!performanceByType[type]) {
          performanceByType[type] = { total: 0, victims: 0, avgScore: 0, scores: [] };
        }
        performanceByType[type].total++;
        if (session.outcome.fellForPhish) {
          performanceByType[type].victims++;
        }
        performanceByType[type].scores.push(session.outcome.score);
      }
    });

    // Calculate average scores
    Object.keys(performanceByType).forEach(type => {
      const scores = performanceByType[type].scores;
      performanceByType[type].avgScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      delete performanceByType[type].scores;
    });

    // Learning progress over time
    const progressData = sessions
      .filter(s => s.outcome)
      .sort((a, b) => a.startTime - b.startTime)
      .map((session, index) => ({
        sessionNumber: index + 1,
        score: session.outcome.score,
        fellForPhish: session.outcome.fellForPhish,
        date: session.startTime,
        simulation: session.simulationId?.title
      }));

    // Most common mistakes
    const mistakes = {};
    sessions.forEach(session => {
      if (session.outcome?.redFlagsIdentified) {
        session.outcome.redFlagsIdentified.forEach(flag => {
          mistakes[flag] = (mistakes[flag] || 0) + 1;
        });
      }
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        organization: user.organization,
        role: user.role
      },
      stats: {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        phishingVictims,
        victimRate: completedSessions > 0 ? Math.round((phishingVictims / completedSessions) * 100) : 0
      },
      performanceByType,
      progressData,
      mistakes,
      recentSessions: sessions.slice(-5) // Last 5 sessions
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Server error fetching user analytics' });
  }
});

// Get personal analytics (for students)
router.get('/personal', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.userId })
      .populate('simulationId', 'title type targetPlatform difficulty');

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const phishingVictims = sessions.filter(s => s.outcome?.fellForPhish).length;

    // Overall performance
    const scores = sessions
      .filter(s => s.outcome?.score)
      .map(s => s.outcome.score);
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Performance by difficulty
    const difficultyStats = {};
    sessions.forEach(session => {
      if (session.simulationId && session.outcome) {
        const difficulty = session.simulationId.difficulty;
        if (!difficultyStats[difficulty]) {
          difficultyStats[difficulty] = { total: 0, victims: 0, avgScore: 0, scores: [] };
        }
        difficultyStats[difficulty].total++;
        if (session.outcome.fellForPhish) {
          difficultyStats[difficulty].victims++;
        }
        difficultyStats[difficulty].scores.push(session.outcome.score);
      }
    });

    // Calculate averages
    Object.keys(difficultyStats).forEach(difficulty => {
      const scores = difficultyStats[difficulty].scores;
      difficultyStats[difficulty].avgScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      delete difficultyStats[difficulty].scores;
    });

    // Recent performance trend
    const recentSessions = sessions
      .filter(s => s.outcome)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 10)
      .map(session => ({
        date: session.startTime,
        score: session.outcome.score,
        fellForPhish: session.outcome.fellForPhish,
        simulation: session.simulationId?.title,
        type: session.simulationId?.type
      }));

    // Areas for improvement
    const improvementAreas = [];
    if (phishingVictims > 0) {
      improvementAreas.push('Recognizing phishing attempts');
    }
    if (avgScore < 70) {
      improvementAreas.push('Overall security awareness');
    }
    if (sessions.filter(s => s.analytics?.timeToFirstInteraction > 300).length > 0) {
      improvementAreas.push('Response time to suspicious activities');
    }

    res.json({
      stats: {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        phishingVictims,
        victimRate: completedSessions > 0 ? Math.round((phishingVictims / completedSessions) * 100) : 0,
        averageScore: avgScore
      },
      difficultyStats,
      recentSessions,
      improvementAreas
    });
  } catch (error) {
    console.error('Personal analytics error:', error);
    res.status(500).json({ error: 'Server error fetching personal analytics' });
  }
});

// Export analytics data (admin only)
router.get('/export', auth, authorize('admin'), async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const sessions = await Session.find(dateFilter)
      .populate('userId', 'username email organization')
      .populate('simulationId', 'title type targetPlatform difficulty');

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = sessions.map(session => ({
        sessionId: session._id,
        userId: session.userId?.username || 'Unknown',
        userEmail: session.userId?.email || 'Unknown',
        organization: session.userId?.organization || 'Unknown',
        simulationTitle: session.simulationId?.title || 'Unknown',
        simulationType: session.simulationId?.type || 'Unknown',
        targetPlatform: session.simulationId?.targetPlatform || 'Unknown',
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        fellForPhish: session.outcome?.fellForPhish || false,
        score: session.outcome?.score || 0,
        redFlagsIdentified: session.outcome?.redFlagsIdentified?.join(';') || '',
        totalInteractions: session.analytics?.totalInteractions || 0,
        timeToFirstInteraction: session.analytics?.timeToFirstInteraction || 0
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');
      
      res.send(csvString);
    } else {
      res.json({ sessions });
    }
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ error: 'Server error exporting analytics' });
  }
});

module.exports = router; 