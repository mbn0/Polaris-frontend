import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface CipherMode {
  name: string;
  keyFeature: string;
  pros: string;
  errorPropagation: string;
}

interface CipherCase {
  name: string;
  blockSize: string;
  keySize: string;
  rounds: string;
  description: string;
}

@Component({
  selector: 'app-chapter3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter5.component.html',
  styleUrls: ['./chapter5.component.css']
})
export class Chapter5Component implements OnInit {
  currentSection = 1;
  totalSections = 10;

  // Interactive elements
  showFeistelAnimation = false;
  showSBoxAnimation = false;

  // Cipher modes comparison
  cipherModes: CipherMode[] = [
    {
      name: 'ECB',
      keyFeature: 'Independent block encryption',
      pros: 'Highly parallelizable; simple',
      errorPropagation: 'Single-block only'
    },
    {
      name: 'CBC',
      keyFeature: 'XOR with previous ciphertext',
      pros: 'Conceals patterns; sequential integrity',
      errorPropagation: 'Affects two blocks'
    },
    {
      name: 'CFB',
      keyFeature: 'Feedback from ciphertext',
      pros: 'Real-time; small granularity',
      errorPropagation: 'Burst errors'
    },
    {
      name: 'OFB',
      keyFeature: 'Pure keystream generator',
      pros: 'Precompute keystream; no propagation',
      errorPropagation: 'Single-bit only'
    },
    {
      name: 'CTR',
      keyFeature: 'Encrypt counter values',
      pros: 'Parallel, random access',
      errorPropagation: 'Independent per block'
    }
  ];

  // Case studies
  cipherCases: CipherCase[] = [
    {
      name: 'AES (Rijndael)',
      blockSize: '128 bits',
      keySize: '128/192/256 bits',
      rounds: '10/12/14',
      description: 'AES leverages a carefully crafted S-box and MixColumns layer to resist both differential and linear attacks, and enjoys high performance in hardware and software.'
    },
    {
      name: 'DES & 3DES',
      blockSize: '64 bits',
      keySize: '56 bits (DES)',
      rounds: '16 rounds (DES)',
      description: 'DES\'s small key and block sizes rendered it vulnerable to brute force; 3DES mitigated this briefly but was overtaken by AES.'
    }
  ];

  // Interactive XOR demo
  xorInput1 = '10110101';
  xorInput2 = '11001010';
  xorResult = '';

  // S-Box demo
  sBoxInput = '101';
  sBoxOutput = '';
  sBox = [
    ['000', '001', '010', '011', '100', '101', '110', '111'],
    ['110', '101', '001', '000', '011', '010', '111', '100']
  ];

  // ECB vs CBC visualization
  selectedMode = 'ecb';
  patternedImage = [
    [1, 1, 0, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 1]
  ];

  ecbEncryptedImage = [
    [0, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0]
  ];

  cbcEncryptedImage = [
    [0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 0],
    [0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 0],
    [0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 0],
    [0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 0]
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.calculateXOR();
    this.lookupSBox();
  }

  calculateXOR() {
    if (this.xorInput1.length !== this.xorInput2.length) {
      this.xorResult = 'Inputs must be the same length';
      return;
    }

    let result = '';
    for (let i = 0; i < this.xorInput1.length; i++) {
      result += this.xorInput1[i] === this.xorInput2[i] ? '0' : '1';
    }
    this.xorResult = result;
  }

  lookupSBox() {
    // Simple S-Box lookup for 3-bit input
    const inputIndex = parseInt(this.sBoxInput, 2);
    if (inputIndex >= 0 && inputIndex < 8) {
      this.sBoxOutput = this.sBox[1][inputIndex];
    } else {
      this.sBoxOutput = 'Invalid input';
    }
  }

  toggleFeistelAnimation() {
    this.showFeistelAnimation = !this.showFeistelAnimation;
  }

  toggleSBoxAnimation() {
    this.showSBoxAnimation = !this.showSBoxAnimation;
  }

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

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

