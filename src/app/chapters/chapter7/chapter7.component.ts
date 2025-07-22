import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { FormsModule } from "@angular/forms"

interface AESState {
  state: number[][]
  roundKey: number[][]
}

interface AESRound {
  roundNumber: number
  beforeSubBytes: number[][]
  afterSubBytes: number[][]
  afterShiftRows: number[][]
  afterMixColumns: number[][]
  afterAddRoundKey: number[][]
  roundKey: number[][]
}

interface PerformanceMetrics {
  software: number
  hardware: number
  aesNI: number
}

@Component({
  selector: "app-chapter7",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapter7.component.html",
  styleUrls: ["./chapter7.component.css"],
})
export class Chapter7Component implements OnInit {
  currentSection = 1;
  totalSections = 10;

  // AES parameters
  plaintext = "00112233445566778899aabbccddeeff";
  key = "000102030405060708090a0b0c0d0e0f";
  keySize = 128;
  rounds = 10;

  // AES state visualization
  currentState: number[][] = [];
  originalState: number[][] = [];
  roundKeys: number[][][] = [];
  encryptionRounds: AESRound[] = [];
  currentRound = 0;
  currentStep = 0;

  // Complete AES S-Box (256 values)
  sBox = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
  ];

  // MixColumns matrix
  mixColumnsMatrix = [
    [0x02, 0x03, 0x01, 0x01],
    [0x01, 0x02, 0x03, 0x01],
    [0x01, 0x01, 0x02, 0x03],
    [0x03, 0x01, 0x01, 0x02],
  ];

  // Round constants for key expansion
  rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

  // Performance metrics
  performanceMetrics: PerformanceMetrics = {
    software: 0,
    hardware: 0,
    aesNI: 0,
  };

  // Security analysis
  securityLevels = [
    { keySize: 128, bruteForce: "2^128", quantumSecurity: "64 bits", status: "Secure" },
    { keySize: 192, bruteForce: "2^192", quantumSecurity: "96 bits", status: "Secure" },
    { keySize: 256, bruteForce: "2^256", quantumSecurity: "128 bits", status: "Quantum-Safe" },
  ];

  // Animation control
  isAnimating = false;
  animationSpeed = 1000;
  isPaused = false;
  showStepByStep = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeAES();
    this.simulatePerformance();
  }

  // Initialize AES demonstration
  initializeAES(): void {
    this.currentState = this.hexStringToState(this.plaintext);
    this.originalState = this.deepCopyState(this.currentState);
    this.generateRoundKeys();
    this.performFullEncryption();
  }

  // Convert hex string to 4x4 state matrix
  hexStringToState(hexString: string): number[][] {
    const bytes: number[] = [];
    for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    const state: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        state[row][col] = bytes[col * 4 + row];
      }
    }
    return state;
  }

  // Deep copy state matrix
  deepCopyState(state: number[][]): number[][] {
    return state.map(row => [...row]);
  }

  // SubBytes transformation
  subBytes(state: number[][]): number[][] {
    const newState = this.deepCopyState(state);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        newState[row][col] = this.sBox[state[row][col]];
      }
    }
    return newState;
  }

  // ShiftRows transformation
  shiftRows(state: number[][]): number[][] {
    const newState = this.deepCopyState(state);
    // Row 1
    newState[1] = [...newState[1].slice(1), newState[1][0]];
    // Row 2
    newState[2] = [...newState[2].slice(2), ...newState[2].slice(0, 2)];
    // Row 3
    newState[3] = [newState[3][3], ...newState[3].slice(0, 3)];
    return newState;
  }

  // Galois Field multiplication
  gfMultiply(a: number, b: number): number {
    let result = 0;
    for (let i = 0; i < 8; i++) {
      if (b & 1) result ^= a;
      const carry = a & 0x80;
      a = (a << 1) & 0xff;
      if (carry) a ^= 0x1b;
      b >>= 1;
    }
    return result;
  }

  // MixColumns transformation
  mixColumns(state: number[][]): number[][] {
    const newState: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        for (let k = 0; k < 4; k++) {
          newState[row][col] ^= this.gfMultiply(
            this.mixColumnsMatrix[row][k],
            state[k][col]
          );
        }
      }
    }
    return newState;
  }

  // AddRoundKey transformation
  addRoundKey(state: number[][], roundKey: number[][]): number[][] {
    const newState = this.deepCopyState(state);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        newState[row][col] ^= roundKey[row][col];
      }
    }
    return newState;
  }

  // Generate round keys
  generateRoundKeys(): void {
    const keyBytes: number[] = [];
    for (let i = 0; i < this.key.length; i += 2) {
      keyBytes.push(parseInt(this.key.substr(i, 2), 16));
    }

    this.roundKeys = [];
    const words: number[][] = [];

    // Initial key words
    for (let i = 0; i < 4; i++) {
      words.push([
        keyBytes[i * 4],
        keyBytes[i * 4 + 1],
        keyBytes[i * 4 + 2],
        keyBytes[i * 4 + 3],
      ]);
    }

    // Generate additional words
    for (let i = 4; i < 4 * (this.rounds + 1); i++) {
      const temp: number[] = [...words[i - 1]];

      if (i % 4 === 0) {
        // RotWord
        const t = temp.shift()!;
        temp.push(t);
        // SubWord
        for (let j = 0; j < 4; j++) {
          temp[j] = this.sBox[temp[j]];
        }
        // XOR with Rcon
        temp[0] ^= this.rcon[i / 4 - 1];
      }

      const newWord: number[] = [];
      for (let j = 0; j < 4; j++) {
        newWord[j] = words[i - 4][j] ^ temp[j];
      }
      words.push(newWord);
    }

    // Convert words to round key matrices
    for (let round = 0; round <= this.rounds; round++) {
      const roundKey: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
          roundKey[row][col] = words[round * 4 + col][row];
        }
      }
      this.roundKeys.push(roundKey);
    }
  }

  // Perform full AES encryption
  performFullEncryption(): void {
    this.encryptionRounds = [];
    let state = this.addRoundKey(this.deepCopyState(this.originalState), this.roundKeys[0]);

    for (let round = 1; round < this.rounds; round++) {
      const beforeSub = this.deepCopyState(state);
      const afterSub = this.subBytes(state);
      const afterShift = this.shiftRows(afterSub);
      const afterMix = this.mixColumns(afterShift);
      const afterKey = this.addRoundKey(afterMix, this.roundKeys[round]);

      this.encryptionRounds.push({
        roundNumber: round,
        beforeSubBytes: beforeSub,
        afterSubBytes: afterSub,
        afterShiftRows: afterShift,
        afterMixColumns: afterMix,
        afterAddRoundKey: afterKey,
        roundKey: this.roundKeys[round],
      });

      state = afterKey;
    }

    // Final round (no MixColumns)
    const beforeSub = this.deepCopyState(state);
    const afterSub = this.subBytes(state);
    const afterShift = this.shiftRows(afterSub);
    const afterKey = this.addRoundKey(afterShift, this.roundKeys[this.rounds]);

    this.encryptionRounds.push({
      roundNumber: this.rounds,
      beforeSubBytes: beforeSub,
      afterSubBytes: afterSub,
      afterShiftRows: afterShift,
      afterMixColumns: afterShift,       // no MixColumns here
      afterAddRoundKey: afterKey,
      roundKey: this.roundKeys[this.rounds],
    });

    this.currentState = afterKey;
  }

  // Simulate performance metrics
  simulatePerformance(): void {
    this.performanceMetrics = {
      software: Math.random() * 100 + 50,
      hardware: Math.random() * 1000 + 500,
      aesNI: Math.random() * 5000 + 2000,
    };
  }

  // Enhanced animation control
  async animateEncryption(): Promise<void> {
    this.isAnimating = true;
    this.isPaused = false;
    this.currentRound = 0;
    this.currentStep = 0;

    // Start with original state
    this.currentState = this.deepCopyState(this.originalState);
    await this.delayIfNotPaused(this.animationSpeed);

    // Initial AddRoundKey (Round 0)
    this.currentStep = 0; // Show "Initial AddRoundKey"
    this.currentState = this.addRoundKey(this.currentState, this.roundKeys[0]);
    await this.delayIfNotPaused(this.animationSpeed);

    // Process each round
    for (let i = 0; i < this.encryptionRounds.length; i++) {
      if (!this.isAnimating) break; // Allow stopping animation
      
      this.currentRound = i + 1;
      const roundData = this.encryptionRounds[i];

      // Show state before SubBytes
      this.currentStep = 0; // Before any transformation
      this.currentState = roundData.beforeSubBytes;
      await this.delayIfNotPaused(this.animationSpeed / 2);

      // SubBytes step
      this.currentStep = 1;
      this.currentState = roundData.afterSubBytes;
      await this.delayIfNotPaused(this.animationSpeed);

      // ShiftRows step
      this.currentStep = 2;
      this.currentState = roundData.afterShiftRows;
      await this.delayIfNotPaused(this.animationSpeed);

      // MixColumns step (skip for final round)
      if (i < this.encryptionRounds.length - 1) {
        this.currentStep = 3;
        this.currentState = roundData.afterMixColumns;
        await this.delayIfNotPaused(this.animationSpeed);
      }

      // AddRoundKey step
      this.currentStep = 4;
      this.currentState = roundData.afterAddRoundKey;
      await this.delayIfNotPaused(this.animationSpeed);
    }

    this.isAnimating = false;
    this.isPaused = false;
  }

  async delayIfNotPaused(ms: number): Promise<void> {
    while (this.isPaused && this.isAnimating) {
      await this.delay(100); // Check every 100ms if still paused
    }
    if (this.isAnimating) {
      await this.delay(ms);
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  pauseAnimation(): void {
    this.isPaused = !this.isPaused;
  }

  stopAnimation(): void {
    this.isAnimating = false;
    this.isPaused = false;
    this.currentRound = 0;
    this.currentStep = 0;
    this.currentState = this.deepCopyState(this.originalState);
  }

  setAnimationSpeed(speed: number): void {
    this.animationSpeed = speed;
  }

  // Navigation
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextSection(): void {
    if (this.currentSection < this.totalSections) {
      this.currentSection++;
      this.scrollToTop();
    }
  }

  previousSection(): void {
    if (this.currentSection > 1) {
      this.currentSection--;
      this.scrollToTop();
    }
  }

  goToSection(section: number): void {
    this.currentSection = section;
    this.scrollToTop();
  }

  backToDashboard(): void {
    this.router.navigate(["/dashboard"]);
  }

  onParameterChange(): void {
    this.initializeAES();
  }

  onKeySizeChange(): void {
    switch (this.keySize) {
      case 128:
        this.rounds = 10;
        this.key = "000102030405060708090a0b0c0d0e0f";
        break;
      case 192:
        this.rounds = 12;
        this.key = "000102030405060708090a0b0c0d0e0f1011121314151617";
        break;
      case 256:
        this.rounds = 14;
        this.key = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
        break;
    }
    this.initializeAES();
  }

  formatHex(value: number): string {
    return value.toString(16).padStart(2, "0").toUpperCase();
  }

  getStepName(step: number): string {
    if (this.currentRound === 0) {
      return step === 0 ? "Initial AddRoundKey" : "Initial State";
    }
    
    switch (step) {
      case 0: return `Round ${this.currentRound} - Start`;
      case 1: return `Round ${this.currentRound} - SubBytes`;
      case 2: return `Round ${this.currentRound} - ShiftRows`;
      case 3: return `Round ${this.currentRound} - MixColumns`;
      case 4: return `Round ${this.currentRound} - AddRoundKey`;
      default: return "Unknown";
    }
  }

  getCurrentRoundKey(): number[][] {
    if (this.roundKeys.length > this.currentRound) {
      return this.roundKeys[this.currentRound];
    }
    return [];
  }

  getAnimationProgress(): number {
    if (!this.isAnimating) return 0;
    const totalSteps = this.rounds * 4 + 1; // Each round has 4 steps + initial
    const currentSteps = this.currentRound * 4 + this.currentStep;
    return Math.min((currentSteps / totalSteps) * 100, 100);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}



