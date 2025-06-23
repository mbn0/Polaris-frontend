import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SignatureScheme {
  name: string;
  securityBasis: string;
  signatureSize: string;
  performance: string;
  keySize: number;
  description: string;
}

interface RSAKeyPair {
  n: bigint;
  e: bigint;
  d: bigint;
  p: bigint;
  q: bigint;
}

@Component({
  selector: 'app-chapter13',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter13.component.html',
  styleUrls: ['./chapter13.component.css']
})
export class Chapter13Component {
  currentSection = 1;
  totalSections = 8;

  // Section 2: Conventional vs Digital comparison
  comparisonAspects = [
    {
      aspect: 'Inclusion',
      conventional: 'Signature is part of the document',
      digital: 'Signature is separate data transmitted alongside message'
    },
    {
      aspect: 'Verification',
      conventional: 'Compare to signature on file',
      digital: 'Run verification algorithm with public key'
    },
    {
      aspect: 'Uniqueness',
      conventional: 'Same signature can be copied',
      digital: 'Each signature unique to its message'
    },
    {
      aspect: 'Duplicity',
      conventional: 'Original vs copy distinguishable',
      digital: 'Indistinguishable unless time-stamped'
    }
  ];

  // Section 3: Signature Process
  processStep = 1;
  processMessage = 'Transfer $1000 to Alice';
  processHash = '';
  processSignature = '';
  processVerified = false;

  // Section 4: Security Services
  securityServices = [
    {
      name: 'Message Authentication',
      description: 'Confirms message was created by claimed signer',
      example: 'Bank transfer authorization',
      active: false
    },
    {
      name: 'Message Integrity',
      description: 'Any change to message invalidates signature',
      example: 'Software update verification',
      active: false
    },
    {
      name: 'Non-Repudiation',
      description: 'Signer cannot deny having signed the message',
      example: 'Legal document signing',
      active: false
    },
    {
      name: 'Confidentiality (Optional)',
      description: 'Messages can be encrypted in addition to signing',
      example: 'Secure email with signature',
      active: false
    }
  ];

  // Section 5: Signature Schemes
  signatureSchemes: SignatureScheme[] = [
    {
      name: 'RSA',
      securityBasis: 'Integer Factorization',
      signatureSize: '≈ size of n (2048-4096 bits)',
      performance: 'Slower signing, fast verification',
      keySize: 2048,
      description: 'Most widely used, based on difficulty of factoring large integers'
    },
    {
      name: 'ElGamal',
      securityBasis: 'Discrete Logarithm',
      signatureSize: '2× size of p (2048-4096 bits)',
      performance: 'Randomized, moderate operations',
      keySize: 2048,
      description: 'Probabilistic signatures, each signature uses random value'
    },
    {
      name: 'Schnorr',
      securityBasis: 'Discrete Logarithm',
      signatureSize: '2× size of q (320-512 bits)',
      performance: 'Small signatures, fast operations',
      keySize: 256,
      description: 'Compact signatures with provable security'
    },
    {
      name: 'DSS/DSA',
      securityBasis: 'Discrete Logarithm',
      signatureSize: '2× size of q (320-512 bits)',
      performance: 'Optimized in FIPS standard',
      keySize: 256,
      description: 'NIST standard, optimized for government use'
    },
    {
      name: 'ECDSA',
      securityBasis: 'Elliptic Curve Discrete Log',
      signatureSize: '2× size of field (256-521 bits)',
      performance: 'Very fast at small key sizes',
      keySize: 256,
      description: 'Elliptic curve variant, much smaller keys for same security'
    }
  ];

  selectedScheme = this.signatureSchemes[0];
  schemeComparison = false;

  // RSA Implementation
  rsaKeyPair: RSAKeyPair | null = null;
  rsaMessage = 'Hello RSA!';
  rsaSignature = '';
  rsaVerificationResult = '';
  rsaGenerating = false;

  // ElGamal parameters
  elGamalP = 23n; // Small prime for demo
  elGamalG = 5n;  // Generator
  elGamalX = 6n;  // Private key
  elGamalH = 0n;  // Public key
  elGamalMessage = 'Hello ElGamal!';
  elGamalR = 0n;
  elGamalS = 0n;

  // Section 6: Performance comparison
  performanceResults: any[] = [];
  benchmarkRunning = false;

