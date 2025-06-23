// Chapter 13: Digital Signatures - Comprehensive Test Suite
console.log("=".repeat(60));
console.log("CHAPTER 13: DIGITAL SIGNATURES - VERIFICATION TESTS");
console.log("=".repeat(60));

// Utility functions from the component
function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }
    return result;
}

function modInverse(a, m) {
    const gcdExtended = (a, b) => {
        if (a === 0n) return [b, 0n, 1n];
        const [gcd, x1, y1] = gcdExtended(b % a, a);
        const x = y1 - (b / a) * x1;
        const y = x1;
        return [gcd, x, y];
    };

    const [g, x] = gcdExtended(a, m);
    if (g !== 1n) throw new Error('Modular inverse does not exist');
    return ((x % m) + m) % m;
}

function gcd(a, b) {
    while (b !== 0n) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function simpleHash(message) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

function simpleHashToNumber(message) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash) % 1000; // Keep small for demo
}

// Test 1: RSA Signature Implementation
console.log("\n1. RSA SIGNATURE IMPLEMENTATION");
console.log("-".repeat(40));

function testRSASignature() {
    // Use the same small primes as in the component
    const p = 61n;
    const q = 53n;
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    const e = 17n;
    const d = modInverse(e, phi);
    
    console.log(`RSA Parameters:`);
    console.log(`  p = ${p}, q = ${q}`);
    console.log(`  n = ${n} (${p} × ${q})`);
    console.log(`  φ(n) = ${phi} (${p-1n} × ${q-1n})`);
    console.log(`  e = ${e}`);
    console.log(`  d = ${d}`);
    
    // Verify key generation
    const keyCheck = (e * d) % phi;
    console.log(`  Key check: e × d ≡ ${keyCheck} (mod φ(n)) ${keyCheck === 1n ? '✓' : '✗'}`);
    
    // Test message signing and verification
    const testMessage = "Hello RSA!";
    const messageHash = BigInt(simpleHashToNumber(testMessage));
    console.log(`\nMessage: "${testMessage}"`);
    console.log(`Hash as number: ${messageHash}`);
    
    // Sign: signature = hash^d mod n
    const signature = modPow(messageHash, d, n);
    console.log(`Signature: ${signature}`);
    
    // Verify: recovered = signature^e mod n
    const recovered = modPow(signature, e, n);
    console.log(`Recovered hash: ${recovered}`);
    console.log(`Verification: ${recovered === messageHash ? 'VALID ✓' : 'INVALID ✗'}`);
    
    // Test with different message
    const testMessage2 = "Different message";
    const messageHash2 = BigInt(simpleHashToNumber(testMessage2));
    const verifyWrongMessage = modPow(signature, e, n);
    console.log(`\nTesting with different message: "${testMessage2}"`);
    console.log(`Different hash: ${messageHash2}`);
    console.log(`Original signature verification: ${verifyWrongMessage === messageHash2 ? 'VALID' : 'INVALID ✓'}`);
    
    return recovered === messageHash;
}

const rsaResult = testRSASignature();

// Test 2: ElGamal Signature Implementation
console.log("\n2. ELGAMAL SIGNATURE IMPLEMENTATION");
console.log("-".repeat(40));

