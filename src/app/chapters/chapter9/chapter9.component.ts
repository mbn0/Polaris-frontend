import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { FormsModule } from "@angular/forms"

interface PrimalityTest {
  number: number
  isPrime: boolean
  factors: number[]
  testSteps: string[]
}

interface TotientCalculation {
  n: number
  primeFactors: { prime: number; power: number }[]
  totient: number
  calculation: string
}

interface EuclideanStep {
  a: number
  b: number
  quotient: number
  remainder: number
  equation: string
}

interface ExtendedEuclideanResult {
  gcd: number
  x: number
  y: number
  steps: { equation: string; x: number; y: number }[]
}

@Component({
  selector: "app-chapter9",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapter9.component.html",
  styleUrls: ["./chapter9.component.css"],
})
export class Chapter9Component implements OnInit {
  currentSection = 1
  totalSections = 9

  // Prime testing
  primeTestNumber = 97
  primalityResult: PrimalityTest | null = null
  primeTestNumbers = [97, 301, 1049, 2029, 4093]

  // Totient function
  totientNumber = 84
  totientResult: TotientCalculation | null = null
  totientExamples = [10, 13, 49, 84, 210, 1001]

  // Fermat's Little Theorem
  fermatBase = 2
  fermatExponent = 16
  fermatModulus = 17
  fermatResult = 0
  fermatSteps: string[] = []

  // Euler's Theorem
  eulerBase = 6
  eulerExponent = 24
  eulerModulus = 35
  eulerResult = 0
  eulerSteps: string[] = []

  // Euclidean Algorithm
  euclideanA = 123
  euclideanB = 36
  euclideanSteps: EuclideanStep[] = []
  euclideanGCD = 0

  // Extended Euclidean Algorithm
  extendedA = 23
  extendedN = 100
  extendedResult: ExtendedEuclideanResult | null = null

  // Prime generation
  primeGenerationBits = 8
  generatedPrimes: number[] = []
  safePrimes: number[] = []
  strongPrimes: number[] = []

  // Performance tracking
  algorithmTimes = {
    primalityTest: 0,
    euclidean: 0,
    extendedEuclidean: 0,
    primeGeneration: 0,
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.testPrimality()
    this.calculateTotient()
    this.calculateFermat()
    this.calculateEuler()
    this.runEuclidean()
    this.runExtendedEuclidean()
    this.generatePrimes()
  }

  // Prime testing implementation
  testPrimality() {
    const startTime = performance.now()
    const n = this.primeTestNumber
    const factors: number[] = []
    const testSteps: string[] = []

    if (n <= 1) {
      this.primalityResult = {
        number: n,
        isPrime: false,
        factors: [],
        testSteps: ["Numbers ≤ 1 are not prime"],
      }
      return
    }

    if (n === 2) {
      this.primalityResult = {
        number: n,
        isPrime: true,
        factors: [],
        testSteps: ["2 is the only even prime"],
      }
      return
    }

    if (n % 2 === 0) {
      this.primalityResult = {
        number: n,
        isPrime: false,
        factors: [2, n / 2],
        testSteps: [`${n} is even, divisible by 2`],
      }
      return
    }

    const limit = Math.floor(Math.sqrt(n))
    testSteps.push(`Testing divisors up to √${n} ≈ ${limit}`)

    for (let i = 3; i <= limit; i += 2) {
      if (n % i === 0) {
        factors.push(i, n / i)
        testSteps.push(`${n} ÷ ${i} = ${n / i} (divisible)`)
        break
      } else {
        testSteps.push(`${n} ÷ ${i} = ${(n / i).toFixed(2)} (not divisible)`)
      }
    }

    const isPrime = factors.length === 0
    if (isPrime) {
      testSteps.push(`No divisors found → ${n} is prime`)
    }

    this.primalityResult = {
      number: n,
      isPrime,
      factors,
      testSteps,
    }

    this.algorithmTimes.primalityTest = performance.now() - startTime
  }

  // Prime factorization
  primeFactorization(n: number): { prime: number; power: number }[] {
    const factors: { prime: number; power: number }[] = []
    let temp = n

    // Check for factor 2
    if (temp % 2 === 0) {
      let power = 0
      while (temp % 2 === 0) {
        power++
        temp /= 2
      }
      factors.push({ prime: 2, power })
    }

    // Check for odd factors
    for (let i = 3; i * i <= temp; i += 2) {
      if (temp % i === 0) {
        let power = 0
        while (temp % i === 0) {
          power++
          temp /= i
        }
        factors.push({ prime: i, power })
      }
    }

    // If temp > 1, it's a prime factor
    if (temp > 1) {
      factors.push({ prime: temp, power: 1 })
    }

    return factors
  }

