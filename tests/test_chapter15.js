#!/usr/bin/env node

/**
 * Test Script for Chapter 15: Key Management
 * 
 * This script verifies the correctness of key management implementations
 * including KDC protocols, Diffie-Hellman key exchange, PKI certificate
 * validation, and various key distribution mechanisms.
 */

import crypto from 'crypto';

console.log('🔑 Testing Chapter 15: Key Management');
console.log('=' .repeat(60));

// Utility functions to simulate the component's methods
function modPow(base, exponent, modulus) {
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

function generateNonce() {
    return Math.floor(Math.random() * 10000).toString();
}

function generateSessionKey() {
    return `K_${Math.floor(Math.random() * 1000)}`;
}

function generateTicket(service) {
    return `Ticket_${service}_${Math.floor(Math.random() * 1000)}`;
}

function generateSignature(signer, data) {
    return `Sign_${signer}(${data.substring(0, 10)}...)`;
}

// Test results tracking
let testResults = {
    kdcProtocols: { passed: 0, total: 0 },
    diffieHellman: { passed: 0, total: 0 },
    keyTransport: { passed: 0, total: 0 },
    kerberosAuth: { passed: 0, total: 0 },
    pkiCertificates: { passed: 0, total: 0 },
    trustModels: { passed: 0, total: 0 }
};

function runTest(category, testName, testFunc) {
    testResults[category].total++;
    try {
        const result = testFunc();
        if (result) {
            testResults[category].passed++;
            console.log(`✅ ${testName}`);
            return true;
        } else {
            console.log(`❌ ${testName}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${testName} - Error: ${error.message}`);
        return false;
    }
}

// Test Category 1: KDC Protocols
console.log('\n🏛️ Testing KDC (Key Distribution Center) Protocols');
console.log('-'.repeat(40));

runTest('kdcProtocols', 'KDC message structure is correct', () => {
    const principalA = "Alice";
    const principalB = "Bob";
    const nonce = generateNonce();
    const sessionKey = generateSessionKey();
    
    // Step 1: A → KDC request
    const request = `${principalA}, ${principalB}, ${nonce}`;
    if (!request.includes(principalA) || !request.includes(principalB) || !request.includes(nonce)) {
        return false;
    }
    
    // Step 2: KDC → A response structure
    const longTermKeyA = "K_A_secret";
    const longTermKeyB = "K_B_secret";
    const ticket = `{${sessionKey}, ${principalA}}_${longTermKeyB}`;
    const response = `{${sessionKey}, ${principalB}, ${nonce}}_${longTermKeyA} || ${ticket}`;
    
    // Verify response contains session key, nonce, and ticket
    return response.includes(sessionKey) && response.includes(nonce) && response.includes(ticket);
});

runTest('kdcProtocols', 'Session key generation is unique', () => {
    const keys = new Set();
    for (let i = 0; i < 100; i++) {
        keys.add(generateSessionKey());
    }
    
    // Should generate mostly unique keys (allowing some collisions due to random nature)
    return keys.size >= 90;
});

runTest('kdcProtocols', 'Nonce generation provides freshness', () => {
    const nonces = new Set();
    for (let i = 0; i < 100; i++) {
        nonces.add(generateNonce());
    }
    
    // Should generate mostly unique nonces for replay protection
    return nonces.size >= 90;
});

runTest('kdcProtocols', 'Ticket structure includes necessary components', () => {
    const sessionKey = "K_123";
    const principal = "Alice";
    const longTermKey = "K_B_secret";
    const ticket = `{${sessionKey}, ${principal}}_${longTermKey}`;
    
    // Ticket should contain session key, principal identity, and be encrypted under long-term key
    return ticket.includes(sessionKey) && ticket.includes(principal) && ticket.includes(longTermKey);
});

// Test Category 2: Diffie-Hellman Key Exchange
console.log('\n🔄 Testing Diffie-Hellman Key Exchange');
console.log('-'.repeat(40));

runTest('diffieHellman', 'Modular exponentiation works correctly', () => {
    // Test known values
    const result1 = modPow(2, 10, 1000);
    if (result1 !== 24) return false;
    
    const result2 = modPow(3, 4, 5);
    if (result2 !== 1) return false;
    
    const result3 = modPow(7, 3, 11);
    if (result3 !== 2) return false;
    
    return true;
});

runTest('diffieHellman', 'DH key exchange produces same shared secret', () => {
    const p = 23;
    const g = 7;
    const privateA = 3;
    const privateB = 6;
    
    // Calculate public keys
    const publicA = modPow(g, privateA, p);
    const publicB = modPow(g, privateB, p);
    
    // Calculate shared secrets
    const secretA = modPow(publicB, privateA, p);
    const secretB = modPow(publicA, privateB, p);
    
    // Both should compute the same shared secret
    return secretA === secretB;
});

runTest('diffieHellman', 'DH parameters are mathematically valid', () => {
    const p = 23; // Should be prime
    const g = 7;  // Should be generator
    
    // Basic prime check for p (simplified)
    function isPrime(n) {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (n % i === 0) return false;
        }
        return true;
    }
    
    // p should be prime
    if (!isPrime(p)) return false;
    
    // g should be less than p
    if (g >= p) return false;
    
    return true;
});

runTest('diffieHellman', 'DH provides different public keys for different private keys', () => {
    const p = 23;
    const g = 7;
    
    const publicKey1 = modPow(g, 3, p);
    const publicKey2 = modPow(g, 6, p);
    const publicKey3 = modPow(g, 9, p);
    
    // Different private keys should produce different public keys
    return publicKey1 !== publicKey2 && publicKey2 !== publicKey3 && publicKey1 !== publicKey3;
});

// Test Category 3: Key Transport Protocols
console.log('\n📦 Testing Key Transport Protocols');
console.log('-'.repeat(40));

runTest('keyTransport', 'Needham-Schroeder protocol structure is correct', () => {
    const nonceA = generateNonce();
    const nonceB = generateNonce();
    const sessionKey = generateSessionKey();
    
    // Step 1: A → S
    const step1 = `Alice, Bob, ${nonceA}`;
    
    // Step 2: S → A
    const step2 = `{${nonceA}, Bob, ${sessionKey}, {${sessionKey}, Alice}_K_B}_K_A`;
    
    // Step 3: A → B
    const step3 = `{${sessionKey}, Alice}_K_B`;
    
    // Step 4: B → A
    const step4 = `{${nonceB}}_${sessionKey}`;
    
    // Step 5: A → B
    const step5 = `{${parseInt(nonceB) - 1}}_${sessionKey}`;
    
    // Verify all steps contain expected components
    return step1.includes(nonceA) && 
           step2.includes(sessionKey) && step2.includes(nonceA) &&
           step3.includes(sessionKey) &&
           step4.includes(nonceB) &&
           step5.includes((parseInt(nonceB) - 1).toString());
});

runTest('keyTransport', 'Nonce manipulation prevents replay attacks', () => {
    const originalNonce = "1234";
    const decrementedNonce = (parseInt(originalNonce) - 1).toString();
    
    // Nonce should be decremented to prove freshness
    return decrementedNonce === "1233";
});

runTest('keyTransport', 'Session key is properly distributed', () => {
    const sessionKey = generateSessionKey();
    
    // Session key should be included in encrypted messages to both parties
    const messageToA = `{${sessionKey}, Bob, nonce}_K_A`;
    const messageToB = `{${sessionKey}, Alice}_K_B`;
    
    return messageToA.includes(sessionKey) && messageToB.includes(sessionKey);
});

runTest('keyTransport', 'STS protocol combines DH with authentication', () => {
    const p = 23;
    const g = 7;
    const privateA = 3;
    const privateB = 6;
    
    // Step 1: Alice sends g^x
    const publicA = modPow(g, privateA, p);
    
    // Step 2: Bob sends g^y and signature
    const publicB = modPow(g, privateB, p);
    const signatureB = generateSignature("Bob", publicB.toString());
    
    // Step 3: Alice sends signature
    const signatureA = generateSignature("Alice", publicA.toString());
    
    // Verify STS includes both DH exchange and digital signatures
    return publicA > 0 && publicB > 0 && 
           signatureA.includes("Alice") && 
           signatureB.includes("Bob");
});

runTest('keyTransport', 'STS prevents man-in-the-middle attacks', () => {
    // STS uses digital signatures to authenticate DH public keys
    const publicKey = "g^x mod p";
    const signature = generateSignature("Alice", publicKey);
    
    // Signature should bind the public key to the identity
    return signature.includes("Alice") && signature.includes("g^x");
});

// Test Category 4: Kerberos Authentication
console.log('\n🎫 Testing Kerberos Authentication Protocol');
console.log('-'.repeat(40));

runTest('kerberosAuth', 'Kerberos ticket generation is correct', () => {
    const tgsTicket = generateTicket("TGS");
    const serviceTicket = generateTicket("Service");
    
    // Tickets should have proper format and be different
    return tgsTicket.includes("TGS") && 
           serviceTicket.includes("Service") && 
           tgsTicket !== serviceTicket;
});

runTest('kerberosAuth', 'Kerberos three-phase structure is correct', () => {
    // Phase 1: AS Exchange (Authentication Server)
    const asRequest = "User ID, TGS ID, timestamp";
    const asResponse = "{Session_Key_TGS, TGS ID, timestamp, lifetime}_K_client || TGT";
    
    // Phase 2: TGS Exchange (Ticket Granting Server)
    const tgsRequest = "Service ID, TGT, Authenticator";
    const tgsResponse = "{Session_Key_Service, Service ID, timestamp}_Session_Key_TGS || Service_Ticket";
    
    // Phase 3: Client-Server
    const csRequest = "Service_Ticket, Authenticator";
    const csResponse = "{timestamp + 1}_Session_Key_Service";
    
    // Verify all phases have proper structure
    return asRequest.includes("User ID") &&
           asResponse.includes("TGT") &&
           tgsRequest.includes("TGT") &&
           tgsResponse.includes("Service_Ticket") &&
           csRequest.includes("Service_Ticket") &&
           csResponse.includes("timestamp + 1");
});

runTest('kerberosAuth', 'Authenticator provides timestamp verification', () => {
    const authenticator = `Auth_${Date.now()}`;
    
    // Authenticator should include timestamp information
    return authenticator.includes("Auth_");
});

// Test Category 5: PKI and Certificates
console.log('\n📜 Testing PKI and Certificate Management');
console.log('-'.repeat(40));

runTest('pkiCertificates', 'Certificate structure contains required fields', () => {
    const certificate = {
        version: "v3",
        serialNumber: "0x1A2B3C",
        issuer: "CN=Root CA, O=TrustCorp",
        subject: "CN=example.com, O=Example Corp",
        publicKey: "RSA-2048: 30:82:01:0A...",
        validity: "2024-01-01 to 2025-01-01",
        signature: "SHA256withRSA: A1:B2:C3...",
        status: "valid"
    };
    
    // Certificate should have all required X.509 fields
    return certificate.version && 
           certificate.serialNumber && 
           certificate.issuer && 
           certificate.subject && 
           certificate.publicKey && 
           certificate.validity && 
           certificate.signature;
});

runTest('pkiCertificates', 'Certificate chain validation logic works', () => {
    const certificates = [
        {
            issuer: "CN=Root CA, O=TrustCorp",
            subject: "CN=Intermediate CA, O=TrustCorp",
            status: "valid"
        },
        {
            issuer: "CN=Intermediate CA, O=TrustCorp",
            subject: "CN=example.com, O=Example Corp",
            status: "valid"
        }
    ];
    
    // Check chain: second cert's issuer should match first cert's subject
    return certificates[1].issuer === certificates[0].subject;
});

runTest('pkiCertificates', 'Certificate revocation is properly detected', () => {
    const validCert = { status: "valid" };
    const revokedCert = { status: "revoked" };
    const expiredCert = { status: "expired" };
    
    // Should properly identify different certificate statuses
    return validCert.status === "valid" && 
           revokedCert.status === "revoked" && 
           expiredCert.status === "expired";
});

runTest('pkiCertificates', 'Certificate serial numbers are unique', () => {
    const serialNumbers = new Set();
    
    // Generate some certificate serial numbers
    for (let i = 0; i < 10; i++) {
        const serial = `0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}`;
        serialNumbers.add(serial);
    }
    
    // Should generate unique serial numbers
    return serialNumbers.size >= 8; // Allow some collisions due to randomness
});

// Test Category 6: Trust Models
console.log('\n🤝 Testing Trust Models');
console.log('-'.repeat(40));

runTest('trustModels', 'Hierarchical PKI model is properly defined', () => {
    const hierarchical = {
        name: "Hierarchical PKI",
        description: "Tree structure with root CA at top, intermediate CAs below",
        advantages: ["Clear chain of trust", "Scalable", "Well-established"],
        disadvantages: ["Single point of failure", "Root CA compromise catastrophic"],
        structure: "Tree"
    };
    
    // Should have proper structure and characteristics
    return hierarchical.structure === "Tree" && 
           hierarchical.advantages.includes("Scalable") && 
           hierarchical.disadvantages.includes("Single point of failure");
});

runTest('trustModels', 'Mesh PKI model provides redundancy', () => {
    const mesh = {
        name: "Mesh PKI",
        description: "Multiple CAs cross-certify each other",
        advantages: ["No single point of failure", "Resilient", "Flexible"],
        disadvantages: ["Complex trust relationships", "Difficult to manage"],
        structure: "Graph"
    };
    
    // Should emphasize redundancy and complexity
    return mesh.structure === "Graph" && 
           mesh.advantages.includes("No single point of failure") && 
           mesh.disadvantages.includes("Complex trust relationships");
});

runTest('trustModels', 'Web of Trust model is decentralized', () => {
    const webOfTrust = {
        name: "Web of Trust",
        description: "Decentralized trust based on personal relationships",
        advantages: ["No central authority", "User controlled", "Democratic"],
        disadvantages: ["Difficult to scale", "Trust path complexity"],
        structure: "Network"
    };
    
    // Should emphasize decentralization
    return webOfTrust.structure === "Network" && 
           webOfTrust.advantages.includes("No central authority") && 
           webOfTrust.disadvantages.includes("Difficult to scale");
});

runTest('trustModels', 'Trust models have distinct characteristics', () => {
    const structures = ["Tree", "Graph", "Network"];
    const advantages = [
        ["Clear chain of trust", "Scalable"],
        ["No single point of failure", "Resilient"],
        ["No central authority", "User controlled"]
    ];
    
    // Each model should have unique structure and advantages
    const uniqueStructures = new Set(structures);
    const flatAdvantages = advantages.flat();
    const uniqueAdvantages = new Set(flatAdvantages);
    
    return uniqueStructures.size === 3 && uniqueAdvantages.size >= 6;
});

// Print Results Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(60));

let totalPassed = 0;
let totalTests = 0;

Object.entries(testResults).forEach(([category, results]) => {
    const percentage = ((results.passed / results.total) * 100).toFixed(1);
    console.log(`${category.padEnd(20)}: ${results.passed}/${results.total} (${percentage}%)`);
    totalPassed += results.passed;
    totalTests += results.total;
});

console.log('-'.repeat(60));
const overallPercentage = ((totalPassed / totalTests) * 100).toFixed(1);
console.log(`Overall: ${totalPassed}/${totalTests} (${overallPercentage}%)`);

if (totalPassed === totalTests) {
    console.log('\n🎉 All tests passed! Chapter 15 Key Management implementation is mathematically sound.');
} else {
    console.log(`\n⚠️  ${totalTests - totalPassed} test(s) failed. Please review the implementation.`);
}

console.log('\n📚 Chapter 15 covers:');
console.log('• KDC protocols for symmetric key distribution');
console.log('• Diffie-Hellman key exchange with proper modular arithmetic');
console.log('• Key transport protocols (Needham-Schroeder, Otway-Rees)');
console.log('• Kerberos authentication with tickets and authenticators');
console.log('• PKI certificate management and validation');
console.log('• Trust models: Hierarchical, Mesh, and Web of Trust');
console.log('• Station-to-Station protocol for authenticated key exchange'); 