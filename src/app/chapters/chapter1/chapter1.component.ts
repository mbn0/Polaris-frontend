import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Section {
  id: number;
  title: string;
  completed: boolean;
}

interface LearningOutcome {
  id: number;
  text: string;
  completed: boolean;
}

interface SecurityService {
  term: string;
  definition: string;
  examples: string[];
  icon: string;
}

interface Attack {
  name: string;
  description: string;
  category: 'active' | 'passive';
  examples: string[];
  countermeasures: string[];
}

interface CryptoComponent {
  name: string;
  description: string;
  example: string;
  importance: string;
}

interface SecurityMechanism {
  name: string;
  description: string;
  icon: string;
  examples: string[];
  advantages: string[];
  limitations: string[];
}

@Component({
  selector: 'app-chapter1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter1.component.html',
  styleUrls: ['./chapter1.component.css']
})
export class Chapter1Component {
  currentSection = 1;
  totalSections = 8;

  sections: Section[] = [
    { id: 1, title: 'Course Overview', completed: false },
    { id: 2, title: 'Learning Outcomes', completed: false },
    { id: 3, title: 'Information Security Services', completed: false },
    { id: 4, title: 'Types of Security Threats', completed: false },
    { id: 5, title: 'Attack Categories', completed: false },
    { id: 6, title: 'Security Mechanisms', completed: false },
    { id: 7, title: 'Cryptography Defined', completed: false },
    { id: 8, title: 'Core Building Blocks', completed: false }
  ];

  learningOutcomes: LearningOutcome[] = [
    { id: 1, text: 'Understand core cryptographic concepts and terminology', completed: false },
    { id: 2, text: 'Identify different types of security threats and attacks', completed: false },
    { id: 3, text: 'Explain the role of cryptography in information security', completed: false },
    { id: 4, text: 'Describe the fundamental components of a cryptosystem', completed: false },
    { id: 5, text: 'Analyze basic security requirements for different scenarios', completed: false },
    { id: 6, text: 'Compare different types of cryptographic mechanisms', completed: false }
  ];

  securityServices: SecurityService[] = [
    {
      term: 'Confidentiality',
      definition: 'Keeping information secret from unauthorized parties',
      examples: ['Encrypted emails', 'Password storage', 'Secure messaging'],
      icon: '🔒'
    },
    {
      term: 'Integrity',
      definition: 'Ensuring information has not been altered',
      examples: ['Digital signatures', 'Hash functions', 'Checksums'],
      icon: '✓'
    },
    {
      term: 'Authentication',
      definition: 'Verifying the identity of users or systems',
      examples: ['Password verification', 'Biometric scanning', 'Digital certificates'],
      icon: '🔑'
    },
    {
      term: 'Non-repudiation',
      definition: 'Preventing denial of previous actions or commitments',
      examples: ['Digital signatures', 'Blockchain transactions', 'Audit logs'],
      icon: '📝'
    },
    {
      term: 'Access Control',
      definition: 'Managing who can access specific resources',
      examples: ['Role-based access', 'File permissions', 'Access tokens'],
      icon: '🚪'
    }
  ];

  attackTypes: Attack[] = [
    {
      name: 'Eavesdropping',
      description: 'Intercepting private communications',
      category: 'passive',
      examples: ['Network sniffing', 'Man-in-the-middle attacks', 'Wiretapping'],
      countermeasures: ['Encryption', 'Secure channels', 'VPN usage']
    },
    {
      name: 'Traffic Analysis',
      description: 'Analyzing patterns of communication',
      category: 'passive',
      examples: ['Timing analysis', 'Size correlation', 'Frequency analysis'],
      countermeasures: ['Traffic padding', 'Onion routing', 'Mix networks']
    },
    {
      name: 'Masquerade',
      description: 'Impersonating another entity',
      category: 'active',
      examples: ['Phishing', 'Session hijacking', 'IP spoofing'],
      countermeasures: ['Strong authentication', 'Digital certificates', 'Security tokens']
    },
    {
      name: 'Replay',
      description: 'Retransmitting captured data',
      category: 'active',
      examples: ['Session replay', 'Transaction replay', 'Command replay'],
      countermeasures: ['Timestamps', 'Nonces', 'Session tokens']
    },
    {
      name: 'Modification',
      description: 'Altering transmitted data',
      category: 'active',
      examples: ['Data tampering', 'Message modification', 'Code injection'],
      countermeasures: ['Digital signatures', 'Message authentication codes', 'Input validation']
    },
    {
      name: 'Denial of Service',
      description: 'Preventing normal system use',
      category: 'active',
      examples: ['DDoS attacks', 'Resource exhaustion', 'Flooding'],
      countermeasures: ['Rate limiting', 'Traffic filtering', 'Load balancing']
    }
  ];