  // Euler's totient function
  calculateTotient() {
    const n = this.totientNumber
    const primeFactors = this.primeFactorization(n)

    let totient = n
    let calculation = `φ(${n}) = ${n}`

    for (const factor of primeFactors) {
      totient = (totient * (factor.prime - 1)) / factor.prime
      calculation += ` × (${factor.prime - 1}/${factor.prime})`
    }

    calculation += ` = ${totient}`

    this.totientResult = {
      n,
      primeFactors,
      totient,
      calculation,
    }
  }

  // Modular exponentiation
  modularExponentiation(base: number, exponent: number, modulus: number): number {
    if (modulus === 1) return 0

    let result = 1
    base = base % modulus

    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus
      }
      exponent = Math.floor(exponent / 2)
      base = (base * base) % modulus
    }

    return result
  }

  // Fermat's Little Theorem calculation
  calculateFermat() {
    const a = this.fermatBase
    const p = this.fermatModulus
    const exp = this.fermatExponent
    const steps: string[] = []

    if (!this.isPrime(p)) {
      steps.push(`${p} is not prime - Fermat's Little Theorem doesn't apply`)
      this.fermatSteps = steps
      this.fermatResult = 0
      return
    }

    steps.push(`Computing ${a}^${exp} mod ${p}`)
    steps.push(`Since ${p} is prime, we can use Fermat's Little Theorem`)

    if (exp === p - 1) {
      steps.push(`${exp} = ${p} - 1, so ${a}^${exp} ≡ 1 (mod ${p})`)
      this.fermatResult = 1
    } else {
      const quotient = Math.floor(exp / (p - 1))
      const remainder = exp % (p - 1)

      if (quotient > 0) {
        steps.push(`${exp} = ${quotient} × ${p - 1} + ${remainder}`)
        steps.push(`${a}^${exp} = ${a}^(${quotient} × ${p - 1} + ${remainder})`)
        steps.push(`= (${a}^${p - 1})^${quotient} × ${a}^${remainder}`)
        steps.push(`≡ 1^${quotient} × ${a}^${remainder} (mod ${p})`)
        steps.push(`≡ ${a}^${remainder} (mod ${p})`)
      }

      this.fermatResult = this.modularExponentiation(a, remainder || exp, p)
      steps.push(`= ${this.fermatResult}`)
    }

    this.fermatSteps = steps
  }

  // Euler's Theorem calculation
  calculateEuler() {
    const a = this.eulerBase
    const n = this.eulerModulus
    const exp = this.eulerExponent
    const steps: string[] = []

    const gcd = this.gcd(a, n)
    if (gcd !== 1) {
      steps.push(`gcd(${a}, ${n}) = ${gcd} ≠ 1 - Euler's Theorem doesn't apply`)
      this.eulerSteps = steps
      this.eulerResult = 0
      return
    }

    const phi = this.calculateTotientValue(n)
    steps.push(`Computing ${a}^${exp} mod ${n}`)
    steps.push(`φ(${n}) = ${phi}`)
    steps.push(`Since gcd(${a}, ${n}) = 1, we can use Euler's Theorem`)

    if (exp === phi) {
      steps.push(`${exp} = φ(${n}), so ${a}^${exp} ≡ 1 (mod ${n})`)
      this.eulerResult = 1
    } else {
      const quotient = Math.floor(exp / phi)
      const remainder = exp % phi

      if (quotient > 0) {
        steps.push(`${exp} = ${quotient} × ${phi} + ${remainder}`)
        steps.push(`${a}^${exp} = ${a}^(${quotient} × ${phi} + ${remainder})`)
        steps.push(`= (${a}^${phi})^${quotient} × ${a}^${remainder}`)
        steps.push(`≡ 1^${quotient} × ${a}^${remainder} (mod ${n})`)
        steps.push(`≡ ${a}^${remainder} (mod ${n})`)
      }

      this.eulerResult = this.modularExponentiation(a, remainder || exp, n)
      steps.push(`= ${this.eulerResult}`)
    }

    this.eulerSteps = steps
  }

  // Euclidean Algorithm
  runEuclidean() {
    const startTime = performance.now()
    let a = this.euclideanA
    let b = this.euclideanB
    const steps: EuclideanStep[] = []

    while (b !== 0) {
      const quotient = Math.floor(a / b)
      const remainder = a % b
      const equation = `${a} = ${quotient} × ${b} + ${remainder}`

      steps.push({
        a,
        b,
        quotient,
        remainder,
        equation,
      })

      a = b
      b = remainder
    }

    this.euclideanSteps = steps
    this.euclideanGCD = a
    this.algorithmTimes.euclidean = performance.now() - startTime
  }

  // Extended Euclidean Algorithm
  runExtendedEuclidean() {
    const startTime = performance.now()
    const a = this.extendedA
    const n = this.extendedN

    const result = this.extendedGCD(a, n)
    this.extendedResult = result
    this.algorithmTimes.extendedEuclidean = performance.now() - startTime
  }

  extendedGCD(a: number, b: number): ExtendedEuclideanResult {
    const originalA = a;
    const originalB = b;
    
    // Extended Euclidean Algorithm using iterative approach
    let oldR = a, r = b;
    let oldS = 1, s = 0;
    let oldT = 0, t = 1;
    
    const steps: { equation: string; x: number; y: number }[] = [];
    
    while (r !== 0) {
      const quotient = Math.floor(oldR / r);
      
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
      [oldT, t] = [t, oldT - quotient * t];
    }
    
    // oldR is the GCD, oldS and oldT are the Bézout coefficients
    const gcd = oldR;
    const x = oldS;
    const y = oldT;
    
    // Generate step-by-step explanation
    steps.push({
      equation: `gcd(${originalA}, ${originalB}) = ${gcd}`,
      x: 0,
      y: 0
    });
    
    steps.push({
      equation: `${gcd} = ${x} × ${originalA} + ${y} × ${originalB}`,
      x,
      y
    });
    
    // Verification step
    const verification = x * originalA + y * originalB;
    steps.push({
      equation: `Verification: ${x} × ${originalA} + ${y} × ${originalB} = ${verification}`,
      x,
      y
    });
    
    return {
      gcd,
      x,
      y,
      steps,
    };
  }

  // Prime generation
  generatePrimes() {
    const startTime = performance.now()
    const maxValue = Math.pow(2, this.primeGenerationBits) - 1
    const primes: number[] = []
    const safePrimes: number[] = []
    const strongPrimes: number[] = []

    for (let n = 2; n <= maxValue; n++) {
      if (this.isPrime(n)) {
        primes.push(n)

        // Check if it's a safe prime (p = 2q + 1 where q is prime)
        if (n > 2) {
          const q = (n - 1) / 2
          if (Number.isInteger(q) && this.isPrime(q)) {
            safePrimes.push(n)
          }
        }

        // Simplified strong prime check
        if (this.isStrongPrime(n)) {
          strongPrimes.push(n)
        }
      }
    }

    this.generatedPrimes = primes
    this.safePrimes = safePrimes
    this.strongPrimes = strongPrimes
    this.algorithmTimes.primeGeneration = performance.now() - startTime
  }

  // Utility functions
  isPrime(n: number): boolean {
    if (n <= 1) return false
    if (n <= 3) return true
    if (n % 2 === 0 || n % 3 === 0) return false

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false
    }

    return true
  }

  isStrongPrime(p: number): boolean {
    if (p <= 3) return false

    // A strong prime p satisfies:
    // 1. p-1 has a large prime factor r
    // 2. p+1 has a large prime factor s  
    // 3. r-1 has a large prime factor
    // For simplicity, we check the first condition: p-1 has a large prime factor
    const factorsOfPMinus1 = this.primeFactorization(p - 1)
    const largestPrimeFactor = Math.max(...factorsOfPMinus1.map(f => f.prime))
    
    // A prime factor is considered "large" if it's greater than a threshold
    // For educational purposes, we use sqrt(p-1) as the threshold
    return largestPrimeFactor > Math.sqrt(p - 1)
  }

  gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  calculateTotientValue(n: number): number {
    const factors = this.primeFactorization(n)
    let result = n

    for (const factor of factors) {
      result = (result * (factor.prime - 1)) / factor.prime
    }

    return result
  }

  // Navigation methods
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
    this.router.navigate(["/dashboard"])
  }

  // Interactive demonstrations
  onPrimeTestChange() {
    this.testPrimality()
  }

  onTotientChange() {
    this.calculateTotient()
  }

  onFermatChange() {
    this.calculateFermat()
  }

  onEulerChange() {
    this.calculateEuler()
  }

  onEuclideanChange() {
    this.runEuclidean()
  }

  onExtendedEuclideanChange() {
    this.runExtendedEuclidean()
  }

  onPrimeGenerationChange() {
    this.generatePrimes()
  }

  // Quick test functions
  testSpecificNumber(number: number) {
    this.primeTestNumber = number
    this.testPrimality()
  }

  calculateSpecificTotient(number: number) {
    this.totientNumber = number
    this.calculateTotient()
  }
}

