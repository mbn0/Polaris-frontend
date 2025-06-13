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

  checkAnswer(example: MathExample) {
    example.showSolution = true;
  }

  calculateModular() {
    const a = parseInt(this.modCalcA);
    const b = parseInt(this.modCalcB);
    const n = parseInt(this.modCalcN);

    if (isNaN(a) || isNaN(b) || isNaN(n) || n <= 0) {
      this.modCalcResult = 'Invalid input';
      return;
    }

    let result: number;
    switch (this.modCalcOperation) {
      case 'add':
        result = (a + b) % n;
        break;
      case 'subtract':
        result = ((a - b) % n + n) % n;
        break;
      case 'multiply':
        result = (a * b) % n;
        break;
      default:
        result = 0;
    }

    this.modCalcResult = `${result}`;
  }

  calculateGCD() {
    let a = parseInt(this.gcdCalcA);
    let b = parseInt(this.gcdCalcB);

    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
      this.gcdCalcResult = 'Invalid input';
      return;
    }

    this.gcdCalcSteps = [];
    const originalA = a;
    const originalB = b;

    // Ensure a >= b
    if (a < b) {
      [a, b] = [b, a];
    }

    while (b !== 0) {
      const quotient = Math.floor(a / b);
      const remainder = a % b;

      this.gcdCalcSteps.push({
        dividend: a,
        divisor: b,
        quotient: quotient,
        remainder: remainder,
        equation: `${a} = ${quotient}×${b} + ${remainder}`
      });

      a = b;
      b = remainder;
    }

    this.gcdCalcResult = `gcd(${originalA}, ${originalB}) = ${a}`;
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
