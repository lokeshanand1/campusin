const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campuscareer')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const Lead = require('./models/Lead');
const Subscriber = require('./models/Subscriber');

// Validation middleware
const leadValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('college').optional().trim(),
  body('degreeYear').optional().trim(),
  body('preferredService').trim().notEmpty().withMessage('Please select a service'),
  body('preferredTimeline').optional().trim()
];

const subscriberValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

// Routes

// Submit lead form
app.post('/api/leads', leadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(e => e.msg) 
      });
    }

    const lead = new Lead({
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone || '',
      college: req.body.college || '',
      degreeYear: req.body.degreeYear || '',
      preferredService: req.body.preferredService,
      preferredTimeline: req.body.preferredTimeline || '',
      message: req.body.message || '',
      utmSource: req.body.utmSource || '',
      utmMedium: req.body.utmMedium || '',
      utmCampaign: req.body.utmCampaign || '',
      submittedAt: new Date()
    });

    await lead.save();
    
    res.json({ 
      success: true, 
      message: 'Lead submitted successfully',
      leadId: lead._id
    });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit lead. Please try again.' 
    });
  }
});

// Newsletter subscription
app.post('/api/subscribe', subscriberValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(e => e.msg) 
      });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: req.body.email });
    if (existing) {
      return res.json({ 
        success: true, 
        message: 'You are already subscribed!' 
      });
    }

    const subscriber = new Subscriber({
      email: req.body.email,
      subscribedAt: new Date(),
      active: true
    });

    await subscriber.save();
    
    res.json({ 
      success: true, 
      message: 'Subscribed successfully! Check your inbox for our next newsletter.'
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe. Please try again.' 
    });
  }
});

// Get all leads (admin endpoint)
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ submittedAt: -1 });
    res.json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
});

// Get all subscribers (admin endpoint)
app.get('/api/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ active: true }).sort({ subscribedAt: -1 });
    res.json({ success: true, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscribers' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Udyam Certificate — force download route
app.get('/download/udyam', (req, res) => {
  const path = require('path');
  const filePath = path.join(__dirname, 'udyam.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Udyam-Certificate-CampusCareersIndia.pdf"');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending Udyam certificate:', err);
      res.status(404).json({ success: false, message: 'File not found' });
    }
  });
});

// Sitemap with correct content-type
app.get('/sitemap.xml', (req, res) => {
  const path = require('path');
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

