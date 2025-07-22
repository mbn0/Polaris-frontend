import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MathExample {
  id: number;
  problem: string;
  solution: string;
  steps: string[];
  userAnswer: string;
  showSolution: boolean;
}

interface TotientExample {
  n: number;
  factorization: string;
  calculation: string;
  result: number;
}

@Component({
  selector: 'app-chapter2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter2.component.html',
  styleUrls: ['./chapter2.component.css']
})
export class Chapter2Component implements OnInit {
  currentSection = 1;
  totalSections = 12;

  // Interactive examples
  modularExamples: MathExample[] = [
    {
      id: 1,
      problem: 'Calculate (87 + 114) mod 11',
      solution: '3',
      steps: [
        '87 mod 11 = 10 (since 87 = 7×11 + 10)',
        '114 mod 11 = 4 (since 114 = 10×11 + 4)',
        '(10 + 4) mod 11 = 14 mod 11 = 3'
      ],
      userAnswer: '',
      showSolution: false
    },
    {
      id: 2,
      problem: 'Calculate 3^12 mod 7',
      solution: '1',
      steps: [
        '3² mod 7 = 9 mod 7 = 2',
        '3⁴ mod 7 = (3²)² mod 7 = 2² mod 7 = 4',
        '3⁸ mod 7 = (3⁴)² mod 7 = 4² mod 7 = 16 mod 7 = 2',
        '3¹² = 3⁸ × 3⁴ mod 7 = 2 × 4 mod 7 = 8 mod 7 = 1'
      ],
      userAnswer: '',
      showSolution: false
    }
  ];

  gcdExample = {
    a: 36,
    b: 123,
    steps: [
      { dividend: 123, divisor: 36, quotient: 3, remainder: 15, equation: '123 = 3×36 + 15' },
      { dividend: 36, divisor: 15, quotient: 2, remainder: 6, equation: '36 = 2×15 + 6' },
      { dividend: 15, divisor: 6, quotient: 2, remainder: 3, equation: '15 = 2×6 + 3' },
      { dividend: 6, divisor: 3, quotient: 2, remainder: 0, equation: '6 = 2×3 + 0' }
    ],
    result: 3
  };

  totientExamples: TotientExample[] = [
    { n: 15, factorization: '3 × 5', calculation: 'φ(3) × φ(5) = 2 × 4', result: 8 },
    { n: 13, factorization: '13 (prime)', calculation: '13 - 1', result: 12 },
    { n: 21, factorization: '3 × 7', calculation: 'φ(3) × φ(7) = 2 × 6', result: 12 }
  ];

  // Interactive calculator states
  modCalcA = '';
  modCalcB = '';
  modCalcN = '';
  modCalcResult = '';
  modCalcOperation = 'add';

  gcdCalcA = '';
  gcdCalcB = '';
  gcdCalcResult = '';
  gcdCalcSteps: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {}

  // Secure modular arithmetic implementation using BigInt
  private safeMod(a: bigint, n: bigint): bigint {
    return ((a % n) + n) % n;
  }

  // Square-and-multiply algorithm for modular exponentiation
  private modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = this.safeMod(base, modulus);
    while (exponent > 0n) {
      if (exponent & 1n) {
        result = this.safeMod(result * base, modulus);
      }
      base = this.safeMod(base * base, modulus);
      exponent >>= 1n;
    }
    return result;
  }

  // Extended Euclidean Algorithm implementation
  private extendedGCD(a: bigint, b: bigint): { gcd: bigint, x: bigint, y: bigint } {
    if (b === 0n) {
      return { gcd: a, x: 1n, y: 0n };
    }
    const { gcd, x, y } = this.extendedGCD(b, a % b);
    return { gcd, x: y, y: x - (a / b) * y };
  }

  // Find multiplicative inverse using Extended Euclidean Algorithm
  private modInverse(a: bigint, n: bigint): bigint | null {
    const { gcd, x } = this.extendedGCD(a, n);
    if (gcd !== 1n) return null; // No multiplicative inverse exists
    return this.safeMod(x, n);
  }

  checkAnswer(example: MathExample) {
    example.showSolution = true;
  }

  calculateModular() {
    try {
      const a = BigInt(this.modCalcA);
      const b = BigInt(this.modCalcB);
      const n = BigInt(this.modCalcN);

      if (n <= 0n) {
        this.modCalcResult = 'Modulus must be positive';
        return;
      }

      let result: bigint;
      switch (this.modCalcOperation) {
        case 'add':
          result = this.safeMod(a + b, n);
          break;
        case 'subtract':
          result = this.safeMod(a - b, n);
          break;
        case 'multiply':
          result = this.safeMod(a * b, n);
          break;
        default:
          this.modCalcResult = 'Invalid operation';
          return;
      }

      this.modCalcResult = result.toString();
    } catch (error) {
      this.modCalcResult = 'Invalid input';
    }
  }

  calculateGCD() {
    try {
      let a = BigInt(this.gcdCalcA);
      let b = BigInt(this.gcdCalcB);

      if (a <= 0n || b <= 0n) {
        this.gcdCalcResult = 'Inputs must be positive';
        return;
      }

      // Store original values for display
      const originalA = a;
      const originalB = b;

      // Ensure a >= b
      if (a < b) [a, b] = [b, a];

      this.gcdCalcSteps = [];
      while (b !== 0n) {
        const quotient = a / b;
        const remainder = a % b;

        this.gcdCalcSteps.push({
          dividend: a.toString(),
          divisor: b.toString(),
          quotient: quotient.toString(),
          remainder: remainder.toString(),
          equation: `${a} = ${quotient}×${b} + ${remainder}`
        });

        a = b;
        b = remainder;
      }

      this.gcdCalcResult = `gcd(${originalA}, ${originalB}) = ${a}`;

      // Calculate and display Bézout's identity if needed
      const { x, y } = this.extendedGCD(originalA, originalB);
      if (this.gcdCalcSteps.length > 0) {
        this.gcdCalcSteps.push({
          equation: `Bézout's identity: ${a} = ${x}×${originalA} + ${y}×${originalB}`
        });
      }
    } catch (error) {
      this.gcdCalcResult = 'Invalid input';
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.currentSection++;
      this.scrollToTop();
    }
  }

  previousSection() {
    if (this.currentSection > 1) {
      this.currentSection--;
      this.scrollToTop();
    }
  }

  goToSection(section: number) {
    this.currentSection = section;
    this.scrollToTop();
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
