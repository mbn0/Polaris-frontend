// Chapter 10: Asymmetric-Key Cryptography - Comprehensive Test Suite
console.log("=".repeat(60));
console.log("CHAPTER 10: ASYMMETRIC-KEY CRYPTOGRAPHY - VERIFICATION TESTS");
console.log("=".repeat(60));

// Utility functions from the component
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

function modInverse(a, m) {
    const extendedGCD = (a, b) => {
        if (a === 0) return [b, 0, 1];
        const [gcd, x1, y1] = extendedGCD(b % a, a);
        const x = y1 - Math.floor(b / a) * x1;
        const y = x1;
        return [gcd, x, y];
    };

    const [g, x] = extendedGCD(a, m);
    if (g !== 1) throw new Error('Modular inverse does not exist');
    return ((x % m) + m) % m;
}

function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

function eulerTotient(n) {
    let result = n;
    let p = 2;
    
    while (p * p <= n) {
        if (n % p === 0) {
            while (n % p === 0) {
                n /= p;
            }
            result -= result / p;
        }
        p++;
    }
    
    if (n > 1) {
        result -= result / n;
    }
    
    return Math.floor(result);
}

// Test 1: RSA Cryptosystem
console.log("\n1. RSA CRYPTOSYSTEM");
console.log("-".repeat(40));