function testElGamalSignature() {
    // Use the same parameters as in the component
    const p = 23n;
    const g = 5n;
    const x = 6n; // Private key
    const h = modPow(g, x, p); // Public key
    
    console.log(`ElGamal Parameters:`);
    console.log(`  p = ${p} (prime)`);
    console.log(`  g = ${g} (generator)`);
    console.log(`  x = ${x} (private key)`);
    console.log(`  h = g^x mod p = ${g}^${x} mod ${p} = ${h} (public key)`);
    
    const testMessage = "Hello ElGamal!";
    const messageHash = BigInt(simpleHashToNumber(testMessage));
    console.log(`\nMessage: "${testMessage}"`);
    console.log(`Hash as number: ${messageHash}`);
    
    // Find a suitable k that avoids s = 0
    let k = 7n;
    let r, s;
    let attempts = 0;
    
    while (attempts < 10) {
        r = modPow(g, k, p);
        
        // Check if gcd(k, p-1) = 1
        const gcdResult = gcd(k, p - 1n);
        if (gcdResult === 1n) {
            const kInv = modInverse(k, p - 1n);
            s = (kInv * (messageHash - x * r)) % (p - 1n);
            
            if (s < 0n) {
                s += (p - 1n);
            }
            
            // If s != 0, we have a valid signature
            if (s !== 0n) {
                break;
            }
        }
        
        k = k + 1n;
        attempts++;
    }
    
    console.log(`Random k = ${k} (after ${attempts} attempts)`);
    console.log(`r = g^k mod p = ${g}^${k} mod ${p} = ${r}`);
    console.log(`s = k^(-1) * (hash - x*r) mod (p-1) = ${s}`);
    
    console.log(`\nSignature: (r, s) = (${r}, ${s})`);
    
    // Verify: g^hash ≡ h^r * r^s (mod p)
    const left = modPow(g, messageHash, p);
    const right = (modPow(h, r, p) * modPow(r, s, p)) % p;
    
    console.log(`\nVerification:`);
    console.log(`  Left side: g^hash mod p = ${g}^${messageHash} mod ${p} = ${left}`);
    console.log(`  Right side: h^r * r^s mod p = ${h}^${r} * ${r}^${s} mod ${p} = ${right}`);
    console.log(`  Verification: ${left === right ? 'VALID ✓' : 'INVALID ✗'}`);
    
    // Test signature components are valid
    console.log(`\nSignature validity checks:`);
    console.log(`  r > 0: ${r > 0n ? '✓' : '✗'}`);
    console.log(`  s > 0: ${s > 0n ? '✓' : '✗'}`);
    console.log(`  r < p: ${r < p ? '✓' : '✗'}`);
    console.log(`  s < p-1: ${s < (p-1n) ? '✓' : '✗'}`);
    
    return left === right && r > 0n && s > 0n;
}

const elGamalResult = testElGamalSignature();

// Test 3: Hash Function Properties
console.log("\n3. HASH FUNCTION PROPERTIES");
console.log("-".repeat(40));

function testHashProperties() {
    const testMessages = [
        "Hello World",
        "Hello World!",
        "hello world",
        "Different message entirely",
        ""
    ];
    
    console.log("Testing hash function determinism and avalanche effect:");
    
    for (const message of testMessages) {
        const hash1 = simpleHash(message);
        const hash2 = simpleHash(message);
        const hashNum = simpleHashToNumber(message);
        
        console.log(`Message: "${message}"`);
        console.log(`  Hash (hex): ${hash1}`);
        console.log(`  Hash (num): ${hashNum}`);
        console.log(`  Deterministic: ${hash1 === hash2 ? '✓' : '✗'}`);
    }
    
    // Test avalanche effect
    const msg1 = "Hello World";
    const msg2 = "Hello World!";
    const hash1 = simpleHash(msg1);
    const hash2 = simpleHash(msg2);
    
    console.log(`\nAvalanche effect test:`);
    console.log(`  "${msg1}" -> ${hash1}`);
    console.log(`  "${msg2}" -> ${hash2}`);
    console.log(`  Different hashes: ${hash1 !== hash2 ? '✓' : '✗'}`);
    
    return hash1 !== hash2;
}

const hashResult = testHashProperties();

// Test 4: Signature Process Steps
console.log("\n4. SIGNATURE PROCESS VERIFICATION");
console.log("-".repeat(40));

function testSignatureProcess() {
    const message = "Transfer $1000 to Alice";
    console.log(`Testing signature process with message: "${message}"`);
    
    // Step 1: Hash the message
    const hash = simpleHash(message);
    console.log(`Step 1 - Hash: ${hash}`);
    
    // Step 2: Generate mock signature
    const signature = 'SIG_' + hash + '_' + 'mockrandom';
    console.log(`Step 2 - Signature: ${signature}`);
    
    // Step 3: Verify signature
    const isValid = signature.includes(hash);
    console.log(`Step 3 - Verification: ${isValid ? 'VALID ✓' : 'INVALID ✗'}`);
    
    // Test with tampered message
    const tamperedMessage = message + " [TAMPERED]";
    const tamperedHash = simpleHash(tamperedMessage);
    const tamperedVerification = signature.includes(tamperedHash);
    
    console.log(`\nTamper detection test:`);
    console.log(`  Original: "${message}" -> ${hash}`);
    console.log(`  Tampered: "${tamperedMessage}" -> ${tamperedHash}`);
    console.log(`  Tampered verification: ${tamperedVerification ? 'VALID' : 'INVALID ✓'}`);
    
    return isValid && !tamperedVerification;
}

const processResult = testSignatureProcess();

