const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    this.isConfigured = false;
    this.fromEmail = null;
    this.initializeSendGrid();
  }

  initializeSendGrid() {
    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.SENDGRID_FROM_EMAIL;

      if (apiKey && fromEmail) {
        sgMail.setApiKey(apiKey);
        this.fromEmail = fromEmail;
        this.isConfigured = true;
        console.log('✅ SendGrid email service initialized successfully');
      } else {
        console.log('⚠️ SendGrid credentials not found. Email functionality will be simulated.');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Error initializing SendGrid:', error);
      this.isConfigured = false;
    }
  }

  async sendPhishingEmail(to, subject, content, simulationId = null) {
    if (!this.isConfigured) {
      return this.simulateEmail(to, subject, content, simulationId);
    }

    try {
      const emailData = {
        to: to,
        from: this.fromEmail,
        subject: subject,
        html: this.generateEmailTemplate(content),
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true
          },
          openTracking: {
            enable: true
          },
          subscriptionTracking: {
            enable: false
          }
        },
        customArgs: {
          simulationId: simulationId || 'unknown',
          type: 'phishing-simulation'
        }
      };

      const result = await sgMail.send(emailData);
      
      console.log(`📧 Email sent successfully to ${to}:`, result[0].headers['x-message-id']);
      
      return {
        success: true,
        messageId: result[0].headers['x-message-id'],
        status: 'sent',
        to: to,
        from: this.fromEmail,
        subject: subject,
        timestamp: new Date(),
        simulationId: simulationId
      };

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        error: error.message,
        to: to,
        from: this.fromEmail,
        subject: subject,
        timestamp: new Date(),
        simulationId: simulationId
      };
    }
  }

  async sendBulkEmails(recipients, subject, content, simulationId = null) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendPhishingEmail(recipient.email, subject, content, simulationId);
      results.push({
        ...result,
        recipient: recipient
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  async simulateEmail(to, subject, content, simulationId = null) {
    console.log(`📧 [SIMULATED] Email to ${to}:`, subject);
    
    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      to: to,
      from: 'simulated@phishing-simulation.com',
      subject: subject,
      timestamp: new Date(),
      simulationId: simulationId,
      simulated: true
    };
  }

  generateEmailTemplate(content) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Security Alert</h1>
          </div>
          <div class="content">
            ${content}
            <div class="warning">
              <strong>⚠️ Important:</strong> This is a phishing simulation for educational purposes.
            </div>
          </div>
          <div class="footer">
            <p>This email is part of a cybersecurity training program.</p>
            <p>© 2024 Phishing Simulation System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePhishingEmailTemplate(type = 'general', urgency = 'medium') {
    const templates = {
      'bank': {
        high: {
          subject: '🚨 URGENT: Your account has been SUSPENDED',
          content: `
            <h2>Critical Security Alert</h2>
            <p>We have detected suspicious activity on your account. Your access has been temporarily suspended for security reasons.</p>
            <p><strong>Action Required:</strong> You must verify your identity within the next 2 hours to restore access.</p>
            <a href="{link}" class="button">Verify Account Now</a>
            <p>If you don't verify within 2 hours, your account will be permanently locked.</p>
          `
        },
        medium: {
          subject: 'Account Verification Required',
          content: `
            <h2>Account Security Check</h2>
            <p>We need to verify your account information to ensure your security.</p>
            <p>Please complete the verification process to maintain uninterrupted access to your account.</p>
            <a href="{link}" class="button">Complete Verification</a>
          `
        },
        low: {
          subject: 'Account Update Required',
          content: `
            <h2>Account Information Update</h2>
            <p>Please update your account information to ensure we have your current details.</p>
            <a href="{link}" class="button">Update Information</a>
          `
        }
      },
      'crypto': {
        high: {
          subject: '🚨 CRITICAL: Your wallet has been COMPROMISED',
          content: `
            <h2>Wallet Security Breach</h2>
            <p>We have detected unauthorized access to your cryptocurrency wallet.</p>
            <p><strong>Immediate Action Required:</strong> Secure your wallet now to prevent asset loss.</p>
            <a href="{link}" class="button">Secure Wallet</a>
            <p>Time is critical - act now to protect your assets.</p>
          `
        },
        medium: {
          subject: 'Wallet Security Verification',
          content: `
            <h2>Security Check Required</h2>
            <p>Your wallet requires a security verification to ensure safe operation.</p>
            <a href="{link}" class="button">Verify Security</a>
          `
        },
        low: {
          subject: 'Wallet Update Available',
          content: `
            <h2>Wallet Update</h2>
            <p>A new security update is available for your wallet.</p>
            <a href="{link}" class="button">Update Wallet</a>
          `
        }
      },
      'general': {
        high: {
          subject: '🚨 URGENT: Account Security Breach',
          content: `
            <h2>Security Alert</h2>
            <p>We have detected a security breach on your account.</p>
            <p><strong>Immediate Action Required:</strong> Secure your account now.</p>
            <a href="{link}" class="button">Secure Account</a>
          `
        },
        medium: {
          subject: 'Account Verification Needed',
          content: `
            <h2>Verification Required</h2>
            <p>Please verify your account to ensure continued access.</p>
            <a href="{link}" class="button">Verify Account</a>
          `
        },
        low: {
          subject: 'Account Update',
          content: `
            <h2>Update Required</h2>
            <p>Please update your account information.</p>
            <a href="{link}" class="button">Update Account</a>
          `
        }
      }
    };

    const typeTemplates = templates[type] || templates.general;
    const urgencyTemplate = typeTemplates[urgency] || typeTemplates.medium;
    
    return {
      subject: urgencyTemplate.subject,
      content: urgencyTemplate.content
    };
  }

  getServiceStatus() {
    return {
      configured: this.isConfigured,
      fromEmail: this.fromEmail,
      provider: 'SendGrid'
    };
  }
}

module.exports = new EmailService(); 