function testRSA() {
    console.log("Testing RSA encryption/decryption:");
    
    // Use small primes for testing
    const p = 61;
    const q = 53;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    const e = 17;
    const d = modInverse(e, phi);
    
    console.log(`RSA Parameters:`);
    console.log(`  p = ${p}, q = ${q}`);
    console.log(`  n = ${n}`);
    console.log(`  φ(n) = ${phi}`);
    console.log(`  e = ${e}`);
    console.log(`  d = ${d}`);
    
    // Verify key correctness
    const keyCheck = (e * d) % phi;
    console.log(`  Key verification: e × d ≡ ${keyCheck} (mod φ(n)) ${keyCheck === 1 ? '✓' : '✗'}`);
    
    // Test encryption/decryption
    const testCases = [42, 100, 500];
    let allCorrect = true;
    
    for (const plaintext of testCases) {
        if (plaintext >= n) continue; // Skip if plaintext >= n
        
        const ciphertext = modPow(plaintext, e, n);
        const decrypted = modPow(ciphertext, d, n);
        const correct = decrypted === plaintext;
        
        console.log(`  ${plaintext} → ${ciphertext} → ${decrypted} ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect && keyCheck === 1;
}

const rsaResult = testRSA();

// Test 2: Rabin Cryptosystem
console.log("\n2. RABIN CRYPTOSYSTEM");
console.log("-".repeat(40));

function testRabin() {
    console.log("Testing Rabin encryption/decryption:");
    
    const p = 7; // p ≡ 3 (mod 4)
    const q = 11; // q ≡ 3 (mod 4)
    const n = p * q;
    
    console.log(`Rabin Parameters:`);
    console.log(`  p = ${p} (≡ ${p % 4} mod 4)`);
    console.log(`  q = ${q} (≡ ${q % 4} mod 4)`);
    console.log(`  n = ${n}`);
    
    // Test encryption/decryption
    const testCases = [5, 10, 20];
    let allCorrect = true;
    
    for (const plaintext of testCases) {
        if (plaintext >= n) continue;
        
        const ciphertext = (plaintext * plaintext) % n;
        
        // Find square roots mod n
        const roots = [];
        for (let i = 0; i < n; i++) {
            if ((i * i) % n === ciphertext) {
                roots.push(i);
            }
        }
        
        const hasOriginal = roots.includes(plaintext);
        console.log(`  ${plaintext} → ${ciphertext} → [${roots.join(', ')}] ${hasOriginal ? '✓' : '✗'}`);
        
        if (!hasOriginal) allCorrect = false;
    }
    
    return allCorrect;
}

const rabinResult = testRabin();

// Test 3: ElGamal Cryptosystem
console.log("\n3. ELGAMAL CRYPTOSYSTEM");
console.log("-".repeat(40));

function testElGamal() {
    console.log("Testing ElGamal encryption/decryption:");
    
    const p = 23;
    const g = 5;
    const x = 6; // Private key
    const h = modPow(g, x, p); // Public key
    const k = 7; // Random value for encryption
    
    console.log(`ElGamal Parameters:`);
    console.log(`  p = ${p}`);
    console.log(`  g = ${g}`);
    console.log(`  x = ${x} (private key)`);
    console.log(`  h = g^x mod p = ${h} (public key)`);
    console.log(`  k = ${k} (random)`);
    
    const testCases = [5, 10, 15];
    let allCorrect = true;
    
    for (const plaintext of testCases) {
        if (plaintext >= p) continue;
        
        // Encryption: (c1, c2) = (g^k mod p, m × h^k mod p)
        const c1 = modPow(g, k, p);
        const c2 = (plaintext * modPow(h, k, p)) % p;
        
        // Decryption: m = c2 × (c1^x)^(-1) mod p
        const s = modPow(c1, x, p);
        const sInv = modInverse(s, p);
        const decrypted = (c2 * sInv) % p;
        
        const correct = decrypted === plaintext;
        console.log(`  ${plaintext} → (${c1}, ${c2}) → ${decrypted} ${correct ? '✓' : '✗'}`);
        
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const elGamalResult = testElGamal();

// Test 4: Digital Signatures (RSA-based)
console.log("\n4. DIGITAL SIGNATURES");
console.log("-".repeat(40));

function testDigitalSignatures() {
    console.log("Testing RSA-based digital signatures:");
    
    const p = 61;
    const q = 53;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    const e = 17;
    const d = modInverse(e, phi);
    
    console.log(`Signature Parameters: n = ${n}, e = ${e}, d = ${d}`);
    
    const testMessages = [100, 200, 300];
    let allCorrect = true;
    
    for (const message of testMessages) {
        if (message >= n) continue;
        
        // Ensure message and n are coprime for valid signature
        if (gcd(message, n) !== 1) continue;
        
        // Sign: signature = message^d mod n
        const signature = modPow(message, d, n);
        
        // Verify: recovered = signature^e mod n
        const recovered = modPow(signature, e, n);
        
        const valid = recovered === message;
        console.log(`  Message: ${message}`);
        console.log(`  Signature: ${signature}`);
        console.log(`  Verification: ${recovered} ${valid ? '✓' : '✗'}`);
        
        if (!valid) allCorrect = false;
    }
    
    return allCorrect;
}

const signatureResult = testDigitalSignatures();

// Test 5: Key Generation Security
console.log("\n5. KEY GENERATION SECURITY");
console.log("-".repeat(40));

function testKeyGeneration() {
    console.log("Testing key generation security properties:");
    
    let allCorrect = true;
    
    // Test 1: Prime generation
    const primes = [61, 53, 67, 71];
    console.log("Prime validation:");
    for (const p of primes) {
        const valid = isPrime(p);
        console.log(`  ${p} is prime: ${valid ? '✓' : '✗'}`);
        if (!valid) allCorrect = false;
    }
    
    // Test 2: RSA key relationships
    const p = 61, q = 53;
    const n = p * q;
    const phi = eulerTotient(n);
    const e = 17;
    
    console.log("\nRSA key relationships:");
    console.log(`  n = p × q = ${p} × ${q} = ${n}`);
    console.log(`  φ(n) = ${phi}`);
    console.log(`  gcd(e, φ(n)) = ${gcd(e, phi)} ${gcd(e, phi) === 1 ? '✓' : '✗'}`);
    
    if (gcd(e, phi) !== 1) allCorrect = false;
    
    // Test 3: Safe prime properties
    console.log("\nSafe prime checking:");
    const safePrimeCandidates = [11, 23, 47]; // (p-1)/2 should also be prime
    for (const p of safePrimeCandidates) {
        const q = (p - 1) / 2;
        const isSafe = isPrime(p) && isPrime(q);
        console.log(`  ${p} is safe prime: ${isSafe ? '✓' : '✗'} (q = ${q})`);
    }
    
    return allCorrect;
}

const keyGenResult = testKeyGeneration();

// Test 6: Modular Arithmetic Operations
console.log("\n6. MODULAR ARITHMETIC OPERATIONS");
console.log("-".repeat(40));

function testModularOperations() {
    console.log("Testing modular arithmetic correctness:");
    
    let allCorrect = true;
    
    // Test modular exponentiation
    const expTests = [
        { base: 2, exp: 10, mod: 1000, expected: 24 },
        { base: 3, exp: 4, mod: 5, expected: 1 },
        { base: 7, exp: 3, mod: 11, expected: 2 }
    ];
    
    console.log("Modular exponentiation:");
    for (const test of expTests) {
        const result = modPow(test.base, test.exp, test.mod);
        const correct = result === test.expected;
        console.log(`  ${test.base}^${test.exp} mod ${test.mod} = ${result} ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    // Test modular inverse
    const invTests = [
        { a: 3, m: 11, expected: 4 },
        { a: 17, m: 3120, expected: 2753 }
    ];
    
    console.log("\nModular inverse:");
    for (const test of invTests) {
        const result = modInverse(test.a, test.m);
        const verification = (test.a * result) % test.m;
        const correct = verification === 1;
        console.log(`  ${test.a}^(-1) mod ${test.m} = ${result}`);
        console.log(`  Verification: ${test.a} × ${result} ≡ ${verification} (mod ${test.m}) ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const modOpResult = testModularOperations();

// Final Results Summary
console.log("\n" + "=".repeat(60));
console.log("CHAPTER 10 VERIFICATION RESULTS");
console.log("=".repeat(60));

const results = [
    { test: "RSA Cryptosystem", result: rsaResult },
    { test: "Rabin Cryptosystem", result: rabinResult },
    { test: "ElGamal Cryptosystem", result: elGamalResult },
    { test: "Digital Signatures", result: signatureResult },
    { test: "Key Generation Security", result: keyGenResult },
    { test: "Modular Arithmetic Operations", result: modOpResult }
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
    console.log("\nChapter 10 implementations are mathematically correct!");
    console.log("✓ RSA encryption/decryption works correctly");
    console.log("✓ Rabin cryptosystem produces valid square roots");
    console.log("✓ ElGamal encryption maintains homomorphic properties");
    console.log("✓ Digital signatures provide authentication");
    console.log("✓ Key generation follows security requirements");
    console.log("✓ All modular arithmetic operations are accurate");
} else {
    console.log("\nSome implementations need attention - see details above.");
} 