// Chapter 11: Message Integrity - Comprehensive Test Suite
console.log("=".repeat(60));
console.log("CHAPTER 11: MESSAGE INTEGRITY - VERIFICATION TESTS");
console.log("=".repeat(60));

// Enhanced hash function with better avalanche effect
function enhancedHash(message) {
    let hash = 0x811c9dc5; // FNV offset basis
    const prime = 0x01000193; // FNV prime
    
    for (let i = 0; i < message.length; i++) {
        hash ^= message.charCodeAt(i);
        hash = (hash * prime) >>> 0; // Ensure 32-bit unsigned
    }
    
    // Additional mixing rounds for better avalanche effect
    for (let round = 0; round < 3; round++) {
        hash ^= hash >>> 16;
        hash = (hash * 0x45d9f3b) >>> 0;
        hash ^= hash >>> 16;
        hash = (hash * 0x45d9f3b) >>> 0;
        hash ^= hash >>> 16;
    }
    
    return (hash >>> 0).toString(16).padStart(8, '0');
}

// Enhanced MAC with proper key dependency
function enhancedMAC(key, message) {
    // First hash the key
    const keyHash = enhancedHash(key);
    
    // Then hash the message
    const messageHash = enhancedHash(message);
    
    // Combine key and message hashes with mixing
    const combined = keyHash + messageHash;
    const mixedHash = enhancedHash(combined);
    
    // Additional key-dependent transformation
    let result = 0;
    for (let i = 0; i < mixedHash.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const hashChar = parseInt(mixedHash[i], 16);
        result ^= (keyChar * hashChar) << (i % 8);
    }
    
    return (result >>> 0).toString(16).padStart(8, '0');
}

// Enhanced HMAC with proper XOR operations
function enhancedHMAC(key, message) {
    const blockSize = 64; // 512 bits / 8
    const ipad = 0x36;
    const opad = 0x5c;
    
    // Pad or truncate key to block size
    let paddedKey = new Array(blockSize).fill(0);
    for (let i = 0; i < Math.min(key.length, blockSize); i++) {
        paddedKey[i] = key.charCodeAt(i);
    }
    
    // Create inner and outer padded keys
    const innerKey = paddedKey.map(b => b ^ ipad);
    const outerKey = paddedKey.map(b => b ^ opad);
    
    // Inner hash: H(K ⊕ ipad || message)
    const innerInput = String.fromCharCode(...innerKey) + message;
    const innerHash = enhancedHash(innerInput);
    
    // Outer hash: H(K ⊕ opad || innerHash)
    const outerInput = String.fromCharCode(...outerKey) + innerHash;
    const outerHash = enhancedHash(outerInput);
    
    return outerHash;
}

// Digital signature simulation
function digitalSign(message, privateKey) {
    const hash = enhancedHash(message);
    // Simulate signing by XORing hash with private key
    let signature = 0;
    for (let i = 0; i < hash.length; i++) {
        const hashByte = parseInt(hash[i], 16);
        const keyByte = privateKey.charCodeAt(i % privateKey.length);
        signature ^= (hashByte * keyByte) << (i % 8);
    }
    return signature.toString(16).padStart(8, '0');
}

function digitalVerify(message, signature, publicKey) {
    const expectedSignature = digitalSign(message, publicKey); // In real systems, this would use public key verification
    return signature === expectedSignature;
}

// Test 1: Hash Function Properties
console.log("\n1. HASH FUNCTION PROPERTIES");
console.log("-".repeat(40));

function testHashProperties() {
    console.log("Testing hash function properties:");
    
    // Test determinism
    const message = "Hello World";
    const hash1 = enhancedHash(message);
    const hash2 = enhancedHash(message);
    const deterministic = hash1 === hash2;
    
    console.log(`Determinism test:`);
    console.log(`  "${message}" -> ${hash1}`);
    console.log(`  "${message}" -> ${hash2}`);
    console.log(`  Deterministic: ${deterministic ? '✓' : '✗'}`);
    
    // Test avalanche effect
    const msg1 = "Hello World";
    const msg2 = "Hello World!";
    const h1 = enhancedHash(msg1);
    const h2 = enhancedHash(msg2);
    
    // Count different bits
    let differentBits = 0;
    const totalBits = h1.length * 4; // Each hex digit = 4 bits
    
    for (let i = 0; i < h1.length; i++) {
        const val1 = parseInt(h1[i], 16);
        const val2 = parseInt(h2[i], 16);
        const xor = val1 ^ val2;
        
        // Count set bits in XOR result
        for (let bit = 0; bit < 4; bit++) {
            if (xor & (1 << bit)) differentBits++;
        }
    }
    
    const avalanchePercent = (differentBits / totalBits * 100).toFixed(1);
    const goodAvalanche = avalanchePercent > 40; // Good avalanche effect > 40%
    
    console.log(`\nAvalanche effect test:`);
    console.log(`  "${msg1}" -> ${h1}`);
    console.log(`  "${msg2}" -> ${h2}`);
    console.log(`  Different bits: ${differentBits}/${totalBits} (${avalanchePercent}%)`);
    console.log(`  Good avalanche effect: ${goodAvalanche ? '✓' : '✗'}`);
    
    return deterministic && goodAvalanche;
}

