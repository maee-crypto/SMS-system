# 🛡️ Phishing Simulation Platform

A comprehensive MERN stack application designed for **educational purposes** to simulate social engineering and phishing attacks. This platform helps users, developers, and institutions understand how modern phishing scams work through SMS, fake websites, and voice-based social engineering.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Educational Content](#educational-content)
- [Security Considerations](#security-considerations)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

This platform is designed to **educate and raise awareness** about cybersecurity threats by simulating realistic phishing attacks in a controlled environment. The goal is to help users:

- Recognize common phishing tactics
- Understand social engineering techniques
- Develop better security practices
- Learn to identify red flags
- Practice safe online behavior

### ⚠️ Important Disclaimer

**This platform is for EDUCATIONAL PURPOSES ONLY.** All simulations are designed to raise awareness about cybersecurity threats. This is NOT a real phishing platform. All activities are simulated for educational purposes.

## ✨ Features

### 🔄 Simulation Types

1. **SMS + Call Phishing**
   - Realistic SMS messages with urgency
   - Simulated customer support calls
   - Social engineering tactics demonstration

2. **SMS + Website + Call**
   - Fake SMS with malicious links
   - Convincing clone websites
   - Multi-step attack simulation

3. **Email Phishing**
   - Sophisticated email templates
   - Brand impersonation
   - Attachment-based attacks

4. **Voice Phishing (Vishing)**
   - Simulated phone calls
   - Authority-based manipulation
   - Information extraction techniques

5. **Wallet Phishing**
   - Crypto wallet security simulations
   - Seed phrase extraction attempts
   - DeFi platform impersonation

### 🎨 Fake Website Templates

- **MetaMask Clone** - Realistic wallet security page
- **Binance Clone** - Exchange verification interface
- **Trust Wallet Clone** - Mobile wallet simulation
- **Bank Clone** - Financial institution impersonation
- **Generic Templates** - Customizable phishing pages

### 📊 Analytics & Reporting

- **Real-time Session Tracking**
- **Psychological Vulnerability Analysis**
- **Performance Metrics**
- **Educational Progress Tracking**
- **Detailed Interaction Logs**

### 🎓 Educational Features

- **Learning Objectives** for each simulation
- **Red Flag Identification** training
- **Prevention Tips** and best practices
- **Real-world Examples** and case studies
- **Debriefing Questions** for reflection
- **Resource Links** for further learning

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Socket.IO Client** - Real-time features
- **Chart.js** - Analytics visualization
- **Framer Motion** - Animations
- **React Hook Form** - Form handling

### Security
- **Helmet** - Security headers
- **Rate Limiting** - DDoS protection
- **CORS** - Cross-origin protection
- **Input Validation** - Data sanitization

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd phishing-simulation-platform
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   ```

   Configure the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/phishing-simulation
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Seed the database**
   ```bash
   node seed.js
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both backend and frontend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm start
   
   # Frontend only
   cd client && npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin credentials: admin@phishing-simulation.com / admin123

## 📖 Usage

### For Educators & Administrators

1. **Create Simulations**
   - Design custom phishing scenarios
   - Configure social engineering tactics
   - Set learning objectives and outcomes

2. **Manage Templates**
   - Create fake website templates
   - Customize branding and content
   - Configure form fields and validation

3. **Monitor Progress**
   - Track user performance
   - Analyze vulnerability patterns
   - Generate educational reports

### For Users & Students

1. **Start Simulations**
   - Choose from available scenarios
   - Experience realistic phishing attempts
   - Practice threat recognition

2. **Learn & Improve**
   - Receive detailed feedback
   - Review educational content
   - Track progress over time

3. **Apply Knowledge**
   - Practice safe online behavior
   - Share learnings with others
   - Stay updated on threats

## 🎓 Educational Content

### Learning Objectives

Each simulation focuses on specific learning outcomes:

- **Threat Recognition** - Identify common phishing indicators
- **Social Engineering Awareness** - Understand manipulation techniques
- **Safe Practices** - Learn protective measures
- **Critical Thinking** - Develop analytical skills

### Red Flags Training

Users learn to identify:

- ⏰ **Urgency** - Time-limited demands
- 🎭 **Authority** - Impersonation of trusted entities
- 😰 **Fear** - Threats and consequences
- 💰 **Greed** - Promises of rewards
- 🔗 **Suspicious Links** - Malicious URLs
- 📧 **Fake Domains** - Impersonated websites

### Prevention Strategies

- **Verify Sources** - Check official channels
- **Think Before Clicking** - Analyze links carefully
- **Enable 2FA** - Use multi-factor authentication
- **Keep Software Updated** - Maintain security patches
- **Report Suspicious Activity** - Alert authorities

## 🔒 Security Considerations

### Platform Security

- **Isolated Environment** - All simulations run in controlled sandbox
- **No Real Data** - No actual credentials or sensitive information
- **Educational Focus** - Clear disclaimers and learning objectives
- **Access Control** - Role-based permissions and authentication

### Data Protection

- **Anonymized Analytics** - No personal information stored
- **Encrypted Storage** - Secure data handling
- **Regular Audits** - Security reviews and updates
- **Compliance** - Educational privacy standards

### Ethical Guidelines

- **Consent Required** - Users must agree to participate
- **Educational Purpose** - Clear learning objectives
- **No Harm** - Simulations cannot cause real damage
- **Transparency** - Open about simulation nature

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
```

### Simulation Endpoints

```http
GET /api/simulations
GET /api/simulations/:id
POST /api/simulations/:id/start
POST /api/simulations/:id/interact
POST /api/simulations/:id/complete
GET /api/simulations/:id/stats
```

### Fake Website Endpoints

```http
GET /api/fake-websites
GET /api/fake-websites/:id
GET /api/fake-websites/:id/preview
POST /api/fake-websites/:id/validate
```

### Analytics Endpoints

```http
GET /api/analytics/overview
GET /api/analytics/user/:userId
GET /api/analytics/simulation/:simulationId
```

## 🤝 Contributing

We welcome contributions to improve the educational value and security of this platform.

### Contribution Guidelines

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

### Development Setup

```bash
# Install development dependencies
npm install --dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Security Researchers** - For insights into real-world threats
- **Educational Institutions** - For feedback and testing
- **Open Source Community** - For tools and libraries
- **Cybersecurity Experts** - For guidance and best practices

## 📞 Support

For questions, support, or collaboration:

- **Email**: support@phishing-simulation.com
- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

---

**Remember**: This platform is for educational purposes only. Always practice safe online behavior and report real threats to appropriate authorities. 