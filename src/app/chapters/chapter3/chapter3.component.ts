import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface AttackModel {
  name: string;
  description: string;
}

interface FrequencyData {
  letter: string;
  frequency: number;
  expected: number;
}

interface CipherExample {
  name: string;
  plaintext: string;
  key: string;
  ciphertext: string;
}

@Component({
  selector: 'app-chapter3',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './chapter3.component.html',
  styleUrls: ['./chapter3.component.css']
})
export class Chapter3Component implements OnInit {
  currentSection = 1;
  totalSections = 7;

  // Attack models
  attackModels: AttackModel[] = [
    {
      name: 'Ciphertext-Only',
      description: 'Attacker sees only ciphertexts, must infer plaintexts (or key)'
    },
    {
      name: 'Known-Plaintext',
      description: 'Attacker knows some plaintext/ciphertext pairs, uses them to break others'
    },
    {
      name: 'Chosen-Plaintext',
      description: 'Attacker can encrypt arbitrary plaintexts to study resulting ciphertexts'
    },
    {
      name: 'Chosen-Ciphertext',
      description: 'Attacker obtains decryptions of chosen ciphertexts to reveal key quirks'
    }
  ];

  // Caesar cipher demo
  caesarPlaintext = 'HELLO';
  caesarKey = 3;
  caesarCiphertext = '';

  // Multiplicative cipher demo
  multiplicativePlaintext = 'SCOTT';
  multiplicativeKey = 7;
  multiplicativeCiphertext = '';
  validMultiplicativeKeys = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

  // Vigenère cipher demo
  vigenerePlaintext = 'SHEISLISTENING';
  vigenereKey = 'PASCAL';
  vigenereCiphertext = '';

  // Rail fence cipher demo
  railFencePlaintext = 'MEETMEATTHEPARK';
  railFenceRails = 3;
  railFenceCiphertext = '';

  // Frequency analysis
  frequencyText = 'KHOOR ZRUOG WKLV LV D VHFUHW PHVVDJH';
  frequencyData: FrequencyData[] = [];
  expectedFrequencies = {
    'A': 8.12, 'B': 1.49, 'C': 2.78, 'D': 4.25, 'E': 12.02, 'F': 2.23,
    'G': 2.02, 'H': 6.09, 'I': 6.97, 'J': 0.15, 'K': 0.77, 'L': 4.03,
    'M': 2.41, 'N': 6.75, 'O': 7.51, 'P': 1.93, 'Q': 0.10, 'R': 5.99,
    'S': 6.33, 'T': 9.06, 'U': 2.76, 'V': 0.98, 'W': 2.36, 'X': 0.15,
    'Y': 1.97, 'Z': 0.07
  };

  // Kasiski examination
  kasiskiText = 'CHREEVOAHMAERATBIAXXWTNXBEEOPHBSBQMQEQERBWRVXUOAKXAOSXXWEAHBWGJMMQMNKGRFVGXWTRZXWIAKLXFPSKAUTEMNDCMGTSXMXBTUIADNGMGPSRELXNJELXVRVPRTULHDNQWTWDTYGBPHXTFALJHASVBFXNGLLCHRZBWELEKMSJIKNBHWRJGNMGJSGLXFEYPHAGNRBIEQJTAMRVLCRREMNDGLXRRIMGNSNRWCHRQHAEYEVTAQEBBIPEEWEVKAKOEWADREMXMTBHHCHRTKDNVRZCHRCLQOHPWQAIIWXNRMGWOIIFKEE';
  kasiskiResults: { ngram: string; positions: number[]; distances: number[] }[] = [];

  // Enigma simulation
  enigmaPlaintext = 'HELLO';
  enigmaRotorPositions = 'AAA';
  enigmaCiphertext = '';