  // Section 7: Applications
  applications = [
    {
      name: 'Code Signing',
      description: 'Verifying software authenticity and integrity',
      example: 'Microsoft Authenticode, Apple Code Signing',
      benefits: ['Prevents malware distribution', 'Ensures software integrity', 'Publisher authentication']
    },
    {
      name: 'Document Workflows',
      description: 'Legal and financial documents with audit trails',
      example: 'DocuSign, Adobe Sign',
      benefits: ['Legal validity', 'Tamper evidence', 'Audit trail']
    },
    {
      name: 'Blockchain Transactions',
      description: 'Authorizing asset transfers with public verifiability',
      example: 'Bitcoin, Ethereum transactions',
      benefits: ['Public verification', 'Non-repudiation', 'Decentralized trust']
    },
    {
      name: 'Time-Stamped Signatures',
      description: 'Proving signature existed at specific time',
      example: 'RFC 3161 Time-Stamp Protocol',
      benefits: ['Prevents replay attacks', 'Legal timestamp proof', 'Long-term validity']
    }
  ];

  selectedApplication = this.applications[0];

  // Section 8: Exercises
  exercises = [
    {
      name: 'RSA Signature Implementation',
      description: 'Generate RSA keys, sign message, and verify signature',
      completed: false,
      difficulty: 'Intermediate'
    },
    {
      name: 'ElGamal vs Schnorr Comparison',
      description: 'Compare signature sizes and performance',
      completed: false,
      difficulty: 'Advanced'
    },
    {
      name: 'DSS Parameter Generation',
      description: 'Generate valid DSS parameters and test signatures',
      completed: false,
      difficulty: 'Advanced'
    },
    {
      name: 'ECDSA Curve Exploration',
      description: 'Test different elliptic curves and benchmark performance',
      completed: false,
      difficulty: 'Expert'
    },
    {
      name: 'Blind Signature Demo',
      description: 'Implement blind signature protocol for e-cash',
      completed: false,
      difficulty: 'Expert'
    }
  ];

  constructor() {
    this.initializeElGamal();
  }