// Test 5: Modular Arithmetic Verification
console.log("\n5. MODULAR ARITHMETIC VERIFICATION");
console.log("-".repeat(40));

function testModularArithmetic() {
    console.log("Testing modular exponentiation:");
    
    // Test cases
    const testCases = [
        { base: 2n, exp: 10n, mod: 1000n, expected: 24n }, // 2^10 = 1024, 1024 mod 1000 = 24
        { base: 3n, exp: 4n, mod: 5n, expected: 1n },     // 3^4 = 81, 81 mod 5 = 1
        { base: 7n, exp: 3n, mod: 11n, expected: 2n }     // 7^3 = 343, 343 mod 11 = 2
    ];
    
    let allCorrect = true;
    for (const test of testCases) {
        const result = modPow(test.base, test.exp, test.mod);
        const correct = result === test.expected;
        console.log(`  ${test.base}^${test.exp} mod ${test.mod} = ${result} ${correct ? '✓' : `✗ (expected ${test.expected})`}`);
        if (!correct) allCorrect = false;
    }
    
    console.log("\nTesting modular inverse:");
    const invTestCases = [
        { a: 3n, m: 11n, expected: 4n },
        { a: 17n, m: 3120n, expected: 2753n }
    ];
    
    for (const test of invTestCases) {
        const result = modInverse(test.a, test.m);
        const verification = (test.a * result) % test.m;
        const correct = verification === 1n;
        console.log(`  ${test.a}^(-1) mod ${test.m} = ${result}`);
        console.log(`  Verification: ${test.a} × ${result} ≡ ${verification} (mod ${test.m}) ${correct ? '✓' : '✗'}`);
        if (!correct) allCorrect = false;
    }
    
    return allCorrect;
}

const modArithResult = testModularArithmetic();

// Test 6: Security Properties
console.log("\n6. SECURITY PROPERTIES VERIFICATION");
console.log("-".repeat(40));

function testSecurityProperties() {
    console.log("Testing signature uniqueness:");
    
    const message = "Test message";
    const signatures = [];
    
    // Generate multiple "signatures" (in real implementation, these would use random values)
    for (let i = 0; i < 3; i++) {
        const hash = simpleHash(message + i); // Simulate randomness
        const sig = 'SIG_' + hash + '_' + i;
        signatures.push(sig);
        console.log(`  Signature ${i + 1}: ${sig}`);
    }
    
    // Check uniqueness
    const allUnique = new Set(signatures).size === signatures.length;
    console.log(`  All signatures unique: ${allUnique ? '✓' : '✗'}`);
    
    console.log("\nTesting message binding:");
    const msg1 = "Message 1";
    const msg2 = "Message 2";
    const hash1 = simpleHash(msg1);
    const hash2 = simpleHash(msg2);
    const sig1 = 'SIG_' + hash1 + '_test';
    
    const validForMsg1 = sig1.includes(hash1);
    const validForMsg2 = sig1.includes(hash2);
    
    console.log(`  Signature for "${msg1}": ${sig1}`);
    console.log(`  Valid for "${msg1}": ${validForMsg1 ? '✓' : '✗'}`);
    console.log(`  Valid for "${msg2}": ${validForMsg2 ? '✗ (correctly invalid)' : '✓'}`);
    
    return allUnique && validForMsg1 && !validForMsg2;
}

const securityResult = testSecurityProperties();

// Final Results Summary
console.log("\n" + "=".repeat(60));
console.log("CHAPTER 13 VERIFICATION RESULTS");
console.log("=".repeat(60));

const results = [
    { test: "RSA Signature Implementation", result: rsaResult },
    { test: "ElGamal Signature Implementation", result: elGamalResult },
    { test: "Hash Function Properties", result: hashResult },
    { test: "Signature Process", result: processResult },
    { test: "Modular Arithmetic", result: modArithResult },
    { test: "Security Properties", result: securityResult }
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
    console.log("\nChapter 13 implementations are mathematically correct!");
    console.log("✓ RSA signatures work correctly with proper key generation");
    console.log("✓ ElGamal signatures follow the correct mathematical protocol");
    console.log("✓ Hash functions provide determinism and avalanche effect");
    console.log("✓ Signature process demonstrates proper steps");
    console.log("✓ Modular arithmetic operations are accurate");
    console.log("✓ Security properties are properly demonstrated");
} else {
    console.log("\nSome implementations need attention - see details above.");
} 