import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

interface ModeComparison {
  mode: string;
  type: string;
  parallelizable: boolean;
  errorPropagation: string;
  useCase: string;
}

interface CipherResult {
  plaintext: string;
  ciphertext: string;
  keystream?: string;
  iv?: string;
}

interface PatternResults {
  ecb: string;
  cbc: string;
  ctr: string;
}

@Component({
  selector: "app-chapter8",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapter8.component.html",
  styleUrls: ["./chapter8.component.css"],
})
export class Chapter8Component implements OnInit {
  currentSection = 1;
  totalSections = 10;

  // Common cipher parameters
  plaintext = "HELLO WORLD HELLO WORLD";
  key = "SECRETKEY";
  iv = "INITVECT";
  blockSize = 8;

  // Mode demonstrations
  ecbResult: CipherResult = { plaintext: "", ciphertext: "" };
  cbcResult: CipherResult = { plaintext: "", ciphertext: "", iv: "" };
  cfbResult: CipherResult = { plaintext: "", ciphertext: "", keystream: "" };
  ofbResult: CipherResult = { plaintext: "", ciphertext: "", keystream: "" };
  ctrResult: CipherResult = { plaintext: "", ciphertext: "", keystream: "" };

  // Mode comparison data
  modeComparisons: ModeComparison[] = [
    {
      mode: "ECB",
      type: "Block",
      parallelizable: true,
      errorPropagation: "Single block only",
      useCase: "Very small or random blocks",
    },
    {
      mode: "CBC",
      type: "Block-chaining",
      parallelizable: false,
      errorPropagation: "Two-block ripple",
      useCase: "File encryption, TLS (legacy)",
    },
    {
      mode: "CFB",
      type: "Self-sync stream",
      parallelizable: false,
      errorPropagation: "Limited (< segment size)",
      useCase: "Real-time byte streams",
    },
    {
      mode: "OFB",
      type: "Synchronous",
      parallelizable: true,
      errorPropagation: "Single-bit only",
      useCase: "No-latency-sensitive channels",
    },
    {
      mode: "CTR",
      type: "Synchronous",
      parallelizable: true,
      errorPropagation: "Single-block only",
      useCase: "High-speed network protocols",
    },
  ];

  // RC4 demonstration
  rc4Key = "SECRET";
  rc4Plaintext = "HELLO";
  rc4Keystream = "";
  rc4Ciphertext = "";
  rc4State: number[] = [];

