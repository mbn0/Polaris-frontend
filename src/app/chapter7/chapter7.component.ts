import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink, Router } from "@angular/router"
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

interface AESState {
  state: number[][];
  roundKey: number[][];
}

interface AESRound {
  roundNumber: number;
  beforeSubBytes: number[][];
  afterSubBytes: number[][];
  afterShiftRows: number[][];
  afterMixColumns: number[][];
  afterAddRoundKey: number[][];
  roundKey: number[][];
}

interface PerformanceMetrics {
  software: number;
  hardware: number;
  aesNI: number;
}

@Component({
  selector: "app-chapter7",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

  // S-Box (simplified for demonstration)
  sBox = [
    0x63, 0x7c, 0x77, /* ... etc ... */ 0xbb, 0x16,
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

  // Animation control
  async animateEncryption(): Promise<void> {
    this.isAnimating = true;
    this.currentRound = 0;
    this.currentStep = 0;

    this.currentState = this.deepCopyState(this.originalState);
    await this.delay(this.animationSpeed);

    this.currentState = this.addRoundKey(this.currentState, this.roundKeys[0]);
    await this.delay(this.animationSpeed);

    for (let i = 0; i < this.encryptionRounds.length; i++) {
      this.currentRound = i + 1;
      const roundData = this.encryptionRounds[i];

      this.currentStep = 1;
      this.currentState = roundData.afterSubBytes;
      await this.delay(this.animationSpeed);

      this.currentStep = 2;
      this.currentState = roundData.afterShiftRows;
      await this.delay(this.animationSpeed);

      if (i < this.encryptionRounds.length - 1) {
        this.currentStep = 3;
        this.currentState = roundData.afterMixColumns;
        await this.delay(this.animationSpeed);
      }

      this.currentStep = 4;
      this.currentState = roundData.afterAddRoundKey;
      await this.delay(this.animationSpeed);
    }

    this.isAnimating = false;
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Navigation
  nextSection(): void {
    if (this.currentSection < this.totalSections) this.currentSection++;
  }

  previousSection(): void {
    if (this.currentSection > 1) this.currentSection--;
  }

  goToSection(section: number): void {
    this.currentSection = section;
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
    switch (step) {
      case 0: return "Initial State";
      case 1: return "SubBytes";
      case 2: return "ShiftRows";
      case 3: return "MixColumns";
      case 4: return "AddRoundKey";
      default: return "Unknown";
    }
  }
}



