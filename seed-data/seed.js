const mongoose = require('mongoose');
const Simulation = require('../models/Simulation');
const FakeWebsite = require('../models/FakeWebsite');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Sample simulations data
const sampleSimulations = [
  {
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
        pressureTactics: [
          "Time-limited security verification",
          "Immediate action required",
          "Account suspension threat"
        ],
        trustBuildingElements: [
          "Official MetaMask branding",
          "Security badges and SSL indicators",
          "Professional support number"
        ]
      }
    },
    educationalContent: {
      learningObjectives: [
        "Recognize urgency-based phishing tactics",
        "Identify fake wallet verification requests",
        "Understand the importance of never sharing seed phrases",
        "Learn to verify official communication channels"
      ],
      redFlags: [
        "Urgent security alerts via SMS",
        "Requests for seed phrase or private keys",
        "Time-limited verification processes",
        "Suspicious phone numbers or URLs",
        "Pressure to act immediately"
      ],
      preventionTips: [
        "Never share your seed phrase with anyone",
        "Verify official communication through official channels",
        "Be suspicious of urgent security alerts",
        "Check URLs carefully before clicking",
        "Use hardware wallets for additional security"
      ],
      realWorldExamples: [
        "MetaMask users lost $170M in 2021 through phishing attacks",
        "Fake MetaMask support accounts on social media",
        "SMS phishing campaigns targeting crypto users"
      ],
      debriefingQuestions: [
        "What made this attack convincing?",
        "How could you verify if this was legitimate?",
        "What should you do if you receive such a message?",
        "How can you protect yourself from similar attacks?"
      ],
      resources: [
        {
          title: "MetaMask Security Guide",
          url: "https://metamask.io/security/",
          type: "official"
        },
        {
          title: "Crypto Phishing Prevention",
          url: "https://www.cryptosec.info/phishing",
          type: "educational"
        }
      ]
    },
    simulationFlow: {
      steps: [
        {
          stepNumber: 1,
          title: "Receive SMS Alert",
          description: "User receives urgent SMS about wallet security",
          action: "Read and evaluate the message",
          expectedResponse: "Recognize suspicious elements",
          timeLimit: 60,
          points: 10
        },
        {
          stepNumber: 2,
          title: "Click Link or Call Number",
          description: "User decides to investigate further",
          action: "Choose response method",
          expectedResponse: "Avoid clicking suspicious links",
          timeLimit: 120,
          points: 15
        },
        {
          stepNumber: 3,
          title: "Visit Fake Website",
          description: "User encounters convincing fake MetaMask site",
          action: "Interact with the website",
          expectedResponse: "Identify fake elements",
          timeLimit: 180,
          points: 20
        },
        {
          stepNumber: 4,
          title: "Enter Seed Phrase",
          description: "Website requests seed phrase verification",
          action: "Provide or refuse information",
          expectedResponse: "Never provide seed phrase",
          timeLimit: 300,
          points: 30
        }
      ]
    },
    tags: ["metamask", "wallet", "sms", "urgent", "seed-phrase"]
  },
  {
    title: "Binance Account Suspension",
    description: "Simulates a phishing attack targeting Binance users through email and voice calls",
    type: "email-phishing",
    difficulty: "advanced",
    targetPlatform: "binance",
    scenario: {
      emailTemplate: {
        subject: "URGENT: Your Binance account has been suspended",
        body: "Dear valued customer, we have detected suspicious activity on your account. Your account has been temporarily suspended for security reasons. Please call our support team immediately to resolve this issue.",
        sender: "security@binance-support.com"
      },
      phoneNumber: "1-800-BINANCE",
      voiceScript: "Hello, this is Binance security support. We've detected suspicious activity on your account and need to verify your identity. Can you please provide your account email and the last 4 digits of your ID?"
    },
    educationalContent: {
      learningObjectives: [
        "Identify fake email addresses and domains",
        "Recognize social engineering in voice calls",
        "Understand account verification procedures",
        "Learn to verify official support channels"
      ],
      redFlags: [
        "Urgent account suspension notices",
        "Requests for personal information over phone",
        "Suspicious email domains",
        "Pressure to act immediately",
        "Unusual verification requests"
      ],
      preventionTips: [
        "Verify email domains carefully",
        "Never provide personal info over unsolicited calls",
        "Contact support through official channels",
        "Enable 2FA on all accounts",
        "Check account status through official app"
      ],
      realWorldExamples: [
        "Binance users targeted by fake support calls",
        "Email phishing campaigns with fake suspension notices",
        "Voice phishing targeting crypto exchange users"
      ]
    },
    tags: ["binance", "email", "voice", "suspension", "support"]
  },
  {
    title: "PayPal Payment Verification",
    description: "Simulates a PayPal phishing attack through SMS and fake login page",
    type: "sms-website-call",
    difficulty: "beginner",
    targetPlatform: "paypal",
    scenario: {
      smsMessage: "PayPal: Your account has been limited due to suspicious activity. Verify your identity: [link] or call 1-800-PAYPAL",
      phoneNumber: "1-800-PAYPAL",
      websiteUrl: "/simulation/paypal-verify",
      fakeWebsite: {
        template: "paypal-clone"
      }
    },
    educationalContent: {
      learningObjectives: [
        "Recognize fake PayPal communications",
        "Identify suspicious login pages",
        "Understand payment platform security",
        "Learn safe online payment practices"
      ],
      redFlags: [
        "Account limitation notices via SMS",
        "Suspicious login page URLs",
        "Requests for sensitive information",
        "Urgent action requirements"
      ],
      preventionTips: [
        "Always access PayPal through official app or website",
        "Never click links in suspicious messages",
        "Enable two-factor authentication",
        "Check account status through official channels"
      ]
    },
    tags: ["paypal", "payment", "sms", "login", "verification"]
  }
];

