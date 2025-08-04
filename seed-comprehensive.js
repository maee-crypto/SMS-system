const mongoose = require('mongoose');
const Simulation = require('./models/Simulation');
const FakeWebsite = require('./models/FakeWebsite');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedComprehensiveDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phishing-simulation');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Simulation.deleteMany({});
    await FakeWebsite.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@phishing-simulation.com',
      password: hashedPassword,
      role: 'admin',
      organization: 'Security Education Team',
      isActive: true
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@phishing-simulation.com',
      password: hashedPassword,
      role: 'user',
      organization: 'Test Organization',
      isActive: true
    });
    await testUser.save();
    console.log('Test user created');

    // Create instructor user
    const instructorUser = new User({
      username: 'instructor',
      email: 'instructor@phishing-simulation.com',
      password: hashedPassword,
      role: 'instructor',
      organization: 'Security Training Institute',
      isActive: true
    });
    await instructorUser.save();
    console.log('Instructor user created');

    // Create MetaMask fake website
    const metamaskFakeWebsite = new FakeWebsite({
      name: "MetaMask Security Update",
      platform: "metamask",
      template: "metamask-clone",
      description: "Realistic MetaMask clone for wallet security simulation",
      htmlTemplate: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MetaMask Security Update</title>
          <style>{{CSS_TEMPLATE}}</style>
        </head>
        <body>
          <div class="metamask-container">
            <div class="metamask-header">
              <div class="logo">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxLjQ5IDQuMjJMMTMuNSAxMi4yMUwyMS40OSAyMC4yQzIyLjI1IDE5LjQ0IDIyLjI1IDE4LjE3IDIyLjI1IDE2Ljg5VjcuMTFDMjIuMjUgNS44MyAyMi4yNSA0LjU2IDIxLjQ5IDQuMjJaIiBmaWxsPSIjRkY5ODAwIi8+CjxwYXRoIGQ9Ik0yLjUxIDQuMjJMMTAuNSAxMi4yMUwyLjUxIDIwLjJDMi4yNSAxOS40NCAyLjI1IDE4LjE3IDIuMjUgMTYuODlWNy4xMUMyLjI1IDUuODMgMi4yNSA0LjU2IDIuNTEgNC4yMloiIGZpbGw9IiNGRjk4MDAiLz4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRjk4MDAiLz4KPC9zdmc+" alt="MetaMask" />
                <span>MetaMask</span>
              </div>
              <div class="security-badge">
                <span class="security-icon">🔒</span>
                <span>Secure</span>
              </div>
            </div>
            
            <div class="main-content">
              <div class="security-alert">
                <div class="alert-icon">⚠️</div>
                <h2>Security Update Required</h2>
                <p class="alert-message">
                  We detected suspicious activity on your wallet. To protect your assets, 
                  please verify your seed phrase immediately.
                </p>
                <div class="urgency-timer">
                  <span>Time remaining: <span id="timer">05:00</span></span>
                </div>
              </div>
              
              <div class="verification-form">
                <h3>Wallet Verification</h3>
                <p>Please enter your 12-word seed phrase to verify your wallet ownership:</p>
                
                <form id="seedPhraseForm">
                  <div class="seed-phrase-inputs">
                    {{FORM_FIELDS}}
                  </div>
                  
                  <div class="form-actions">
                    <button type="submit" class="verify-btn">
                      <span class="btn-icon">🔐</span>
                      Verify Wallet
                    </button>
                    <button type="button" class="cancel-btn" onclick="window.close()">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
              
              <div class="security-notice">
                <p><strong>Important:</strong> This verification is required to prevent unauthorized access to your wallet.</p>
                <p>If you don't complete this verification within the time limit, your wallet may be temporarily locked for security.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>MetaMask Security Team</p>
              <p>Need help? Call: {{phoneNumber}}</p>
            </div>
          </div>
          <script>{{JS_TEMPLATE}}</script>
        </body>
        </html>
      `,
      cssTemplate: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .metamask-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 500px;
          width: 100%;
          overflow: hidden;
        }
        
        .metamask-header {
          background: #f8f9fa;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e9ecef;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 18px;
          color: #333;
        }
        
        .logo img {
          width: 32px;
          height: 32px;
        }
        
        .security-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #d4edda;
          color: #155724;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .main-content {
          padding: 30px;
        }
        
        .security-alert {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .alert-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .security-alert h2 {
          color: #856404;
          margin-bottom: 10px;
          font-size: 24px;
        }
        
        .alert-message {
          color: #856404;
          line-height: 1.6;
          margin-bottom: 15px;
        }
        
        .urgency-timer {
          background: #dc3545;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
        }
        
        .verification-form {
          margin-bottom: 30px;
        }
        
        .verification-form h3 {
          color: #333;
          margin-bottom: 10px;
          font-size: 20px;
        }
        
        .verification-form p {
          color: #666;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .seed-phrase-inputs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 25px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-control {
          padding: 10px 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .form-actions {
          display: flex;
          gap: 15px;
        }
        
        .verify-btn {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s;
        }
        
        .verify-btn:hover {
          transform: translateY(-2px);
        }
        
        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 15px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .cancel-btn:hover {
          background: #5a6268;
        }
        
        .security-notice {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .security-notice p {
          color: #495057;
          margin-bottom: 10px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .security-notice p:last-child {
          margin-bottom: 0;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e9ecef;
        }
        
        .footer p {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .footer p:last-child {
          margin-bottom: 0;
        }
      `,
      jsTemplate: `
        // Countdown timer
        let timeLeft = 300; // 5 minutes in seconds
        
        function updateTimer() {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          document.getElementById('timer').textContent = 
            \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
          
          if (timeLeft <= 0) {
            alert('Time expired! Your wallet has been locked for security.');
            window.close();
            return;
          }
          
          timeLeft--;
          setTimeout(updateTimer, 1000);
        }
        
        // Start timer when page loads
        document.addEventListener('DOMContentLoaded', function() {
          updateTimer();
          
          // Form submission
          document.getElementById('seedPhraseForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const seedPhrase = [];
            
            for (let i = 1; i <= 12; i++) {
              const word = formData.get(\`word\${i}\`) || '';
              if (word.trim()) {
                seedPhrase.push(word.trim());
              }
            }
            
            if (seedPhrase.length !== 12) {
              alert('Please enter all 12 words of your seed phrase.');
              return;
            }
            
            // Show loading state
            const submitBtn = document.querySelector('.verify-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Verifying...';
            submitBtn.disabled = true;
            
            // Simulate verification process
            setTimeout(() => {
              // Send data to server
              fetch('/api/simulations/metamask/fake-website/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sessionId: localStorage.getItem('sessionId'),
                  formData: { seedPhrase }
                })
              }).then(response => response.json())
              .then(data => {
                alert('Verification successful! Your wallet is now secure.');
                window.close();
              }).catch(error => {
                alert('Verification successful! Your wallet is now secure.');
                window.close();
              });
            }, 2000);
          });
          
          // Auto-focus first input
          document.getElementById('word1').focus();
          
          // Auto-tab to next input
          for (let i = 1; i <= 12; i++) {
            const input = document.getElementById(\`word\${i}\`);
            input.addEventListener('input', function() {
              if (this.value.length >= 3 && i < 12) {
                document.getElementById(\`word\${i + 1}\`).focus();
              }
            });
          }
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
    await metamaskFakeWebsite.save();
    console.log('MetaMask fake website created');

    // Create Bank fake website
    const bankFakeWebsite = new FakeWebsite({
      name: "Bank Security Verification",
      platform: "bank",
      template: "bank-clone",
      description: "Realistic bank login clone for security simulation",
      htmlTemplate: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Secure Banking - Login</title>
          <style>{{CSS_TEMPLATE}}</style>
        </head>
        <body>
          <div class="bank-container">
            <div class="bank-header">
              <div class="logo">
                <span class="bank-icon">🏦</span>
                <span>SecureBank</span>
              </div>
              <div class="security-badge">
                <span class="security-icon">🔒</span>
                <span>SSL Secure</span>
              </div>
            </div>
            
            <div class="main-content">
              <div class="security-alert">
                <div class="alert-icon">⚠️</div>
                <h2>Account Security Alert</h2>
                <p class="alert-message">
                  We detected unusual login activity on your account. Please verify your identity immediately.
                </p>
              </div>
              
              <div class="login-form">
                <h3>Account Verification</h3>
                <p>Please enter your credentials to verify your identity:</p>
                
                <form id="loginForm">
                  <div class="form-group">
                    <label for="accountNumber">Account Number</label>
                    <input type="text" id="accountNumber" name="accountNumber" class="form-control" placeholder="Enter your account number" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="ssn">Social Security Number</label>
                    <input type="text" id="ssn" name="ssn" class="form-control" placeholder="XXX-XX-XXXX" required>
                  </div>
                  
                  <div class="form-group">
                    <label for="password">Online Banking Password</label>
                    <input type="password" id="password" name="password" class="form-control" placeholder="Enter your password" required>
                  </div>
                  
                  <div class="form-actions">
                    <button type="submit" class="verify-btn">
                      <span class="btn-icon">🔐</span>
                      Verify Account
                    </button>
                    <button type="button" class="cancel-btn" onclick="window.close()">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
              
              <div class="security-notice">
                <p><strong>Important:</strong> This verification is required to protect your account from unauthorized access.</p>
                <p>If you don't complete this verification, your account may be temporarily locked.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>SecureBank Security Team</p>
              <p>Need help? Call: {{phoneNumber}}</p>
            </div>
          </div>
          <script>{{JS_TEMPLATE}}</script>
        </body>
        </html>
      `,
      cssTemplate: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .bank-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 500px;
          width: 100%;
          overflow: hidden;
        }
        
        .bank-header {
          background: #2c3e50;
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 18px;
        }
        
        .bank-icon {
          font-size: 24px;
        }
        
        .security-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #27ae60;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .main-content {
          padding: 30px;
        }
        
        .security-alert {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .alert-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .security-alert h2 {
          color: #856404;
          margin-bottom: 10px;
          font-size: 24px;
        }
        
        .alert-message {
          color: #856404;
          line-height: 1.6;
          margin-bottom: 15px;
        }
        
        .login-form {
          margin-bottom: 30px;
        }
        
        .login-form h3 {
          color: #333;
          margin-bottom: 10px;
          font-size: 20px;
        }
        
        .login-form p {
          color: #666;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        
        .form-control {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }
        
        .form-control:focus {
          outline: none;
          border-color: #3498db;
        }
        
        .form-actions {
          display: flex;
          gap: 15px;
        }
        
        .verify-btn {
          flex: 1;
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          border: none;
          padding: 15px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s;
        }
        
        .verify-btn:hover {
          transform: translateY(-2px);
        }
        
        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 15px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .cancel-btn:hover {
          background: #5a6268;
        }
        
        .security-notice {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .security-notice p {
          color: #495057;
          margin-bottom: 10px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .security-notice p:last-child {
          margin-bottom: 0;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e9ecef;
        }
        
        .footer p {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .footer p:last-child {
          margin-bottom: 0;
        }
      `,
      jsTemplate: `
        document.addEventListener('DOMContentLoaded', function() {
          // Form submission
          document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
              accountNumber: formData.get('accountNumber'),
              ssn: formData.get('ssn'),
              password: formData.get('password')
            };
            
            // Show loading state
            const submitBtn = document.querySelector('.verify-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Verifying...';
            submitBtn.disabled = true;
            
            // Simulate verification process
            setTimeout(() => {
              // Send data to server
              fetch('/api/simulations/bank/fake-website/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sessionId: localStorage.getItem('sessionId'),
                  formData: data
                })
              }).then(response => response.json())
              .then(data => {
                alert('Verification successful! Your account is now secure.');
                window.close();
              }).catch(error => {
                alert('Verification successful! Your account is now secure.');
                window.close();
              });
            }, 2000);
          });
        });
      `,
      formFields: [
        { name: 'accountNumber', type: 'text', placeholder: 'Enter your account number', required: true, order: 1 },
        { name: 'ssn', type: 'text', placeholder: 'XXX-XX-XXXX', required: true, order: 2 },
        { name: 'password', type: 'password', placeholder: 'Enter your password', required: true, order: 3 }
      ],
      createdBy: adminUser._id,
      tags: ['bank', 'finance', 'security', 'login']
    });
    await bankFakeWebsite.save();
    console.log('Bank fake website created');

    // Create MetaMask simulation
    const metamaskSimulation = new Simulation({
      title: "MetaMask Wallet Security Alert",
      description: "Simulates a sophisticated phishing attack targeting MetaMask users through SMS and fake website",
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
        learningObjectives: [
          "Recognize urgency-based phishing attempts",
          "Never share seed phrases or private keys",
          "Verify official communication channels",
          "Understand wallet security best practices"
        ],
        redFlags: [
          "Urgent security alerts via SMS",
          "Requests for seed phrase or private keys",
          "Time-limited verification demands",
          "Suspicious phone numbers or links"
        ],
        preventionTips: [
          "Always verify through official MetaMask channels",
          "Use hardware wallets for additional security",
          "Never share your 12-word seed phrase",
          "Enable two-factor authentication where possible"
        ],
        realWorldExamples: [
          "MetaMask users lost over $170M in 2021 due to phishing",
          "Fake MetaMask websites are common attack vectors",
          "SMS-based wallet attacks increased 300% in 2023"
        ],
        debriefingQuestions: [
          "What made this attack convincing?",
          "How could you verify if this was legitimate?",
          "What should you do if you receive such a message?",
          "What are the red flags you noticed?"
        ],
        resources: [
          { title: "MetaMask Security Guide", url: "https://metamask.io/security/", type: "official" },
          { title: "Crypto Security Best Practices", url: "https://ethereum.org/en/security/", type: "educational" },
          { title: "Phishing Awareness Training", url: "https://www.cisa.gov/phishing-awareness", type: "government" }
        ]
      },
      simulationFlow: {
        steps: [
          {
            stepNumber: 1,
            title: "Receive SMS Alert",
            description: "User receives urgent SMS about wallet security",
            action: "Read and consider the message",
            expectedResponse: "User should be suspicious of urgent requests",
            timeLimit: 60,
            points: 10
          },
          {
            stepNumber: 2,
            title: "Click Link",
            description: "User clicks the link in the SMS",
            action: "Navigate to fake website",
            expectedResponse: "User should verify the URL before clicking",
            timeLimit: 30,
            points: -20
          },
          {
            stepNumber: 3,
            title: "View Fake Website",
            description: "User sees convincing MetaMask clone",
            action: "Examine the website carefully",
            expectedResponse: "User should notice red flags",
            timeLimit: 120,
            points: 15
          },
          {
            stepNumber: 4,
            title: "Enter Seed Phrase",
            description: "User is asked to enter 12-word seed phrase",
            action: "Provide sensitive information",
            expectedResponse: "User should NEVER share seed phrase",
            timeLimit: 300,
            points: -50
          }
        ]
      },
      createdBy: adminUser._id,
      tags: ["metamask", "wallet", "crypto", "sms", "urgent", "seed-phrase"]
    });
    await metamaskSimulation.save();
    console.log('MetaMask simulation created');

    // Create Bank simulation
    const bankSimulation = new Simulation({
      title: "Bank Account Security Verification",
      description: "Simulates a bank phishing attack through email and fake login page",
      type: "email-phishing",
      difficulty: "beginner",
      targetPlatform: "bank",
      scenario: {
        emailTemplate: {
          subject: "URGENT: Account Security Alert - Action Required",
          body: "Dear valued customer, we detected unusual activity on your account. Please verify your identity immediately to prevent account suspension.",
          sender: "security@securebank.com"
        },
        websiteUrl: "/simulation/bank-security",
        fakeWebsite: {
          template: "bank-clone"
        },
        socialEngineering: {
          urgencyLevel: "high",
          psychologicalTriggers: ["fear", "authority", "urgency"],
          pressureTactics: ["Account suspension threat", "Limited time to respond"],
          trustBuildingElements: ["Official bank branding", "SSL certificate display"]
        }
      },
      educationalContent: {
        learningObjectives: [
          "Identify email phishing attempts",
          "Verify legitimate bank communications",
          "Protect personal and financial information",
          "Understand bank security protocols"
        ],
        redFlags: [
          "Urgent requests for personal information",
          "Suspicious email addresses",
          "Requests for SSN or account numbers",
          "Threats of account suspension"
        ],
        preventionTips: [
          "Contact your bank directly using official numbers",
          "Never click links in suspicious emails",
          "Verify email addresses carefully",
          "Use official bank apps and websites"
        ],
        realWorldExamples: [
          "Bank customers lost $1.2B to phishing in 2022",
          "Fake bank websites are common attack vectors",
          "Email-based attacks target millions daily"
        ],
        debriefingQuestions: [
          "How could you verify this was from your bank?",
          "What information should you never share?",
          "What are the warning signs you noticed?",
          "What should you do if you receive such an email?"
        ],
        resources: [
          { title: "FDIC Consumer Protection", url: "https://www.fdic.gov/consumers/", type: "government" },
          { title: "Bank Security Best Practices", url: "https://www.aba.com/advocacy/consumer-protection", type: "industry" },
          { title: "Email Security Guide", url: "https://www.cisa.gov/email-security", type: "government" }
        ]
      },
      simulationFlow: {
        steps: [
          {
            stepNumber: 1,
            title: "Receive Email Alert",
            description: "User receives urgent email about account security",
            action: "Read and evaluate the email",
            expectedResponse: "User should be suspicious of urgent requests",
            timeLimit: 60,
            points: 10
          },
          {
            stepNumber: 2,
            title: "Click Email Link",
            description: "User clicks the link in the email",
            action: "Navigate to fake bank website",
            expectedResponse: "User should verify the URL before clicking",
            timeLimit: 30,
            points: -20
          },
          {
            stepNumber: 3,
            title: "View Fake Login",
            description: "User sees convincing bank login page",
            action: "Examine the website carefully",
            expectedResponse: "User should notice red flags",
            timeLimit: 120,
            points: 15
          },
          {
            stepNumber: 4,
            title: "Enter Credentials",
            description: "User is asked to enter account details",
            action: "Provide sensitive information",
            expectedResponse: "User should NEVER share credentials",
            timeLimit: 300,
            points: -50
          }
        ]
      },
      createdBy: adminUser._id,
      tags: ["bank", "email", "finance", "login", "ssn"]
    });
    await bankSimulation.save();
    console.log('Bank simulation created');

    // Create Social Media simulation
    const socialMediaSimulation = new Simulation({
      title: "Social Media Account Verification",
      description: "Simulates a social media phishing attack through direct message",
      type: "social-media",
      difficulty: "beginner",
      targetPlatform: "social-media",
      scenario: {
        socialEngineering: {
          urgencyLevel: "medium",
          psychologicalTriggers: ["curiosity", "social-proof", "fear"],
          pressureTactics: ["Account suspension threat", "Limited time offer"],
          trustBuildingElements: ["Familiar platform branding", "Official-looking messages"]
        }
      },
      educationalContent: {
        learningObjectives: [
          "Recognize social media phishing attempts",
          "Protect social media accounts",
          "Verify legitimate platform communications",
          "Understand social engineering tactics"
        ],
        redFlags: [
          "Urgent account verification requests",
          "Suspicious links in messages",
          "Requests for login credentials",
          "Threats of account suspension"
        ],
        preventionTips: [
          "Use official platform apps and websites",
          "Enable two-factor authentication",
          "Never share login credentials",
          "Report suspicious messages"
        ],
        realWorldExamples: [
          "Social media accounts are prime targets for phishing",
          "Fake verification scams are common",
          "Account takeover attacks increased 200% in 2023"
        ],
        debriefingQuestions: [
          "How can you verify if this is legitimate?",
          "What should you do with suspicious messages?",
          "How can you protect your social media accounts?",
          "What are the warning signs you noticed?"
        ],
        resources: [
          { title: "Social Media Security Guide", url: "https://www.cisa.gov/social-media-security", type: "government" },
          { title: "Platform Security Centers", url: "https://help.twitter.com/safety-and-security", type: "platform" },
          { title: "Two-Factor Authentication Guide", url: "https://www.cisa.gov/two-factor-authentication", type: "government" }
        ]
      },
      createdBy: adminUser._id,
      tags: ["social-media", "verification", "account-security", "direct-message"]
    });
    await socialMediaSimulation.save();
    console.log('Social media simulation created');

    console.log('\n✅ Comprehensive database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@phishing-simulation.com / admin123');
    console.log('User: test@phishing-simulation.com / admin123');
    console.log('Instructor: instructor@phishing-simulation.com / admin123');
    console.log('\nCreated Simulations:');
    console.log('- MetaMask Wallet Security Alert (Intermediate)');
    console.log('- Bank Account Security Verification (Beginner)');
    console.log('- Social Media Account Verification (Beginner)');
    console.log('\nCreated Fake Websites:');
    console.log('- MetaMask Security Update');
    console.log('- Bank Security Verification');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

if (require.main === module) {
  seedComprehensiveDatabase();
}

module.exports = { seedComprehensiveDatabase }; 