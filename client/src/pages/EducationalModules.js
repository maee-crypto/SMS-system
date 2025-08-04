import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import ProgressOverview from '../components/educational/ProgressOverview';
import ModuleGrid from '../components/educational/ModuleGrid';
import ModuleDetailModal from '../components/educational/ModuleDetailModal';

const EducationalModules = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    // Mock data - replace with API call
    setModules([
      {
        id: 1,
        title: 'Understanding Phishing Fundamentals',
        description: 'Learn the basics of phishing attacks and social engineering',
        category: 'fundamentals',
        difficulty: 'beginner',
        duration: '30 min',
        progress: 67,
        status: 'in_progress',
        modules: [
          {
            id: '1.1',
            title: 'What is Phishing?',
            type: 'video',
            duration: '5 min',
            content: 'Introduction to phishing attacks and their impact',
            completed: true
          },
          {
            id: '1.2',
            title: 'Common Phishing Techniques',
            type: 'interactive',
            duration: '10 min',
            content: 'Explore different types of phishing attacks',
            completed: true
          },
          {
            id: '1.3',
            title: 'Social Engineering Basics',
            type: 'quiz',
            duration: '15 min',
            content: 'Test your knowledge of social engineering tactics',
            completed: false
          }
        ],
        icon: '🎓',
        color: 'blue'
      },
      {
        id: 2,
        title: 'SMS and Voice Phishing',
        description: 'Master smishing and vishing attack detection',
        category: 'mobile',
        difficulty: 'intermediate',
        duration: '45 min',
        progress: 0,
        status: 'pending',
        modules: [
          {
            id: '2.1',
            title: 'SMS Phishing (Smishing)',
            type: 'simulation',
            duration: '15 min',
            content: 'Practice identifying suspicious text messages',
            completed: false
          },
          {
            id: '2.2',
            title: 'Voice Phishing (Vishing)',
            type: 'simulation',
            duration: '20 min',
            content: 'Learn to detect phone-based social engineering',
            completed: false
          },
          {
            id: '2.3',
            title: 'Mobile Security Best Practices',
            type: 'guide',
            duration: '10 min',
            content: 'Protect yourself from mobile-based attacks',
            completed: false
          }
        ],
        icon: '📱',
        color: 'green'
      },
      {
        id: 3,
        title: 'Email Phishing Mastery',
        description: 'Advanced email security and threat detection',
        category: 'email',
        difficulty: 'advanced',
        duration: '60 min',
        progress: 0,
        status: 'pending',
        modules: [
          {
            id: '3.1',
            title: 'Email Header Analysis',
            type: 'interactive',
            duration: '15 min',
            content: 'Learn to read and analyze email headers',
            completed: false
          },
          {
            id: '3.2',
            title: 'Brand Impersonation',
            type: 'simulation',
            duration: '20 min',
            content: 'Identify fake emails from trusted brands',
            completed: false
          },
          {
            id: '3.3',
            title: 'Advanced Email Security',
            type: 'guide',
            duration: '25 min',
            content: 'Implement enterprise-level email protection',
            completed: false
          }
        ],
        icon: '📧',
        color: 'purple'
      },
      {
        id: 4,
        title: 'Cryptocurrency Security',
        description: 'Protect your digital assets from crypto scams',
        category: 'crypto',
        difficulty: 'advanced',
        duration: '50 min',
        progress: 0,
        status: 'pending',
        modules: [
          {
            id: '4.1',
            title: 'Wallet Security Fundamentals',
            type: 'guide',
            duration: '15 min',
            content: 'Understanding wallet security basics',
            completed: false
          },
          {
            id: '4.2',
            title: 'Seed Phrase Protection',
            type: 'simulation',
            duration: '20 min',
            content: 'Practice protecting your recovery phrases',
            completed: false
          },
          {
            id: '4.3',
            title: 'DeFi Security',
            type: 'interactive',
            duration: '15 min',
            content: 'Secure decentralized finance interactions',
            completed: false
          }
        ],
        icon: '🔐',
        color: 'orange'
      },
      {
        id: 5,
        title: 'Social Media Security',
        description: 'Navigate social media safely and avoid scams',
        category: 'social',
        difficulty: 'intermediate',
        duration: '40 min',
        progress: 0,
        status: 'pending',
        modules: [
          {
            id: '5.1',
            title: 'Fake Profile Detection',
            type: 'interactive',
            duration: '15 min',
            content: 'Learn to spot fake social media accounts',
            completed: false
          },
          {
            id: '5.2',
            title: 'Social Media Scams',
            type: 'simulation',
            duration: '15 min',
            content: 'Practice identifying social media scams',
            completed: false
          },
          {
            id: '5.3',
            title: 'Privacy Protection',
            type: 'guide',
            duration: '10 min',
            content: 'Protect your privacy on social platforms',
            completed: false
          }
        ],
        icon: '📱',
        color: 'indigo'
      },
      {
        id: 6,
        title: 'Enterprise Security',
        description: 'Advanced security for organizations and teams',
        category: 'enterprise',
        difficulty: 'advanced',
        duration: '90 min',
        progress: 0,
        status: 'pending',
        modules: [
          {
            id: '6.1',
            title: 'Security Policy Development',
            type: 'guide',
            duration: '30 min',
            content: 'Create effective security policies',
            completed: false
          },
          {
            id: '6.2',
            title: 'Incident Response',
            type: 'simulation',
            duration: '30 min',
            content: 'Practice responding to security incidents',
            completed: false
          },
          {
            id: '6.3',
            title: 'Team Training Programs',
            type: 'guide',
            duration: '30 min',
            content: 'Develop comprehensive training programs',
            completed: false
          }
        ],
        icon: '🏢',
        color: 'red'
      }
    ]);

    // Mock user progress
    setUserProgress({
      '1.1': true,
      '1.2': true,
      '1.3': false,
      '2.1': false,
      '2.2': false,
      '2.3': false
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container py-8">
        <PageHeader
          title="Educational Modules"
          subtitle="Comprehensive learning resources for cybersecurity awareness"
          icon="📚"
        />

        <ProgressOverview modules={modules} userProgress={userProgress} />

        <ModuleGrid 
          modules={modules} 
          onModuleClick={setSelectedModule}
        />

        <ModuleDetailModal
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
          userProgress={userProgress}
        />
      </div>
    </div>
  );
};

export default EducationalModules; 