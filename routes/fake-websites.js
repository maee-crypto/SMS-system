const express = require('express');
const { body, validationResult } = require('express-validator');
const FakeWebsite = require('../models/FakeWebsite');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all fake website templates
router.get('/', async (req, res) => {
  try {
    const { platform, template, limit = 20, page = 1 } = req.query;
    
    const filter = { isActive: true };
    if (platform) filter.platform = platform;
    if (template) filter.template = template;

    const fakeWebsites = await FakeWebsite.find(filter)
      .populate('createdBy', 'username organization')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FakeWebsite.countDocuments(filter);

    res.json({
      fakeWebsites,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get fake websites error:', error);
    res.status(500).json({ error: 'Server error fetching fake websites' });
  }
});

// Get fake website by ID
router.get('/:id', async (req, res) => {
  try {
    const fakeWebsite = await FakeWebsite.findById(req.params.id)
      .populate('createdBy', 'username organization');
    
    if (!fakeWebsite) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    if (!fakeWebsite.isActive) {
      return res.status(404).json({ error: 'Fake website template is not active' });
    }

    res.json({ fakeWebsite });
  } catch (error) {
    console.error('Get fake website error:', error);
    res.status(500).json({ error: 'Server error fetching fake website' });
  }
});

// Create new fake website template (admin/instructor only)
router.post('/', auth, authorize('instructor', 'admin'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('platform').isIn(['metamask', 'binance', 'trust-wallet', 'coinbase', 'paypal', 'bank', 'generic'])
    .withMessage('Invalid platform'),
  body('template').isIn(['metamask-clone', 'binance-clone', 'trust-wallet-clone', 'bank-clone', 'generic'])
    .withMessage('Invalid template type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('htmlTemplate').notEmpty().withMessage('HTML template is required'),
  body('cssTemplate').notEmpty().withMessage('CSS template is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fakeWebsite = new FakeWebsite({
      ...req.body,
      createdBy: req.user.userId
    });

    await fakeWebsite.save();
    await fakeWebsite.populate('createdBy', 'username organization');

    res.status(201).json({
      message: 'Fake website template created successfully',
      fakeWebsite
    });
  } catch (error) {
    console.error('Create fake website error:', error);
    res.status(500).json({ error: 'Server error creating fake website template' });
  }
});

// Update fake website template (admin/instructor only)
router.put('/:id', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const fakeWebsite = await FakeWebsite.findById(req.params.id);
    if (!fakeWebsite) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    Object.assign(fakeWebsite, req.body, { updatedAt: new Date() });
    await fakeWebsite.save();

    res.json({
      message: 'Fake website template updated successfully',
      fakeWebsite
    });
  } catch (error) {
    console.error('Update fake website error:', error);
    res.status(500).json({ error: 'Server error updating fake website template' });
  }
});

// Delete fake website template (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const fakeWebsite = await FakeWebsite.findById(req.params.id);
    if (!fakeWebsite) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    await fakeWebsite.remove();
    res.json({ message: 'Fake website template deleted successfully' });
  } catch (error) {
    console.error('Delete fake website error:', error);
    res.status(500).json({ error: 'Server error deleting fake website template' });
  }
});

// Preview fake website template
router.get('/:id/preview', auth, async (req, res) => {
  try {
    const fakeWebsite = await FakeWebsite.findById(req.params.id);
    if (!fakeWebsite || !fakeWebsite.isActive) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    const customData = {
      title: req.query.title || fakeWebsite.name,
      phoneNumber: req.query.phoneNumber || '1-800-SUPPORT',
      urgencyMessage: req.query.urgencyMessage || 'Your account has been compromised!',
      ...req.query
    };

    const completeHtml = fakeWebsite.generateCompleteHtml(customData);

    res.set('Content-Type', 'text/html');
    res.send(completeHtml);
  } catch (error) {
    console.error('Preview fake website error:', error);
    res.status(500).json({ error: 'Server error generating preview' });
  }
});

// Validate form data against template
router.post('/:id/validate', auth, async (req, res) => {
  try {
    const { formData } = req.body;
    
    const fakeWebsite = await FakeWebsite.findById(req.params.id);
    if (!fakeWebsite || !fakeWebsite.isActive) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    const validation = fakeWebsite.validateFormData(formData);

    res.json({
      isValid: validation.isValid,
      errors: validation.errors
    });
  } catch (error) {
    console.error('Validate form data error:', error);
    res.status(500).json({ error: 'Server error validating form data' });
  }
});

// Get templates by platform
router.get('/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { template } = req.query;

    const filter = { platform, isActive: true };
    if (template) filter.template = template;

    const fakeWebsites = await FakeWebsite.find(filter)
      .populate('createdBy', 'username organization')
      .sort({ createdAt: -1 });

    res.json({ fakeWebsites });
  } catch (error) {
    console.error('Get templates by platform error:', error);
    res.status(500).json({ error: 'Server error fetching templates by platform' });
  }
});

// Clone fake website template
router.post('/:id/clone', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const original = await FakeWebsite.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    const cloned = new FakeWebsite({
      ...original.toObject(),
      _id: undefined,
      name: `${original.name} (Copy)`,
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await cloned.save();
    await cloned.populate('createdBy', 'username organization');

    res.status(201).json({
      message: 'Fake website template cloned successfully',
      fakeWebsite: cloned
    });
  } catch (error) {
    console.error('Clone fake website error:', error);
    res.status(500).json({ error: 'Server error cloning fake website template' });
  }
});

// Export template as JSON
router.get('/:id/export', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const fakeWebsite = await FakeWebsite.findById(req.params.id);
    if (!fakeWebsite) {
      return res.status(404).json({ error: 'Fake website template not found' });
    }

    const exportData = {
      name: fakeWebsite.name,
      platform: fakeWebsite.platform,
      template: fakeWebsite.template,
      description: fakeWebsite.description,
      htmlTemplate: fakeWebsite.htmlTemplate,
      cssTemplate: fakeWebsite.cssTemplate,
      jsTemplate: fakeWebsite.jsTemplate,
      formFields: fakeWebsite.formFields,
      assets: fakeWebsite.assets,
      branding: fakeWebsite.branding,
      functionality: fakeWebsite.functionality,
      securityFeatures: fakeWebsite.securityFeatures,
      version: fakeWebsite.version,
      tags: fakeWebsite.tags
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fakeWebsite.name}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export fake website error:', error);
    res.status(500).json({ error: 'Server error exporting fake website template' });
  }
});

// Import template from JSON
router.post('/import', auth, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const importData = req.body;
    
    // Validate required fields
    if (!importData.name || !importData.platform || !importData.template || 
        !importData.htmlTemplate || !importData.cssTemplate) {
      return res.status(400).json({ error: 'Missing required fields for import' });
    }

    const fakeWebsite = new FakeWebsite({
      ...importData,
      createdBy: req.user.userId,
      isActive: true
    });

    await fakeWebsite.save();
    await fakeWebsite.populate('createdBy', 'username organization');

    res.status(201).json({
      message: 'Fake website template imported successfully',
      fakeWebsite
    });
  } catch (error) {
    console.error('Import fake website error:', error);
    res.status(500).json({ error: 'Server error importing fake website template' });
  }
});

module.exports = router; 