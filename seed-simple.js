const mongoose = require('mongoose');
const Simulation = require('./models/Simulation');
const FakeWebsite = require('./models/FakeWebsite');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phishing-simulation');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    let adminUser = await User.findOne({ email: 'admin@phishing-simulation.com' });
    
    if (!adminUser) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      adminUser = new User({
        username: 'admin',
        email: 'admin@phishing-simulation.com',
        password: hashedPassword,
        role: 'admin',
        organization: 'Security Education Team',
        isActive: true
      });
      await adminUser.save();
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Check if simulation already exists
    let simulation = await Simulation.findOne({ title: "MetaMask Wallet Security Alert" });
    
    if (!simulation) {
      // Create sample simulation with minimal data
      simulation = new Simulation({
        title: "MetaMask Wallet Security Alert",
        description: "Simulates a sophisticated phishing attack targeting MetaMask users",
        type: "sms-website-call",
        difficulty: "intermediate",
        targetPlatform: "metamask",
        scenario: {
          smsMessage: "🚨 ALERT: Suspicious login detected on your MetaMask wallet. Secure your account now: [link] or call 1-800-METAMASK immediately.",
          phoneNumber: "1-800-METAMASK",
          websiteUrl: "/simulation/metamask-security",
          fakeWebsite: {
            template: "metamask-clone"
          },
          socialEngineering: {
            urgencyLevel: "critical",
            psychologicalTriggers: ["fear", "urgency", "authority"],
            pressureTactics: ["Time-limited verification", "Account suspension threat"],
            trustBuildingElements: ["Official branding", "Security badges"]
          }
        },
        educationalContent: {
          learningObjectives: ["Recognize urgency-based phishing", "Never share seed phrases"],
          redFlags: ["Urgent security alerts", "Requests for seed phrase"],
          preventionTips: ["Verify official channels", "Use hardware wallets"],
          realWorldExamples: ["MetaMask users lost $170M in 2021"],
          debriefingQuestions: ["What made this attack convincing?"],
          resources: []
        },
        createdBy: adminUser._id,
        tags: ["metamask", "wallet", "sms", "urgent"]
      });
      await simulation.save();
      console.log('Sample simulation created');
    } else {
      console.log('Sample simulation already exists');
    }

    // Check if fake website template already exists
    let fakeWebsite = await FakeWebsite.findOne({ name: "MetaMask Security Update" });
    
    if (!fakeWebsite) {
      // Create fake website template
      fakeWebsite = new FakeWebsite({
        name: "MetaMask Security Update",
        platform: "metamask",
        template: "metamask-clone",
        description: "Realistic MetaMask clone for wallet security simulation",
        htmlTemplate: `
          <div class="metamask-container">
            <div class="header">
              <h1>MetaMask Security Update</h1>
              <div class="security-badge">🔒 Secure</div>
            </div>
            <div class="alert">
              <h2>⚠️ Security Alert</h2>
              <p>We detected suspicious activity on your wallet. Please verify your seed phrase immediately.</p>
              <div class="timer">Time remaining: <span id="timer">05:00</span></div>
            </div>
            <form id="seedForm">
              <h3>Enter your 12-word seed phrase:</h3>
              {{FORM_FIELDS}}
              <button type="submit">Verify Wallet</button>
            </form>
            <div class="footer">
              <p>Need help? Call: {{phoneNumber}}</p>
            </div>
          </div>
        `,
        cssTemplate: `
          body { font-family: Arial, sans-serif; background: #f0f0f0; margin: 0; padding: 20px; }
          .metamask-container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
          .security-badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center; }
          .timer { background: #dc3545; color: white; padding: 10px; border-radius: 5px; font-weight: bold; margin-top: 15px; }
          .form-group { margin-bottom: 15px; }
          .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .form-control { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px; font-size: 14px; }
          button { background: #007bff; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-size: 16px; cursor: pointer; width: 100%; }
          button:hover { background: #0056b3; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        `,
        jsTemplate: `
          let timeLeft = 300;
          function updateTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timer').textContent = \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
            if (timeLeft <= 0) {
              alert('Time expired! Your wallet has been locked.');
              window.close();
              return;
            }
            timeLeft--;
            setTimeout(updateTimer, 1000);
          }
          document.addEventListener('DOMContentLoaded', function() {
            updateTimer();
            document.getElementById('seedForm').addEventListener('submit', function(e) {
              e.preventDefault();
              alert('Verification successful! Your wallet is now secure.');
              window.close();
            });
          });
        `,
        formFields: [
          { name: 'word1', type: 'text', placeholder: 'Word 1', required: true, order: 1 },
          { name: 'word2', type: 'text', placeholder: 'Word 2', required: true, order: 2 },
          { name: 'word3', type: 'text', placeholder: 'Word 3', required: true, order: 3 },
          { name: 'word4', type: 'text', placeholder: 'Word 4', required: true, order: 4 },
          { name: 'word5', type: 'text', placeholder: 'Word 5', required: true, order: 5 },
          { name: 'word6', type: 'text', placeholder: 'Word 6', required: true, order: 6 },
          { name: 'word7', type: 'text', placeholder: 'Word 7', required: true, order: 7 },
          { name: 'word8', type: 'text', placeholder: 'Word 8', required: true, order: 8 },
          { name: 'word9', type: 'text', placeholder: 'Word 9', required: true, order: 9 },
          { name: 'word10', type: 'text', placeholder: 'Word 10', required: true, order: 10 },
          { name: 'word11', type: 'text', placeholder: 'Word 11', required: true, order: 11 },
          { name: 'word12', type: 'text', placeholder: 'Word 12', required: true, order: 12 }
        ],
        createdBy: adminUser._id,
        tags: ['metamask', 'wallet', 'crypto', 'security']
      });
      await fakeWebsite.save();
      console.log('Fake website template created');
    } else {
      console.log('Fake website template already exists');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@phishing-simulation.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 