  securityMechanisms: SecurityMechanism[] = [
    {
      name: 'Physical Protection',
      description: 'Securing physical access to systems and data',
      icon: '🏢',
      examples: ['Secure data centers', 'Biometric access', 'Security cameras'],
      advantages: ['Tangible security', 'Immediate threat response', 'Visual deterrence'],
      limitations: ['Cost', 'Geographic constraints', 'Physical vulnerabilities']
    },
    {
      name: 'Cryptographic Techniques',
      description: 'Mathematical methods for securing information',
      icon: '🔐',
      examples: ['Encryption', 'Digital signatures', 'Hash functions'],
      advantages: ['Strong security guarantees', 'Mathematical proof', 'Automated protection'],
      limitations: ['Processing overhead', 'Key management', 'Implementation complexity']
    },
    {
      name: 'Access Control',
      description: 'Managing who can access what resources',
      icon: '🔑',
      examples: ['Role-based access', 'ACLs', 'Capability lists'],
      advantages: ['Fine-grained control', 'Principle of least privilege', 'Accountability'],
      limitations: ['Administration overhead', 'Complex policies', 'Potential misconfiguration']
    },
    {
      name: 'Auditing & Logging',
      description: 'Recording and monitoring system activities',
      icon: '📋',
      examples: ['System logs', 'Audit trails', 'Security monitoring'],
      advantages: ['Activity tracking', 'Incident investigation', 'Compliance'],
      limitations: ['Storage requirements', 'Performance impact', 'Log management']
    }
  ];

  cryptoComponents: CryptoComponent[] = [
    {
      name: 'Plaintext',
      description: 'The original message or data to be protected',
      example: 'Hello, World!',
      importance: 'Starting point of encryption process'
    },
    {
      name: 'Encryption Algorithm',
      description: 'Mathematical function for transforming plaintext',
      example: 'AES, RSA, ChaCha20',
      importance: 'Core transformation process'
    },
    {
      name: 'Secret Key',
      description: 'Parameter that controls the encryption process',
      example: '256-bit random number',
      importance: 'Critical security parameter'
    },
    {
      name: 'Ciphertext',
      description: 'The encrypted message output',
      example: '0x7B3F...',
      importance: 'Protected form of data'
    }
  ];

  selectedService: SecurityService | null = null;
  selectedAttack: Attack | null = null;
  selectedMechanism: SecurityMechanism | null = null;

  constructor(private router: Router) {}

  goToSection(sectionId: number): void {
    this.currentSection = sectionId;
    this.sections[sectionId - 1].completed = true;
  }

  nextSection(): void {
    if (this.currentSection < this.totalSections) {
      this.goToSection(this.currentSection + 1);
    }
  }

  prevSection(): void {
    if (this.currentSection > 1) {
      this.goToSection(this.currentSection - 1);
    }
  }

  toggleLearningOutcome(id: number): void {
    const outcome = this.learningOutcomes.find(o => o.id === id);
    if (outcome) {
      outcome.completed = !outcome.completed;
    }
  }

  selectService(service: SecurityService): void {
    this.selectedService = service;
      }

  selectAttack(attack: Attack): void {
    this.selectedAttack = attack;
  }

  selectMechanism(mechanism: SecurityMechanism): void {
    this.selectedMechanism = mechanism;
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
