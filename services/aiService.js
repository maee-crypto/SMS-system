const OpenAI = require('openai');

class AIService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (apiKey) {
        this.client = new OpenAI({
          apiKey: apiKey
        });
        this.isConfigured = true;
        console.log('✅ OpenAI AI service initialized successfully');
      } else {
        console.log('⚠️ OpenAI API key not found. AI functionality will be simulated.');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Error initializing OpenAI:', error);
      this.isConfigured = false;
    }
  }

  async generatePhishingContent(type, urgency, targetPlatform, customDetails = '') {
    if (!this.isConfigured) {
      return this.simulatePhishingContent(type, urgency, targetPlatform, customDetails);
    }

    try {
      const prompt = this.buildPhishingPrompt(type, urgency, targetPlatform, customDetails);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert creating realistic phishing simulation content for educational purposes. Generate content that demonstrates common phishing techniques while maintaining educational value."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const generatedContent = completion.choices[0].message.content;
      
      return {
        success: true,
        content: generatedContent,
        type: type,
        urgency: urgency,
        targetPlatform: targetPlatform,
        timestamp: new Date(),
        model: "gpt-3.5-turbo"
      };

    } catch (error) {
      console.error('❌ Error generating AI content:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.simulatePhishingContent(type, urgency, targetPlatform, customDetails)
      };
    }
  }

  async analyzePhishingResponse(userResponse, simulationContext) {
    if (!this.isConfigured) {
      return this.simulateAnalysis(userResponse, simulationContext);
    }

    try {
      const prompt = `
        Analyze this user response to a phishing simulation:
        
        User Response: "${userResponse}"
        Simulation Context: ${JSON.stringify(simulationContext)}
        
        Provide analysis on:
        1. Vulnerability level (1-10)
        2. Key red flags missed
        3. Educational recommendations
        4. Risk assessment
        5. Learning opportunities
        
        Format as JSON with these fields: vulnerabilityScore, redFlags, recommendations, riskLevel, learningPoints
      `;

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert analyzing phishing simulation responses for educational purposes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      });

      const analysis = completion.choices[0].message.content;
      
      try {
        const parsedAnalysis = JSON.parse(analysis);
        return {
          success: true,
          analysis: parsedAnalysis,
          timestamp: new Date(),
          model: "gpt-3.5-turbo"
        };
      } catch (parseError) {
        return {
          success: true,
          analysis: { raw: analysis },
          timestamp: new Date(),
          model: "gpt-3.5-turbo"
        };
      }

    } catch (error) {
      console.error('❌ Error analyzing response:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.simulateAnalysis(userResponse, simulationContext)
      };
    }
  }

  async generateEducationalContent(topic, difficulty = 'beginner') {
    if (!this.isConfigured) {
      return this.simulateEducationalContent(topic, difficulty);
    }

    try {
      const prompt = `
        Create educational content about "${topic}" for ${difficulty} level cybersecurity training.
        
        Include:
        1. Key concepts explanation
        2. Real-world examples
        3. Prevention tips
        4. Quiz questions
        5. Interactive elements
        
        Format as structured content with clear sections.
      `;

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity educator creating engaging educational content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.5
      });

      return {
        success: true,
        content: completion.choices[0].message.content,
        topic: topic,
        difficulty: difficulty,
        timestamp: new Date(),
        model: "gpt-3.5-turbo"
      };

    } catch (error) {
      console.error('❌ Error generating educational content:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.simulateEducationalContent(topic, difficulty)
      };
    }
  }

  async detectPhishingAttempts(text) {
    if (!this.isConfigured) {
      return this.simulatePhishingDetection(text);
    }

    try {
      const prompt = `
        Analyze this text for potential phishing indicators:
        
        Text: "${text}"
        
        Identify:
        1. Urgency indicators
        2. Authority claims
        3. Emotional manipulation
        4. Suspicious links/requests
        5. Grammar/spelling issues
        6. Overall phishing probability (0-100%)
        
        Format as JSON with these fields: urgencyScore, authorityScore, emotionalScore, suspiciousElements, grammarIssues, phishingProbability
      `;

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert analyzing text for phishing indicators."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.2
      });

      const detection = completion.choices[0].message.content;
      
      try {
        const parsedDetection = JSON.parse(detection);
        return {
          success: true,
          detection: parsedDetection,
          timestamp: new Date(),
          model: "gpt-3.5-turbo"
        };
      } catch (parseError) {
        return {
          success: true,
          detection: { raw: detection },
          timestamp: new Date(),
          model: "gpt-3.5-turbo"
        };
      }

    } catch (error) {
      console.error('❌ Error detecting phishing:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.simulatePhishingDetection(text)
      };
    }
  }

  buildPhishingPrompt(type, urgency, targetPlatform, customDetails) {
    const basePrompt = `Create a realistic phishing ${type} simulation for educational purposes.
    
    Requirements:
    - Type: ${type}
    - Urgency Level: ${urgency}
    - Target Platform: ${targetPlatform}
    - Custom Details: ${customDetails}
    
    Generate:
    1. Subject line
    2. Email/SMS content
    3. Call-to-action
    4. Social engineering elements
    5. Red flags to teach about
    
    Make it realistic but clearly educational. Include common phishing techniques like urgency, authority, and emotional manipulation.`;

    return basePrompt;
  }

  simulatePhishingContent(type, urgency, targetPlatform, customDetails) {
    const templates = {
      'email': {
        high: {
          subject: '🚨 URGENT: Your account has been COMPROMISED',
          content: `Dear User,

We have detected suspicious activity on your ${targetPlatform} account. Your account has been temporarily suspended for security reasons.

IMMEDIATE ACTION REQUIRED: You must verify your identity within the next 2 hours to restore access.

Click here to verify: [VERIFICATION LINK]

If you don't verify within 2 hours, your account will be permanently locked.

Best regards,
Security Team
${targetPlatform}`,
          redFlags: ['Urgency', 'Authority claim', 'Threat of account loss', 'Suspicious link']
        },
        medium: {
          subject: 'Account Verification Required',
          content: `Hello,

We need to verify your ${targetPlatform} account information to ensure your security.

Please complete the verification process to maintain uninterrupted access.

Verify here: [VERIFICATION LINK]

Thank you,
${targetPlatform} Support`,
          redFlags: ['Authority claim', 'Suspicious link', 'Generic greeting']
        }
      },
      'sms': {
        high: {
          subject: 'URGENT: Account Suspended',
          content: `🚨 Your ${targetPlatform} account has been SUSPENDED due to suspicious activity. Verify immediately: [LINK] or account will be locked.`,
          redFlags: ['Urgency', 'Threat', 'Suspicious link']
        },
        medium: {
          subject: 'Verification Needed',
          content: `Your ${targetPlatform} account requires verification. Please verify here: [LINK] to maintain access.`,
          redFlags: ['Authority claim', 'Suspicious link']
        }
      }
    };

    const typeTemplates = templates[type] || templates.email;
    const urgencyTemplate = typeTemplates[urgency] || typeTemplates.medium;
    
    return {
      success: true,
      content: {
        subject: urgencyTemplate.subject,
        body: urgencyTemplate.content,
        redFlags: urgencyTemplate.redFlags
      },
      type: type,
      urgency: urgency,
      targetPlatform: targetPlatform,
      timestamp: new Date(),
      simulated: true
    };
  }

  simulateAnalysis(userResponse, simulationContext) {
    return {
      success: true,
      analysis: {
        vulnerabilityScore: Math.floor(Math.random() * 5) + 3,
        redFlags: ['Missed urgency indicators', 'Clicked suspicious link'],
        recommendations: ['Learn to identify urgency tactics', 'Verify sender authenticity'],
        riskLevel: 'medium',
        learningPoints: ['Always verify before clicking', 'Check sender email address']
      },
      timestamp: new Date(),
      simulated: true
    };
  }

  simulateEducationalContent(topic, difficulty) {
    return {
      success: true,
      content: {
        title: `${topic} - ${difficulty} Level`,
        concepts: [`Key concept 1 about ${topic}`, `Key concept 2 about ${topic}`],
        examples: [`Real-world example 1`, `Real-world example 2`],
        tips: [`Prevention tip 1`, `Prevention tip 2`],
        quiz: [`Question 1 about ${topic}`, `Question 2 about ${topic}`]
      },
      topic: topic,
      difficulty: difficulty,
      timestamp: new Date(),
      simulated: true
    };
  }

  simulatePhishingDetection(text) {
    return {
      success: true,
      detection: {
        urgencyScore: Math.floor(Math.random() * 80) + 20,
        authorityScore: Math.floor(Math.random() * 70) + 30,
        emotionalScore: Math.floor(Math.random() * 60) + 40,
        suspiciousElements: ['Urgency', 'Authority claim'],
        grammarIssues: ['Minor spelling errors'],
        phishingProbability: Math.floor(Math.random() * 40) + 60
      },
      timestamp: new Date(),
      simulated: true
    };
  }

  getServiceStatus() {
    return {
      configured: this.isConfigured,
      provider: 'OpenAI',
      model: 'gpt-3.5-turbo'
    };
  }
}

module.exports = new AIService(); 