  // Interactive demonstrations
  showFrequencyChart = false;
  showKasiskiAnalysis = false;
  showEnigmaDemo = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.calculateCaesarCipher();
    this.calculateMultiplicativeCipher();
    this.calculateVigenereCipher();
    this.calculateRailFenceCipher();
    this.calculateFrequencyAnalysis();
  }

  // Caesar cipher implementation
  calculateCaesarCipher() {
    this.caesarCiphertext = this.caesarPlaintext
      .toUpperCase()
      .split('')
      .map(char => {
        if (char >= 'A' && char <= 'Z') {
          return String.fromCharCode(((char.charCodeAt(0) - 65 + this.caesarKey) % 26) + 65);
        }
        return char;
      })
      .join('');
  }

  // Multiplicative cipher implementation
  calculateMultiplicativeCipher() {
    this.multiplicativeCiphertext = this.multiplicativePlaintext
      .toUpperCase()
      .split('')
      .map(char => {
        if (char >= 'A' && char <= 'Z') {
          const pos = char.charCodeAt(0) - 65;
          const newPos = (this.multiplicativeKey * pos) % 26;
          return String.fromCharCode(newPos + 65);
        }
        return char;
      })
      .join('');
  }

  // Vigenère cipher implementation
  calculateVigenereCipher() {
    const key = this.vigenereKey.toUpperCase();
    let keyIndex = 0;

    this.vigenereCiphertext = this.vigenerePlaintext
      .toUpperCase()
      .split('')
      .map(char => {
        if (char >= 'A' && char <= 'Z') {
          const plainPos = char.charCodeAt(0) - 65;
          const keyPos = key[keyIndex % key.length].charCodeAt(0) - 65;
          const cipherPos = (plainPos + keyPos) % 26;
          keyIndex++;
          return String.fromCharCode(cipherPos + 65);
        }
        return char;
      })
      .join('');
  }

  // Rail fence cipher implementation
  calculateRailFenceCipher() {
    const text = this.railFencePlaintext.replace(/\s/g, '').toUpperCase();
    const rails: string[][] = Array(this.railFenceRails).fill(null).map(() => []);

    let rail = 0;
    let direction = 1;

    for (let i = 0; i < text.length; i++) {
      rails[rail].push(text[i]);
      rail += direction;

      if (rail === this.railFenceRails - 1 || rail === 0) {
        direction *= -1;
      }
    }

    this.railFenceCiphertext = rails.map(rail => rail.join('')).join('');
  }

  // Frequency analysis
  calculateFrequencyAnalysis() {
    const text = this.frequencyText.replace(/[^A-Z]/g, '');
    const counts: { [key: string]: number } = {};

    // Count frequencies
    for (const char of text) {
      counts[char] = (counts[char] || 0) + 1;
    }

    // Calculate percentages and create frequency data
    this.frequencyData = Object.keys(this.expectedFrequencies).map(letter => ({
      letter,
      frequency: ((counts[letter] || 0) / text.length) * 100,
      expected: this.expectedFrequencies[letter as keyof typeof this.expectedFrequencies]
    }));
  }

  // Kasiski examination
  performKasiskiAnalysis() {
    this.kasiskiResults = [];
    const text = this.kasiskiText.toUpperCase();
    const ngramLength = 3;

    // Find repeated n-grams
    const ngramPositions: { [key: string]: number[] } = {};

    for (let i = 0; i <= text.length - ngramLength; i++) {
      const ngram = text.substring(i, i + ngramLength);
      if (!ngramPositions[ngram]) {
        ngramPositions[ngram] = [];
      }
      ngramPositions[ngram].push(i);
    }

    // Calculate distances for repeated n-grams
    Object.keys(ngramPositions).forEach(ngram => {
      const positions = ngramPositions[ngram];
      if (positions.length > 1) {
        const distances: number[] = [];
        for (let i = 1; i < positions.length; i++) {
          distances.push(positions[i] - positions[0]);
        }
        this.kasiskiResults.push({ ngram, positions, distances });
      }
    });

    // Sort by number of occurrences
    this.kasiskiResults.sort((a, b) => b.positions.length - a.positions.length);
    this.kasiskiResults = this.kasiskiResults.slice(0, 10); // Show top 10
  }

  // Simple Enigma simulation (simplified)
  simulateEnigma() {
    // This is a very simplified Enigma simulation for demonstration
    const rotorI = 'EKMFLGDQVZNTOWYHXUSPAIBRCJ';
    const rotorII = 'AJDKSIRUXBLHWTMCQGZNPYFVOE';
    const rotorIII = 'BDFHJLCPRTXVZNYEIWGAKMUSQO';

    let result = '';
    for (let i = 0; i < this.enigmaPlaintext.length; i++) {
      const char = this.enigmaPlaintext[i].toUpperCase();
      if (char >= 'A' && char <= 'Z') {
        const pos = char.charCodeAt(0) - 65;
        // Simplified rotor substitution
        const substituted = rotorI[pos];
        result += substituted;
      } else {
        result += char;
      }
    }
    this.enigmaCiphertext = result;
  }

  // GCD calculation for Kasiski
  gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  // Calculate possible key lengths from distances
  getPossibleKeyLengths(): number[] {
    if (this.kasiskiResults.length === 0) return [];

    const allDistances = this.kasiskiResults.flatMap(result => result.distances);
    const factors = new Set<number>();

    allDistances.forEach(distance => {
      for (let i = 2; i <= Math.sqrt(distance); i++) {
        if (distance % i === 0) {
          factors.add(i);
          factors.add(distance / i);
        }
      }
    });

    return Array.from(factors).sort((a, b) => a - b).slice(0, 10);
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
    this.router.navigate(['/dashboard']);
  }

  toggleFrequencyChart() {
    this.showFrequencyChart = !this.showFrequencyChart;
  }

  toggleKasiskiAnalysis() {
    this.showKasiskiAnalysis = !this.showKasiskiAnalysis;
    if (this.showKasiskiAnalysis) {
      this.performKasiskiAnalysis();
    }
  }

  toggleEnigmaDemo() {
    this.showEnigmaDemo = !this.showEnigmaDemo;
    if (this.showEnigmaDemo) {
      this.simulateEnigma();
    }
  }
}