  // A5/1 demonstration
  a51Lfsr1 = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1];
  a51Lfsr2 = [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1];
  a51Lfsr3 = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1];
  a51Output: number[] = [];

  // Error propagation demonstration
  errorPosition = 0;
  originalCiphertext = "";
  corruptedCiphertext = "";
  errorResults: { [key: string]: string } = {};

  // Pattern analysis
  patternInput = "AAAA BBBB AAAA CCCC";
  patternResults: PatternResults = { ecb: "", cbc: "", ctr: "" };

  constructor(private router: Router) {}

  ngOnInit() {
    this.demonstrateAllModes();
    this.initializeRC4();
    this.simulateA51();
    this.analyzePatterns();
  }

  // Simple block cipher simulation (toy cipher for demonstration)
  simpleBlockCipher(block: string, key: string, encrypt = true): string {
    const keyCode = key.charCodeAt(0) % 26;
    let result = "";

    for (let i = 0; i < block.length; i++) {
      const char = block[i];
      if (char.match(/[A-Z]/)) {
        const charCode = char.charCodeAt(0) - 65;
        const newCharCode = encrypt
          ? (charCode + keyCode) % 26
          : (charCode - keyCode + 26) % 26;
        result += String.fromCharCode(newCharCode + 65);
      } else {
        result += char;
      }
    }
    return result;
  }

  // XOR operation for strings
  xorStrings(str1: string, str2: string): string {
    let result = "";
    const maxLength = Math.max(str1.length, str2.length);

    for (let i = 0; i < maxLength; i++) {
      const char1 = i < str1.length ? str1.charCodeAt(i) : 0;
      const char2 = i < str2.length ? str2.charCodeAt(i) : 0;
      result += String.fromCharCode(char1 ^ char2);
    }
    return result;
  }

  // Pad string to block size
  padToBlockSize(text: string, blockSize: number): string {
    const padding = blockSize - (text.length % blockSize);
    return text + " ".repeat(padding);
  }

  // Split text into blocks
  splitIntoBlocks(text: string, blockSize: number): string[] {
    const blocks: string[] = [];
    for (let i = 0; i < text.length; i += blockSize) {
      blocks.push(text.substring(i, i + blockSize));
    }
    return blocks;
  }

  // ECB Mode implementation
  encryptECB(plaintext: string, key: string): CipherResult {
    const paddedText = this.padToBlockSize(plaintext, this.blockSize);
    const blocks = this.splitIntoBlocks(paddedText, this.blockSize);
    let ciphertext = "";

    for (const block of blocks) {
      ciphertext += this.simpleBlockCipher(block, key, true);
    }

    return {
      plaintext: paddedText,
      ciphertext,
    };
  }

  // CBC Mode implementation
  encryptCBC(plaintext: string, key: string, iv: string): CipherResult {
    const paddedText = this.padToBlockSize(plaintext, this.blockSize);
    const blocks = this.splitIntoBlocks(paddedText, this.blockSize);
    let ciphertext = "";
    let previousBlock = iv.padEnd(this.blockSize, " ");

    for (const block of blocks) {
      const xorBlock = this.xorStrings(block, previousBlock);
      const encryptedBlock = this.simpleBlockCipher(xorBlock, key, true);
      ciphertext += encryptedBlock;
      previousBlock = encryptedBlock;
    }

    return {
      plaintext: paddedText,
      ciphertext,
      iv,
    };
  }

  // CFB Mode implementation
  encryptCFB(plaintext: string, key: string, iv: string): CipherResult {
    let ciphertext = "";
    let keystream = "";
    let feedbackRegister = iv.padEnd(this.blockSize, " ");

    for (let i = 0; i < plaintext.length; i += this.blockSize) {
      const block = plaintext.substring(i, i + this.blockSize);
      const encryptedFeedback = this.simpleBlockCipher(feedbackRegister, key, true);
      const cipherBlock = this.xorStrings(block, encryptedFeedback);

      ciphertext += cipherBlock;
      keystream += encryptedFeedback;
      feedbackRegister = cipherBlock.padEnd(this.blockSize, " ");
    }

    return {
      plaintext,
      ciphertext,
      keystream,
    };
  }

  // OFB Mode implementation
  encryptOFB(plaintext: string, key: string, iv: string): CipherResult {
    let ciphertext = "";
    let keystream = "";
    let outputRegister = iv.padEnd(this.blockSize, " ");

    for (let i = 0; i < plaintext.length; i += this.blockSize) {
      const block = plaintext.substring(i, i + this.blockSize);
      outputRegister = this.simpleBlockCipher(outputRegister, key, true);
      const cipherBlock = this.xorStrings(block, outputRegister);

      ciphertext += cipherBlock;
      keystream += outputRegister;
    }

    return {
      plaintext,
      ciphertext,
      keystream,
    };
  }

  // CTR Mode implementation
  encryptCTR(plaintext: string, key: string, nonce: string): CipherResult {
    let ciphertext = "";
    let keystream = "";

    for (let i = 0; i < plaintext.length; i += this.blockSize) {
      const block = plaintext.substring(i, i + this.blockSize);
      const counter = (nonce + i.toString().padStart(4, "0")).substring(0, this.blockSize);
      const encryptedCounter = this.simpleBlockCipher(counter, key, true);
      const cipherBlock = this.xorStrings(block, encryptedCounter);

      ciphertext += cipherBlock;
      keystream += encryptedCounter;
    }

    return {
      plaintext,
      ciphertext,
      keystream,
    };
  }

  // Demonstrate all modes
  demonstrateAllModes() {
    this.ecbResult = this.encryptECB(this.plaintext, this.key);
    this.cbcResult = this.encryptCBC(this.plaintext, this.key, this.iv);
    this.cfbResult = this.encryptCFB(this.plaintext, this.key, this.iv);
    this.ofbResult = this.encryptOFB(this.plaintext, this.key, this.iv);
    this.ctrResult = this.encryptCTR(this.plaintext, this.key, this.iv);
  }

  // RC4 implementation (simplified)
  initializeRC4() {
    this.rc4State = Array.from({ length: 256 }, (_, i) => i);
    let j = 0;

    for (let i = 0; i < 256; i++) {
      j = (j + this.rc4State[i] + this.rc4Key.charCodeAt(i % this.rc4Key.length)) % 256;
      [this.rc4State[i], this.rc4State[j]] = [this.rc4State[j], this.rc4State[i]];
    }

    this.generateRC4Keystream();
  }

  generateRC4Keystream() {
    const state = [...this.rc4State];
    let i = 0;
    let j = 0;
    this.rc4Keystream = "";
    this.rc4Ciphertext = "";

    for (let k = 0; k < this.rc4Plaintext.length; k++) {
      i = (i + 1) % 256;
      j = (j + state[i]) % 256;
      [state[i], state[j]] = [state[j], state[i]];

      const keystreamByte = state[(state[i] + state[j]) % 256];
      this.rc4Keystream += keystreamByte.toString(16).padStart(2, "0") + " ";

      const plaintextByte = this.rc4Plaintext.charCodeAt(k);
      const ciphertextByte = plaintextByte ^ keystreamByte;
      this.rc4Ciphertext += String.fromCharCode(ciphertextByte);
    }
  }

  // A5/1 simulation
  simulateA51() {
    this.a51Output = [];
    const lfsr1 = [...this.a51Lfsr1];
    const lfsr2 = [...this.a51Lfsr2];
    const lfsr3 = [...this.a51Lfsr3];

    for (let step = 0; step < 20; step++) {
      const clock1 = lfsr1[8];
      const clock2 = lfsr2[10];
      const clock3 = lfsr3[10];
      const majority = clock1 + clock2 + clock3 >= 2 ? 1 : 0;

      if (clock1 === majority) {
        const feedback1 = lfsr1[13] ^ lfsr1[16] ^ lfsr1[17] ^ lfsr1[18];
        lfsr1.unshift(feedback1);
        lfsr1.pop();
      }
      if (clock2 === majority) {
        const feedback2 = lfsr2[20] ^ lfsr2[21];
        lfsr2.unshift(feedback2);
        lfsr2.pop();
      }
      if (clock3 === majority) {
        const feedback3 = lfsr3[7] ^ lfsr3[20] ^ lfsr3[21] ^ lfsr3[22];
        lfsr3.unshift(feedback3);
        lfsr3.pop();
      }

      const outputBit = lfsr1[18] ^ lfsr2[21] ^ lfsr3[22];
      this.a51Output.push(outputBit);
    }
  }

  // Pattern analysis
  analyzePatterns() {
    this.patternResults.ecb = this.encryptECB(this.patternInput, this.key).ciphertext;
    this.patternResults.cbc = this.encryptCBC(this.patternInput, this.key, this.iv).ciphertext;
    this.patternResults.ctr = this.encryptCTR(this.patternInput, this.key, this.iv).ciphertext;
  }

  // Error propagation simulation
  simulateErrorPropagation(mode: string) {
    let originalResult: CipherResult;

    switch (mode) {
      case "ECB":
        originalResult = this.encryptECB(this.plaintext, this.key);
        break;
      case "CBC":
        originalResult = this.encryptCBC(this.plaintext, this.key, this.iv);
        break;
      case "CFB":
        originalResult = this.encryptCFB(this.plaintext, this.key, this.iv);
        break;
      default:
        return;
    }

    this.originalCiphertext = originalResult.ciphertext;
    this.corruptedCiphertext = this.introduceError(this.originalCiphertext, this.errorPosition);
    this.errorResults[mode] = this.simulateDecryptionWithError(mode, this.corruptedCiphertext);
  }

  introduceError(ciphertext: string, position: number): string {
    if (position >= ciphertext.length) return ciphertext;
    const chars = ciphertext.split("");
    chars[position] = chars[position] === "A" ? "B" : "A";
    return chars.join("");
  }

  simulateDecryptionWithError(mode: string, corruptedCiphertext: string): string {
    const errorBlock = Math.floor(this.errorPosition / this.blockSize);
    switch (mode) {
      case "ECB":
        return `Error affects block ${errorBlock + 1} only`;
      case "CBC":
        return `Error affects blocks ${errorBlock + 1} and ${errorBlock + 2}`;
      case "CFB":
        return `Error affects current and next ${this.blockSize - 1} bits`;
      default:
        return "Unknown mode";
    }
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

  backToDashboard() {
    this.router.navigate(["/dashboard"]);
  }

  // Interactive handlers
  onParameterChange() {
    this.demonstrateAllModes();
    this.analyzePatterns();
  }

  onRC4ParameterChange() {
    this.initializeRC4();
  }

  onErrorPositionChange() {
    this.simulateErrorPropagation("ECB");
    this.simulateErrorPropagation("CBC");
    this.simulateErrorPropagation("CFB");
  }
}

