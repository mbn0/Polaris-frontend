// Chapter 9: Mathematics of Asymmetric Cryptography - Comprehensive Test Suite
console.log("=".repeat(60));
console.log("CHAPTER 9: MATHEMATICS OF ASYMMETRIC CRYPTOGRAPHY - VERIFICATION TESTS");
console.log("=".repeat(60));

// Utility functions from the component
function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

function primeFactors(n) {
    const factors = [];
    let d = 2;
    
    while (d * d <= n) {
        while (n % d === 0) {
            factors.push(d);
            n /= d;
        }
        d++;
    }
    
    if (n > 1) {
        factors.push(n);
    }
    
    return factors;
}

function eulerTotient(n) {
    if (n === 1) return 1;
    
    const factors = primeFactors(n);
    const uniqueFactors = [...new Set(factors)];
    
    let result = n;
    for (const p of uniqueFactors) {
        result = result * (p - 1) / p;
    }
    
    return Math.floor(result);
}

function modPow(base, exponent, modulus) {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;
    
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus;
    }
    
    return result;
}

function gcd(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function extendedGCD(a, b) {
    const steps = [];
    let oldR = a, r = b;
    let oldS = 1, s = 0;
    let oldT = 0, t = 1;
    
    while (r !== 0) {
        const quotient = Math.floor(oldR / r);
        
        steps.push({
            equation: `${oldR} = ${quotient} × ${r} + ${oldR % r}`,
            quotient: quotient,
            remainder: oldR % r
        });
        
        [oldR, r] = [r, oldR - quotient * r];
        [oldS, s] = [s, oldS - quotient * s];
        [oldT, t] = [t, oldT - quotient * t];
    }
    
    return {
        gcd: oldR,
        x: oldS,
        y: oldT,
        steps: steps
    };
}

// Test 1: Primality Testing
console.log("\n1. PRIMALITY TESTING");
console.log("-".repeat(40));

function testPrimality() {
    const testCases = [
        { n: 2, expected: true },
        { n: 3, expected: true },
        { n: 4, expected: false },
        { n: 17, expected: true },
        { n: 25, expected: false },
        { n: 97, expected: true },
        { n: 100, expected: false }
    ];
    
    let allCorrect = true;
    console.log("Testing primality function:");
    
    for (const test of testCases) {
        const result = isPrime(test.n);
        const correct = result === test.expected;
        console.log(`  isPrime(${test.n}) = ${result} ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const primalityResult = testPrimality();

// Test 2: Prime Factorization
console.log("\n2. PRIME FACTORIZATION");
console.log("-".repeat(40));

function testPrimeFactorization() {
    const testCases = [
        { n: 12, expected: [2, 2, 3] },
        { n: 15, expected: [3, 5] },
        { n: 84, expected: [2, 2, 3, 7] },
        { n: 100, expected: [2, 2, 5, 5] }
    ];
    
    let allCorrect = true;
    console.log("Testing prime factorization:");
    
    for (const test of testCases) {
        const result = primeFactors(test.n);
        const correct = JSON.stringify(result) === JSON.stringify(test.expected);
        console.log(`  primeFactors(${test.n}) = [${result.join(', ')}] ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const factorizationResult = testPrimeFactorization();

// Test 3: Euler's Totient Function
console.log("\n3. EULER'S TOTIENT FUNCTION");
console.log("-".repeat(40));

function testEulerTotient() {
    const testCases = [
        { n: 9, expected: 6 },   // φ(9) = 9 × (1 - 1/3) = 6
        { n: 15, expected: 8 },  // φ(15) = 15 × (1 - 1/3) × (1 - 1/5) = 8
        { n: 84, expected: 24 }, // φ(84) = 84 × (1 - 1/2) × (1 - 1/3) × (1 - 1/7) = 24
        { n: 210, expected: 48 } // φ(210) = 210 × (1 - 1/2) × (1 - 1/3) × (1 - 1/5) × (1 - 1/7) = 48
    ];
    
    let allCorrect = true;
    console.log("Testing Euler's totient function:");
    
    for (const test of testCases) {
        const result = eulerTotient(test.n);
        const correct = result === test.expected;
        console.log(`  φ(${test.n}) = ${result} ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const totientResult = testEulerTotient();

// Test 4: Modular Exponentiation
console.log("\n4. MODULAR EXPONENTIATION");
console.log("-".repeat(40));

function testModularExponentiation() {
    const testCases = [
        { base: 2, exp: 10, mod: 1000, expected: 24 },
        { base: 3, exp: 4, mod: 5, expected: 1 },
        { base: 7, exp: 10, mod: 13, expected: 4 }
    ];
    
    let allCorrect = true;
    console.log("Testing modular exponentiation:");
    
    for (const test of testCases) {
        const result = modPow(test.base, test.exp, test.mod);
        const correct = result === test.expected;
        console.log(`  ${test.base}^${test.exp} mod ${test.mod} = ${result} ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const modExpResult = testModularExponentiation();

// Test 5: Euclidean Algorithm
console.log("\n5. EUCLIDEAN ALGORITHM");
console.log("-".repeat(40));

function testEuclideanAlgorithm() {
    const testCases = [
        { a: 48, b: 18, expected: 6 },
        { a: 123, b: 36, expected: 3 },
        { a: 17, b: 13, expected: 1 }
    ];
    
    let allCorrect = true;
    console.log("Testing Euclidean algorithm:");
    
    for (const test of testCases) {
        const result = gcd(test.a, test.b);
        const correct = result === test.expected;
        console.log(`  gcd(${test.a}, ${test.b}) = ${result} ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const euclideanResult = testEuclideanAlgorithm();

// Test 6: Extended Euclidean Algorithm
console.log("\n6. EXTENDED EUCLIDEAN ALGORITHM");
console.log("-".repeat(40));

function testExtendedEuclidean() {
    const testCases = [
        { a: 23, b: 100, expectedGcd: 1, expectedX: -13, expectedY: 3 },
        { a: 48, b: 18, expectedGcd: 6, expectedX: 1, expectedY: -2 }
    ];
    
    let allCorrect = true;
    console.log("Testing extended Euclidean algorithm:");
    
    for (const test of testCases) {
        const result = extendedGCD(test.a, test.b);
        const gcdCorrect = result.gcd === test.expectedGcd;
        const xCorrect = result.x === test.expectedX;
        const yCorrect = result.y === test.expectedY;
        const verification = test.a * result.x + test.b * result.y === result.gcd;
        
        console.log(`  extgcd(${test.a}, ${test.b}):`);
        console.log(`    gcd = ${result.gcd} ${gcdCorrect ? '✓' : '✗'}`);
        console.log(`    x = ${result.x} ${xCorrect ? '✓' : '✗'}`);
        console.log(`    y = ${result.y} ${yCorrect ? '✓' : '✗'}`);
        console.log(`    verification: ${test.a} × ${result.x} + ${test.b} × ${result.y} = ${result.gcd} ${verification ? '✓' : '✗'}`);
        
        if (!gcdCorrect || !xCorrect || !yCorrect || !verification) allCorrect = false;
    }
    
    return allCorrect;
}

const extendedEuclideanResult = testExtendedEuclidean();

// Test 7: Fermat's Little Theorem
console.log("\n7. FERMAT'S LITTLE THEOREM");
console.log("-".repeat(40));

function testFermatsLittleTheorem() {
    const testCases = [
        { a: 2, p: 17 }, // 2^16 ≡ 1 (mod 17)
        { a: 3, p: 7 },  // 3^6 ≡ 1 (mod 7)
        { a: 5, p: 11 }  // 5^10 ≡ 1 (mod 11)
    ];
    
    let allCorrect = true;
    console.log("Testing Fermat's Little Theorem (a^(p-1) ≡ 1 mod p):");
    
    for (const test of testCases) {
        const result = modPow(test.a, test.p - 1, test.p);
        const correct = result === 1;
        console.log(`  ${test.a}^${test.p - 1} mod ${test.p} = ${result} ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const fermatsResult = testFermatsLittleTheorem();

// Test 8: Euler's Theorem
console.log("\n8. EULER'S THEOREM");
console.log("-".repeat(40));

function testEulersTheorem() {
    const testCases = [
        { a: 3, n: 10 }, // 3^φ(10) = 3^4 ≡ 1 (mod 10), but gcd(3,10) = 1
        { a: 7, n: 12 }, // 7^φ(12) = 7^4 ≡ 1 (mod 12), gcd(7,12) = 1
        { a: 6, n: 35 }  // 6^φ(35) = 6^24 ≡ 1 (mod 35), gcd(6,35) = 1
    ];
    
    let allCorrect = true;
    console.log("Testing Euler's Theorem (a^φ(n) ≡ 1 mod n when gcd(a,n) = 1):");
    
    for (const test of testCases) {
        const phi = eulerTotient(test.n);
        const gcdResult = gcd(test.a, test.n);
        const result = modPow(test.a, phi, test.n);
        const correct = result === 1 && gcdResult === 1;
        
        console.log(`  gcd(${test.a}, ${test.n}) = ${gcdResult}`);
        console.log(`  φ(${test.n}) = ${phi}`);
        console.log(`  ${test.a}^${phi} mod ${test.n} = ${result} ${correct ? '✓' : '✗'}`);
        
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const eulersResult = testEulersTheorem();

// Final Results Summary
console.log("\n" + "=".repeat(60));
console.log("CHAPTER 9 VERIFICATION RESULTS");
console.log("=".repeat(60));

const results = [
    { test: "Primality Testing", result: primalityResult },
    { test: "Prime Factorization", result: factorizationResult },
    { test: "Euler's Totient Function", result: totientResult },
    { test: "Modular Exponentiation", result: modExpResult },
    { test: "Euclidean Algorithm", result: euclideanResult },
    { test: "Extended Euclidean Algorithm", result: extendedEuclideanResult },
    { test: "Fermat's Little Theorem", result: fermatsResult },
    { test: "Euler's Theorem", result: eulersResult }
];

let allPassed = true;
results.forEach(({ test, result }) => {
    console.log(`${test}: ${result ? 'PASS ✓' : 'FAIL ✗'}`);
    if (!result) allPassed = false;
});

console.log("\n" + "=".repeat(60));
console.log(`OVERALL RESULT: ${allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}`);
console.log("=".repeat(60));

if (allPassed) {
    console.log("\nChapter 9 implementations are mathematically correct!");
    console.log("✓ All number theory algorithms work correctly");
    console.log("✓ Primality testing, factorization, and totient function verified");
    console.log("✓ Modular arithmetic operations are accurate");
    console.log("✓ Euclidean algorithms produce correct results");
    console.log("✓ Fermat's and Euler's theorems verified");
} else {
    console.log("\nSome implementations need attention - see details above.");
} 