// Sample fake websites data
const sampleFakeWebsites = [
  {
    name: "MetaMask Security Update",
    platform: "metamask",
    template: "metamask-clone",
    description: "Realistic MetaMask clone for wallet security simulation",
    htmlTemplate: `
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
      
      @media (max-width: 480px) {
        .metamask-container {
          margin: 10px;
          border-radius: 8px;
        }
        
        .main-content {
          padding: 20px;
        }
        
        .seed-phrase-inputs {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .form-actions {
          flex-direction: column;
        }
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
            // Send data to server (this would be handled by the form action in real implementation)
            alert('Verification successful! Your wallet is now secure.');
            window.close();
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
    assets: {
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxLjQ5IDQuMjJMMTMuNSAxMi4yMUwyMS40OSAyMC4yQzIyLjI1IDE5LjQ0IDIyLjI1IDE4LjE3IDIyLjI1IDE2Ljg5VjcuMTFDMjIuMjUgNS44MyAyMi4yNSA0LjU2IDIxLjQ5IDQuMjJaIiBmaWxsPSIjRkY5ODAwIi8+CjxwYXRoIGQ9Ik0yLjUxIDQuMjJMMTAuNSAxMi4yMUwyLjUxIDIwLjJDMi4yNSAxOS40NCAyLjI1IDE4LjE3IDIuMjUgMTYuODlWNy4xMUMyLjI1IDUuODMgMi4yNSA0LjU2IDIuNTEgNC4yMloiIGZpbGw9IiNGRjk4MDAiLz4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRjk4MDAiLz4KPC9zdmc+',
      favicon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI5LjE5IDUuNjNMMTguMDAwMSAxNi4yOEwyOS4xOSAyNi45M0MzMC4zMzMzIDI1LjkxOTkgMzAuMzMzMyAyNC4yMjY3IDMwLjMzMzMgMjIuNTE4N1Y5LjQ4MTMzQzMwLjMzMzMgNy43NzMzMyAzMC4zMzMzIDYuMDgwMTMgMjkuMTkgNS42M1oiIGZpbGw9IiNGRjk4MDAiLz4KPHBhdGggZD0iTTIuODA5OTkgNS42M0wxNC4wMDAxIDE2LjI4TDIuODA5OTkgMjYuOTNDMi4zMzMzMyAyNS45MTk5IDIuMzMzMyAyNC4yMjY3IDIuMzMzMyAyMi41MTg3VjkuNDgxMzNDMi4zMzMzIDcuNzczMzMgMi4zMzMzMyA2LjA4MDEzIDIuODA5OTkgNS42M1oiIGZpbGw9IiNGRjk4MDAiLz4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiNGRjk4MDAiLz4KPC9zdmc+'
    },
    branding: {
      primaryColor: '#FF9800',
      secondaryColor: '#667eea',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxLjQ5IDQuMjJMMTMuNSAxMi4yMUwyMS40OSAyMC4yQzIyLjI1IDE5LjQ0IDIyLjI1IDE4LjE3IDIyLjI1IDE2Ljg5VjcuMTFDMjIuMjUgNS44MyAyMi4yNSA0LjU2IDIxLjQ5IDQuMjJaIiBmaWxsPSIjRkY5ODAwIi8+CjxwYXRoIGQ9Ik0yLjUxIDQuMjJMMTAuNSAxMi4yMUwyLjUxIDIwLjJDMi4yNSAxOS40NCAyLjI1IDE4LjE3IDIuMjUgMTYuODlWNy4xMUMyLjI1IDUuODMgMi4yNSA0LjU2IDIuNTEgNC4yMloiIGZpbGw9IiNGRjk4MDAiLz4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiNGRjk4MDAiLz4KPC9zdmc+'
    },
    functionality: {
      hasCaptcha: false,
      hasProgressBar: false,
      hasLoadingStates: true,
      hasErrorHandling: true,
      redirectAfterSubmit: true
    },
    securityFeatures: {
      requiresHttps: true,
      hasCsrfProtection: false,
      rateLimiting: true
    },
    tags: ['metamask', 'wallet', 'crypto', 'security', 'seed-phrase']
  }
];

// Sample admin user
const sampleAdminUser = {
  username: 'admin',
  email: 'admin@phishing-simulation.com',
  password: 'admin123',
  role: 'admin',
  organization: 'Security Education Team',
  isActive: true
};

// Sample student user
const sampleStudentUser = {
  username: 'student',
  email: 'student@example.com',
  password: 'student123',
  role: 'student',
  organization: 'Security Training Program',
  isActive: true,
  profile: {
    firstName: 'John',
    lastName: 'Student',
    phone: '+1234567890',
    department: 'Computer Science',
    yearOfStudy: 3
  }
};

// Seed function
async function seedDatabase() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phishing-simulation', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    }

    // Clear existing data
    console.log('Clearing existing data...');
    await Simulation.deleteMany({});
    await FakeWebsite.deleteMany({});
    await User.deleteMany({ 
      email: { 
        $in: [sampleAdminUser.email, sampleStudentUser.email] 
      } 
    });

    // Create admin user
    console.log('Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash(sampleAdminUser.password, 12);
    const adminUser = new User({
      ...sampleAdminUser,
      password: hashedAdminPassword
    });
    await adminUser.save();
    console.log('Admin user created:', adminUser.email);

    // Create student user
    console.log('Creating student user...');
    const hashedStudentPassword = await bcrypt.hash(sampleStudentUser.password, 12);
    const studentUser = new User({
      ...sampleStudentUser,
      password: hashedStudentPassword
    });
    await studentUser.save();
    console.log('Student user created:', studentUser.email);

    // Create fake websites
    console.log('Creating fake website templates...');
    for (const websiteData of sampleFakeWebsites) {
      const fakeWebsite = new FakeWebsite({
        ...websiteData,
        createdBy: adminUser._id
      });
      await fakeWebsite.save();
      console.log('Created fake website:', fakeWebsite.name);
    }

    // Create simulations
    console.log('Creating simulations...');
    for (const simulationData of sampleSimulations) {
      const simulation = new Simulation({
        ...simulationData,
        createdBy: adminUser._id
      });
      await simulation.save();
      console.log('Created simulation:', simulation.title);
    }

    console.log('Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email:', sampleAdminUser.email);
    console.log('Password:', sampleAdminUser.password);
    console.log('\nStudent credentials:');
    console.log('Email:', sampleStudentUser.email);
    console.log('Password:', sampleStudentUser.password);
    console.log('\nSample data created:');
    console.log('- Simulations:', sampleSimulations.length);
    console.log('- Fake websites:', sampleFakeWebsites.length);
    console.log('- Admin user: 1');
    console.log('- Student user: 1');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error; // Re-throw to let the server handle it
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleSimulations, sampleFakeWebsites, sampleAdminUser, sampleStudentUser }; 