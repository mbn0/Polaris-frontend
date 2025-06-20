import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TimelineEvent {
  year: string;
  event: string;
}

interface DESCharacteristic {
  property: string;
  value: string;
}

interface SBoxEntry {
  input: string;
  row: number;
  col: number;
  output: string;
}

@Component({
  selector: 'app-chapter6',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter6.component.html',
  styleUrls: ['./chapter6.component.css']
})
export class Chapter6Component implements OnInit {
  currentSection = 1;
  totalSections = 9;

  // Timeline data
  timelineEvents: TimelineEvent[] = [
    { year: '1973', event: 'NBS issues call for proposals' },
    { year: '1974–75', event: 'IBM\'s submission refined; NSA tweaks key size' },
    { year: '1977', event: 'FIPS 46 formalizes DES' },
    { year: '1999', event: 'Official withdrawal of DES in favor of AES' }
  ];

  // DES characteristics
  desCharacteristics: DESCharacteristic[] = [
    { property: 'Cipher Type', value: 'Symmetric, block cipher' },
    { property: 'Block Size', value: '64 bits' },
    { property: 'Key Length', value: '56 bits (plus 8 parity bits)' },
    { property: 'Structure', value: '16-round Feistel network' },
    { property: 'Standard', value: 'FIPS 46-3 (withdrawn in 2005)' }
  ];

  // Interactive elements
  showFeistelAnimation = false;
  showKeyScheduleAnimation = false;
  showSBoxDemo = false;

  // Feistel round simulation
  leftHalf = '11010011';
  rightHalf = '10110101';
  roundKey = '110101001011';
  currentRound = 1;

  // S-Box demonstration
  sBoxInput = '100011';
  sBoxNumber = 1;
  sBoxOutput = '';

  // Sample S-Box 1 (simplified 4x4 for demonstration)
  sBox1 = [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
  ];

  // Key schedule demonstration
  masterKey = '0001001100110100010101110111100110011011101111001101111111110001';
  currentKeyScheduleStep = 0;
  keyScheduleSteps = [
    'Original 64-bit key',
    'Remove parity bits (56 bits)',
    'Apply PC-1 permutation',
    'Split into C₀ and D₀ (28 bits each)',
    'Left shift and apply PC-2'
  ];

  // Meet-in-the-middle demonstration
  plaintext = '0123456789ABCDEF';
  key1 = 'FEDCBA9876543210';
  key2 = '0123456789ABCDEF';
  intermediateValues: string[] = [];
  showMeetInMiddle = false;

  // Performance comparison
  performanceData = [
    { cipher: 'DES', keySize: 56, blockSize: 64, speed: '100 MB/s', security: 'Broken' },
    { cipher: '3DES', keySize: 168, blockSize: 64, speed: '33 MB/s', security: 'Deprecated' },
    { cipher: 'AES-128', keySize: 128, blockSize: 128, speed: '500 MB/s', security: 'Secure' },
    { cipher: 'AES-256', keySize: 256, blockSize: 128, speed: '400 MB/s', security: 'Secure' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.calculateSBoxOutput();
  }

  // Feistel round simulation
  simulateFeistelRound() {
    // Simplified Feistel round for demonstration
    const expandedRight = this.expandBits(this.rightHalf);
    const xorResult = this.xorStrings(expandedRight, this.roundKey);
    const sBoxResult = this.applySBoxes(xorResult);
    const permutedResult = this.permuteResult(sBoxResult);
    const newRight = this.xorStrings(this.leftHalf, permutedResult);

    // Update for next round
    this.leftHalf = this.rightHalf;
    this.rightHalf = newRight;
    this.currentRound++;

    if (this.currentRound > 16) {
      this.currentRound = 1;
      this.resetFeistelDemo();
    }
  }

  resetFeistelDemo() {
    this.leftHalf = '11010011';
    this.rightHalf = '10110101';
    this.currentRound = 1;
  }

  // Helper functions for Feistel simulation
  expandBits(bits: string): string {
    // Simplified expansion from 8 to 12 bits
    return bits + bits.substring(0, 4);
  }

  xorStrings(str1: string, str2: string): string {
    let result = '';
    const minLength = Math.min(str1.length, str2.length);
    for (let i = 0; i < minLength; i++) {
      result += str1[i] === str2[i] ? '0' : '1';
    }
    return result;
  }

  applySBoxes(input: string): string {
    // Simplified S-box application
    return input.substring(0, Math.min(8, input.length)); // Simplified for demo
  }

  permuteResult(input: string): string {
    // Simplified permutation
    return input.split('').reverse().join('');
  }

  // S-Box demonstration
  calculateSBoxOutput() {
    if (this.sBoxInput.length !== 6) {
      this.sBoxOutput = 'Input must be 6 bits';
      return;
    }

    // Validate input contains only 0s and 1s
    if (!/^[01]+$/.test(this.sBoxInput)) {
      this.sBoxOutput = 'Input must contain only 0s and 1s';
      return;
    }

    const row = parseInt(this.sBoxInput[0] + this.sBoxInput[5], 2);
    const col = parseInt(this.sBoxInput.substring(1, 5), 2);

    if (row >= 0 && row < 4 && col >= 0 && col < 16) {
      const output = this.sBox1[row][col];
      this.sBoxOutput = output.toString(2).padStart(4, '0');
    } else {
      this.sBoxOutput = 'Invalid input';
    }
  }

  // Key schedule demonstration
  nextKeyScheduleStep() {
    if (this.keyScheduleSteps.length > 0) {
      this.currentKeyScheduleStep = (this.currentKeyScheduleStep + 1) % this.keyScheduleSteps.length;
    }
  }

  resetKeySchedule() {
    this.currentKeyScheduleStep = 0;
  }

  // Meet-in-the-middle demonstration
  demonstrateMeetInMiddle() {
    this.showMeetInMiddle = true;
    this.intermediateValues = [
      'E_K1(P) = A1B2C3D4',
      'E_K1(P) = E5F6A7B8',
      'E_K1(P) = 9C8D7E6F',
      'D_K2(C) = A1B2C3D4', // Match found!
      'D_K2(C) = 1F2E3D4C',
      'D_K2(C) = 5A6B7C8D'
    ];
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
    if (section >= 1 && section <= this.totalSections) {
      this.currentSection = section;
    }
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  toggleFeistelAnimation() {
    this.showFeistelAnimation = !this.showFeistelAnimation;
  }

  toggleKeyScheduleAnimation() {
    this.showKeyScheduleAnimation = !this.showKeyScheduleAnimation;
  }

  toggleSBoxDemo() {
    this.showSBoxDemo = !this.showSBoxDemo;
  }

  getSectionArray(): number[] {
    return Array.from({ length: this.totalSections }, (_, i) => i + 1);
  }

  // Additional helper methods for validation
  validateBinaryInput(input: string, expectedLength: number): boolean {
    return input.length === expectedLength && /^[01]+$/.test(input);
  }

  getRowFromSBoxInput(): number {
    if (this.sBoxInput.length >= 6) {
      return parseInt(this.sBoxInput[0] + this.sBoxInput[5], 2);
    }
    return 0;
  }

  getColFromSBoxInput(): number {
    if (this.sBoxInput.length >= 5) {
      return parseInt(this.sBoxInput.substring(1, 5), 2);
    }
    return 0;
  }
}