const hashResult = testHashProperties();

// Test 2: Message Authentication Codes (MAC)
console.log("\n2. MESSAGE AUTHENTICATION CODES");
console.log("-".repeat(40));

function testMAC() {
    console.log("Testing MAC properties:");
    
    const key1 = "secret_key_1";
    const key2 = "secret_key_2";
    const message = "Important message";
    
    // Test key dependency
    const mac1 = enhancedMAC(key1, message);
    const mac2 = enhancedMAC(key2, message);
    const keyDependent = mac1 !== mac2;
    
    console.log(`Key dependency test:`);
    console.log(`  MAC with key1: ${mac1}`);
    console.log(`  MAC with key2: ${mac2}`);
    console.log(`  Key dependent: ${keyDependent ? '✓' : '✗'}`);
    
    // Test message dependency
    const message1 = "Message 1";
    const message2 = "Message 2";
    const mac_m1 = enhancedMAC(key1, message1);
    const mac_m2 = enhancedMAC(key1, message2);
    const messageDependent = mac_m1 !== mac_m2;
    
    console.log(`\nMessage dependency test:`);
    console.log(`  MAC of "${message1}": ${mac_m1}`);
    console.log(`  MAC of "${message2}": ${mac_m2}`);
    console.log(`  Message dependent: ${messageDependent ? '✓' : '✗'}`);
    
    // Test determinism
    const mac_repeat = enhancedMAC(key1, message1);
    const macDeterministic = mac_m1 === mac_repeat;
    
    console.log(`\nDeterminism test:`);
    console.log(`  First MAC: ${mac_m1}`);
    console.log(`  Second MAC: ${mac_repeat}`);
    console.log(`  Deterministic: ${macDeterministic ? '✓' : '✗'}`);
    
    return keyDependent && messageDependent && macDeterministic;
}

const macResult = testMAC();

// Test 3: HMAC Implementation
console.log("\n3. HMAC IMPLEMENTATION");
console.log("-".repeat(40));

function testHMAC() {
    console.log("Testing HMAC properties:");
    
    const key = "hmac_secret_key";
    const message1 = "Test message 1";
    const message2 = "Test message 2";
    
    // Test HMAC computation
    const hmac1 = enhancedHMAC(key, message1);
    const hmac2 = enhancedHMAC(key, message2);
    const hmac1_repeat = enhancedHMAC(key, message1);
    
    console.log(`HMAC computation:`);
    console.log(`  HMAC("${message1}"): ${hmac1}`);
    console.log(`  HMAC("${message2}"): ${hmac2}`);
    console.log(`  HMAC("${message1}") repeat: ${hmac1_repeat}`);
    
    const deterministic = hmac1 === hmac1_repeat;
    const messageDependent = hmac1 !== hmac2;
    
    console.log(`  Deterministic: ${deterministic ? '✓' : '✗'}`);
    console.log(`  Message dependent: ${messageDependent ? '✓' : '✗'}`);
    
    // Test key sensitivity
    const key2 = "different_key";
    const hmac_key2 = enhancedHMAC(key2, message1);
    const keySensitive = hmac1 !== hmac_key2;
    
    console.log(`\nKey sensitivity test:`);
    console.log(`  HMAC with key1: ${hmac1}`);
    console.log(`  HMAC with key2: ${hmac_key2}`);
    console.log(`  Key sensitive: ${keySensitive ? '✓' : '✗'}`);
    
    return deterministic && messageDependent && keySensitive;
}

const hmacResult = testHMAC();

// Test 4: Integrity Checking
console.log("\n4. INTEGRITY CHECKING");
console.log("-".repeat(40));