  // Navigation methods
  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.currentSection++;
    }
  }

  previousSection() {
    if (this.currentSection > 1) {
      this.currentSection--;
    }
  }

  goToSection(section: number) {
    this.currentSection = section;
  }

  // Section 3: Signature Process
  executeProcessStep() {
    switch (this.processStep) {
      case 1:
        // Hash the message
        this.processHash = this.simpleHash(this.processMessage);
        this.processStep = 2;
        break;
      case 2:
        // Generate signature
        this.processSignature = this.generateMockSignature(this.processHash);
        this.processStep = 3;
        break;
      case 3:
        // Verify signature
        this.processVerified = this.verifyMockSignature(this.processMessage, this.processSignature);
        this.processStep = 4;
        break;
      case 4:
        // Reset
        this.processStep = 1;
        this.processHash = '';
        this.processSignature = '';
        this.processVerified = false;
        break;
    }
  }

  // Section 4: Security Services
  toggleSecurityService(index: number) {
    this.securityServices[index].active = !this.securityServices[index].active;
  }

  // Section 5: Scheme Selection
  selectScheme(scheme: SignatureScheme) {
    this.selectedScheme = scheme;
  }

  toggleSchemeComparison() {
    this.schemeComparison = !this.schemeComparison;
  }

  // RSA Implementation
  async generateRSAKeys() {
    this.rsaGenerating = true;
    
    // Use small primes for demo (not secure!)
    const p = 61n;
    const q = 53n;
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    const e = 17n;
    const d = this.modInverse(e, phi);

    this.rsaKeyPair = { n, e, d, p, q };
    this.rsaGenerating = false;
  }

  signRSAMessage() {
    if (!this.rsaKeyPair) return;
    
    const messageHash = BigInt(this.simpleHashToNumber(this.rsaMessage));
    const signature = this.modPow(messageHash, this.rsaKeyPair.d, this.rsaKeyPair.n);
    this.rsaSignature = signature.toString(16);
  }

  verifyRSASignature() {
    if (!this.rsaKeyPair || !this.rsaSignature) return;
    
    const signature = BigInt('0x' + this.rsaSignature);
    const messageHash = BigInt(this.simpleHashToNumber(this.rsaMessage));
    const recovered = this.modPow(signature, this.rsaKeyPair.e, this.rsaKeyPair.n);
    
    this.rsaVerificationResult = recovered === messageHash ? 'Valid' : 'Invalid';
  }

  // ElGamal Implementation
  initializeElGamal() {
    this.elGamalH = this.modPow(this.elGamalG, this.elGamalX, this.elGamalP);
  }

  signElGamalMessage() {
    const messageHash = BigInt(this.simpleHashToNumber(this.elGamalMessage));
    
    // Choose k such that gcd(k, p-1) = 1 and avoid s = 0
    let k = 7n; // Try different k values
    let attempts = 0;
    
    while (attempts < 10) {
      this.elGamalR = this.modPow(this.elGamalG, k, this.elGamalP);
      
      // Check if gcd(k, p-1) = 1
      const gcd = this.gcd(k, this.elGamalP - 1n);
      if (gcd === 1n) {
        const kInv = this.modInverse(k, this.elGamalP - 1n);
        this.elGamalS = (kInv * (messageHash - this.elGamalX * this.elGamalR)) % (this.elGamalP - 1n);
        
        if (this.elGamalS < 0n) {
          this.elGamalS += (this.elGamalP - 1n);
        }
        
        // If s != 0, we have a valid signature
        if (this.elGamalS !== 0n) {
          break;
        }
      }
      
      k = k + 1n;
      attempts++;
    }
  }

  verifyElGamalSignature(): boolean {
    if (this.elGamalR === 0n || this.elGamalS === 0n) return false;
    
    const messageHash = BigInt(this.simpleHashToNumber(this.elGamalMessage));
    const left = this.modPow(this.elGamalG, messageHash, this.elGamalP);
    const right = (this.modPow(this.elGamalH, this.elGamalR, this.elGamalP) * 
                   this.modPow(this.elGamalR, this.elGamalS, this.elGamalP)) % this.elGamalP;
    
    return left === right;
  }

  // Section 6: Performance Benchmark
  async runPerformanceBenchmark() {
    this.benchmarkRunning = true;
    this.performanceResults = [];

    for (const scheme of this.signatureSchemes) {
      const startTime = performance.now();
      
      // Simulate signature operations
      await this.simulateSchemeOperation(scheme);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.performanceResults.push({
        scheme: scheme.name,
        signingTime: duration.toFixed(2),
        verificationTime: (duration * 0.1).toFixed(2), // Verification typically faster
        keySize: scheme.keySize,
        signatureSize: this.getSignatureSize(scheme)
      });
    }

    this.benchmarkRunning = false;
  }

  // Section 7: Applications
  selectApplication(app: any) {
    this.selectedApplication = app;
  }

  // Section 8: Exercises
  startExercise(exercise: any) {
    exercise.completed = !exercise.completed;
  }

  // Utility methods
  private simpleHash(message: string): string {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private simpleHashToNumber(message: string): number {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 1000; // Keep small for demo
  }

  private generateMockSignature(hash: string): string {
    return 'SIG_' + hash + '_' + Math.random().toString(36).substr(2, 9);
  }

  private verifyMockSignature(message: string, signature: string): boolean {
    const expectedHash = this.simpleHash(message);
    return signature.includes(expectedHash);
  }

  private modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent = exponent >> 1n;
      base = (base * base) % modulus;
    }
    return result;
  }

  private gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  private modInverse(a: bigint, m: bigint): bigint {
    const gcdExtended = (a: bigint, b: bigint): [bigint, bigint, bigint] => {
      if (a === 0n) return [b, 0n, 1n];
      const [gcd, x1, y1] = gcdExtended(b % a, a);
      const x = y1 - (b / a) * x1;
      const y = x1;
      return [gcd, x, y];
    };

    const [g, x] = gcdExtended(a, m);
    if (g !== 1n) throw new Error('Modular inverse does not exist');
    return ((x % m) + m) % m;
  }

  private async simulateSchemeOperation(scheme: SignatureScheme): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate different computational complexities
        const complexity = scheme.keySize / 256; // Relative complexity
        setTimeout(resolve, complexity * 10);
      }, Math.random() * 50);
    });
  }

  private getSignatureSize(scheme: SignatureScheme): number {
    switch (scheme.name) {
      case 'RSA': return scheme.keySize;
      case 'ElGamal': return scheme.keySize * 2;
      case 'Schnorr': return 512;
      case 'DSS/DSA': return 512;
      case 'ECDSA': return scheme.keySize * 2;
      default: return scheme.keySize;
    }
  }

  // Progress tracking
  getProgress(): number {
    return (this.currentSection / this.totalSections) * 100;
  }

  getSectionTitle(): string {
    const titles = [
      'Defining Digital Signatures',
      'Conventional vs. Digital Signatures',
      'The Digital Signature Process',
      'Security Services Provided',
      'Digital Signature Schemes',
      'Scheme Comparison',
      'Variations & Applications',
      'Active Learning & Exercises'
    ];
    return titles[this.currentSection - 1] || '';
  }
}