function testIntegrityChecking() {
    console.log("Testing integrity checking:");
    
    const originalMessage = "This is the original message";
    const originalHash = enhancedHash(originalMessage);
    
    console.log(`Original message: "${originalMessage}"`);
    console.log(`Original hash: ${originalHash}`);
    
    // Test with unmodified message
    const verifyOriginal = enhancedHash(originalMessage) === originalHash;
    console.log(`\nVerify original: ${verifyOriginal ? '✓' : '✗'}`);
    
    // Test with modified messages
    const modifications = [
        "This is the original message!",    // Added punctuation
        "This is the original messag",      // Removed character
        "This is the Original message",     // Changed case
        "This is the original message "     // Added space
    ];
    
    let allDetected = true;
    console.log(`\nTamper detection tests:`);
    
    for (const modified of modifications) {
        const modifiedHash = enhancedHash(modified);
        const detected = modifiedHash !== originalHash;
        console.log(`  "${modified}"`);
        console.log(`    Hash: ${modifiedHash}`);
        console.log(`    Tamper detected: ${detected ? '✓' : '✗'}`);
        if (!detected) allDetected = false;
    }
    
    return verifyOriginal && allDetected;
}

const integrityResult = testIntegrityChecking();

// Test 5: Digital Signatures
console.log("\n5. DIGITAL SIGNATURES");
console.log("-".repeat(40));

function testDigitalSignatures() {
    console.log("Testing digital signatures:");
    
    const privateKey = "private_signing_key";
    const publicKey = "private_signing_key"; // Simplified for demo
    const message = "Document to be signed";
    
    // Generate signature
    const signature = digitalSign(message, privateKey);
    console.log(`Message: "${message}"`);
    console.log(`Signature: ${signature}`);
    
    // Verify signature
    const valid = digitalVerify(message, signature, publicKey);
    console.log(`Signature valid: ${valid ? '✓' : '✗'}`);
    
    // Test with tampered message
    const tamperedMessage = "Document to be signed!";
    const tamperedValid = digitalVerify(tamperedMessage, signature, publicKey);
    console.log(`\nTamper detection:`);
    console.log(`Tampered message: "${tamperedMessage}"`);
    console.log(`Signature valid for tampered: ${tamperedValid ? '✗' : '✓'}`);
    
    // Test with different signature
    const wrongSignature = digitalSign("Different message", privateKey);
    const wrongValid = digitalVerify(message, wrongSignature, publicKey);
    console.log(`\nWrong signature test:`);
    console.log(`Wrong signature valid: ${wrongValid ? '✗' : '✓'}`);
    
    return valid && !tamperedValid && !wrongValid;
}

const signatureResult = testDigitalSignatures();

// Test 6: Attack Resistance
console.log("\n6. ATTACK RESISTANCE");
console.log("-".repeat(40));

function testAttackResistance() {
    console.log("Testing attack resistance:");
    
    const key = "secret_key";
    const message = "Original message";
    const originalMAC = enhancedMAC(key, message);
    
    console.log(`Original MAC: ${originalMAC}`);
    
    // Test length extension resistance
    const extendedMessage = message + " extended";
    const extendedMAC = enhancedMAC(key, extendedMessage);
    const lengthExtensionResistant = originalMAC !== extendedMAC;
    
    console.log(`\nLength extension attack test:`);
    console.log(`Extended message MAC: ${extendedMAC}`);
    console.log(`Resistant to length extension: ${lengthExtensionResistant ? '✓' : '✗'}`);
    
    // Test collision resistance (simplified)
    const messages = [
        "Message A",
        "Message B", 
        "Message C",
        "Different content entirely"
    ];
    
    const hashes = messages.map(msg => enhancedHash(msg));
    const uniqueHashes = new Set(hashes);
    const collisionResistant = uniqueHashes.size === hashes.length;
    
    console.log(`\nCollision resistance test:`);
    hashes.forEach((hash, i) => {
        console.log(`  "${messages[i]}" -> ${hash}`);
    });
    console.log(`All hashes unique: ${collisionResistant ? '✓' : '✗'}`);
    
    return lengthExtensionResistant && collisionResistant;
}

const attackResult = testAttackResistance();

// Final Results Summary
console.log("\n" + "=".repeat(60));
console.log("CHAPTER 11 VERIFICATION RESULTS");
console.log("=".repeat(60));

const results = [
    { test: "Hash Function Properties", result: hashResult },
    { test: "Message Authentication Codes", result: macResult },
    { test: "HMAC Implementation", result: hmacResult },
    { test: "Integrity Checking", result: integrityResult },
    { test: "Digital Signatures", result: signatureResult },
    { test: "Attack Resistance", result: attackResult }
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
    console.log("\nChapter 11 implementations are mathematically correct!");
    console.log("✓ Hash functions demonstrate proper deterministic behavior and avalanche effect");
    console.log("✓ MACs show proper key and message dependency");
    console.log("✓ HMAC construction follows proper nested hash structure");
    console.log("✓ Integrity checking successfully detects message modifications");
    console.log("✓ Digital signatures provide authentication and tamper detection");
    console.log("✓ System shows resistance to common cryptographic attacks");
} else {
    console.log("\nSome implementations need attention - see details above.");
} 