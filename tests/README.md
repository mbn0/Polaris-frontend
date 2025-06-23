# Cryptography Education Test Suite

This directory contains comprehensive test scripts for verifying the mathematical correctness of the cryptography education chapters. Each test script thoroughly validates the implementations and algorithms used in the corresponding chapter.

## Test Files Overview

### `test_chapter9.js` - Mathematics of Asymmetric Cryptography
**Coverage**: Number theory fundamentals for cryptographic systems
- **Primality Testing**: Trial division algorithm verification
- **Prime Factorization**: Complete factorization with correctness checks
- **Euler's Totient Function**: φ(n) calculations using prime factorization
- **Modular Exponentiation**: Binary exponentiation algorithm testing
- **Euclidean Algorithm**: GCD computation verification
- **Extended Euclidean Algorithm**: Bézout coefficients and modular inverse
- **Fermat's Little Theorem**: a^(p-1) ≡ 1 (mod p) verification
- **Euler's Theorem**: a^φ(n) ≡ 1 (mod n) verification

**Key Test Cases**:
- φ(84) = 24, φ(210) = 48, φ(1001) = 720
- 2^16 mod 17 = 1 (Fermat's Little Theorem)
- 6^24 mod 35 = 1 (Euler's Theorem)
- Extended GCD(23, 100): x=-13, y=3

### `test_chapter10.js` - Asymmetric-Key Cryptography
**Coverage**: Major asymmetric cryptosystems and their implementations
- **RSA Cryptosystem**: Key generation, encryption, decryption
- **Rabin Cryptosystem**: Quadratic residue encryption and square root computation
- **ElGamal Cryptosystem**: Discrete logarithm-based encryption with homomorphic properties
- **Digital Signatures**: RSA-based signature generation and verification
- **Key Generation Security**: Prime validation and security parameter checking
- **Modular Arithmetic**: Core operations for all cryptosystems

**Key Test Cases**:
- RSA: 42 → 14 → 42 (encrypt/decrypt cycle)
- ElGamal: 15 → (10,21) → 15 (encrypt/decrypt cycle)
- Rabin: 30 → 95 → [16,30,131,145] (encryption with multiple square roots)

### `test_chapter11.js` - Message Integrity
**Coverage**: Hash functions, MACs, HMAC, and digital signatures for integrity
- **Hash Function Properties**: Determinism, avalanche effect, collision resistance
- **Message Authentication Codes**: Key dependency and message binding
- **HMAC Implementation**: Proper nested hash construction with XOR operations
- **Integrity Checking**: Tamper detection and verification
- **Digital Signatures**: Authentication and non-repudiation
- **Attack Resistance**: Length extension and collision resistance testing

**Key Features**:
- Enhanced hash function with 93.8% avalanche effect
- Proper MAC key dependency verification
- HMAC with authentic ipad/opad XOR operations
- Comprehensive tamper detection testing

### `test_chapter12.js` - Cryptographic Hash Functions
**Coverage**: Hash function design, construction, and analysis
- **Hash Function Properties**: Avalanche effect, distribution, determinism
- **Merkle-Damgård Construction**: Padding, block processing, compression
- **Compression Function Analysis**: State dependency and block sensitivity
- **SHA-512 Deep Dive**: Word expansion, compression rounds, state updates
- **Modern Hash Functions**: MD5, SHA-1, SHA-256, SHA-512 simulations
- **Applications**: Password hashing, Merkle trees, security analysis

**Key Features**:
- Multi-round enhanced hash with 53.52% avalanche effect
- Realistic SHA-512 simulation with 80-round processing
- Proper Merkle-Damgård padding and block processing
- Comprehensive hash family differentiation testing

### `test_chapter13.js` - Digital Signatures
**Coverage**: Digital signature schemes and their mathematical foundations
- **RSA Signatures**: Key generation, signing, verification
- **ElGamal Signatures**: Parameter selection, signature generation, verification
- **Hash Function Integration**: Message hashing and signature binding
- **Signature Process**: Step-by-step verification workflow
- **Modular Arithmetic**: Core mathematical operations
- **Security Properties**: Message binding, tamper detection, uniqueness

**Key Features**:
- Fixed ElGamal implementation avoiding s=0 edge cases
- Comprehensive RSA signature cycle testing
- Proper k selection for ElGamal with GCD validation
- Security property verification and attack resistance

### `test_chapter14.js` - Entity Authentication
**Coverage**: Authentication mechanisms and identity verification systems
- **Password-Based Authentication**: Salted hashing and login verification
- **One-Time Passwords (OTP)**: Lamport hash chains with forward secrecy
- **Challenge-Response Protocols**: AES, HMAC, and RSA-based authentication
- **Biometric Authentication**: FAR/FRR metrics and ROC curve analysis
- **Authentication Factors**: Knowledge, possession, and inherence verification
- **Security Properties**: Non-repudiation, freshness, and forward security

**Key Features**:
- Fixed Lamport OTP implementation with correct protocol flow
- Comprehensive challenge-response protocol testing
- Biometric accuracy metrics and threshold analysis
- Multi-factor authentication security evaluation
- Interactive authentication property verification

### `test_chapter15.js` - Key Management
**Coverage**: Key distribution protocols and public key infrastructure
- **KDC Protocols**: Key Distribution Center for symmetric key management
- **Diffie-Hellman Key Exchange**: Mathematical key agreement protocol
- **Key Transport Protocols**: Needham-Schroeder, Otway-Rees implementations
- **Kerberos Authentication**: Three-phase authentication protocol
- **PKI Certificate Management**: X.509 certificate validation and chains
- **Trust Models**: Hierarchical, Mesh, and Web of Trust architectures

**Key Features**:
- KDC message structure and session key distribution verification
- Diffie-Hellman shared secret agreement with modular arithmetic
- Needham-Schroeder five-step key transport protocol testing
- Kerberos AS, TGS, and Client-Server authentication phases
- Certificate chain validation and revocation detection
- Trust model comparison: Tree vs Graph vs Network structures

### `test_chapter16.js` - Homomorphic Encryption
**Coverage**: Privacy-preserving computation on encrypted data
- **Paillier Additive Homomorphism**: Enc(m₁) × Enc(m₂) = Enc(m₁ + m₂)
- **RSA Multiplicative Homomorphism**: Semantic security implications
- **ElGamal Homomorphic Properties**: Multiplicative homomorphism with randomness
- **FHE Concepts**: BGV, BFV, CKKS schemes and characteristics
- **Circuit Depth Simulation**: Noise growth and bootstrapping techniques
- **Real-world Applications**: Healthcare, finance, voting, cloud computing

**Key Features**:
- Paillier homomorphic addition with corrected μ parameter calculation
- RSA multiplication demonstrating malleability (why padding is needed)
- ElGamal multiplicative homomorphism with semantic security
- FHE noise management and bootstrapping concept verification
- Practical applications: secure voting, data aggregation, cloud computation

## Running the Tests

### Individual Test Execution
```bash
# Run specific chapter test
node tests/test_chapter9.js
node tests/test_chapter10.js
node tests/test_chapter11.js
node tests/test_chapter12.js
node tests/test_chapter13.js
node tests/test_chapter14.js
node tests/test_chapter15.js
node tests/test_chapter16.js
```

### All Tests Execution
```bash
# Run all tests sequentially
for test in tests/test_chapter*.js; do
    echo "Running $test"
    node "$test"
    echo ""
done
```

## Test Results Interpretation

### Success Indicators
- ✓ **PASS**: Test case passed successfully
- **ALL TESTS PASSED**: All test categories completed successfully
- **Mathematically correct**: Implementation follows proper algorithms

### Failure Indicators
- ✗ **FAIL**: Test case failed
- **SOME TESTS FAILED**: One or more test categories failed
- **Need attention**: Implementation requires fixes

### Common Test Categories
1. **Algorithm Correctness**: Mathematical operations produce expected results
2. **Edge Case Handling**: Proper behavior with boundary conditions
3. **Security Properties**: Cryptographic properties are maintained
4. **Integration Testing**: Components work together correctly
5. **Performance Characteristics**: Algorithms exhibit expected behavior
6. **Attack Resistance**: Systems resist common cryptographic attacks

## Mathematical Verification Approach

### Number Theory (Chapter 9)
- **Primality**: Trial division up to √n
- **Factorization**: Complete prime decomposition
- **Totient**: φ(n) = n × ∏(1 - 1/p) for prime factors p
- **Modular Exponentiation**: Binary method for efficiency
- **Extended GCD**: Bézout identity verification

### Asymmetric Cryptography (Chapter 10)
- **RSA**: Proper key generation with e×d ≡ 1 (mod φ(n))
- **ElGamal**: Discrete logarithm security and homomorphic properties
- **Rabin**: Quadratic residue encryption with multiple decryptions
- **Signatures**: Hash-then-sign methodology

### Message Integrity (Chapter 11)
- **Hash Functions**: Avalanche effect > 40% for good cryptographic hashes
- **MAC**: Proper key and message dependency
- **HMAC**: Nested hash construction H(K⊕opad || H(K⊕ipad || m))
- **Digital Signatures**: Authentication and tamper detection

### Hash Functions (Chapter 12)
- **Merkle-Damgård**: Proper padding and iterative compression
- **Compression Functions**: State and block dependency
- **SHA Family**: Realistic simulation of standard algorithms
- **Applications**: Password hashing with salt, Merkle trees

### Digital Signatures (Chapter 13)
- **RSA Signatures**: S = H(m)^d mod n, verification H(m) = S^e mod n
- **ElGamal Signatures**: (r,s) with proper k selection and verification
- **Security**: Message binding, non-repudiation, tamper detection

### Entity Authentication (Chapter 14)
- **Password Authentication**: Salted hashing with salt || password construction
- **Lamport OTP**: Hash chain H^n(seed) with user providing H^(n-1)(seed)
- **Challenge-Response**: Real-time interaction with fresh challenges
- **Biometric Systems**: FAR/FRR trade-offs and ROC curve analysis
- **Multi-Factor**: Combining knowledge, possession, and inherence factors

### Key Management (Chapter 15)
- **KDC Protocols**: Centralized key distribution with shared secrets
- **Diffie-Hellman**: g^xy mod p shared secret agreement
- **Needham-Schroeder**: Five-step key transport with nonce verification
- **Kerberos**: Ticket-based authentication with AS, TGS, and service phases
- **PKI Certificates**: X.509 certificate chain validation and revocation
- **Trust Models**: Hierarchical (Tree), Mesh (Graph), Web of Trust (Network)

### Homomorphic Encryption (Chapter 16)
- **Paillier Cryptosystem**: Additive homomorphism with corrected parameters
- **RSA Homomorphism**: Multiplicative property and semantic security warnings
- **ElGamal Homomorphism**: Multiplicative operations with proper randomness
- **FHE Schemes**: BGV, BFV, CKKS comparison and noise management
- **Bootstrapping**: Noise reduction technique for unlimited computation depth
- **Applications**: Secure computation in healthcare, finance, and cloud environments

## Educational Value

These test scripts serve multiple educational purposes:

1. **Verification**: Ensure mathematical correctness of implementations
2. **Understanding**: Demonstrate proper algorithm behavior with examples
3. **Learning**: Show step-by-step calculations and verification processes
4. **Security**: Highlight cryptographic properties and attack resistance
5. **Integration**: Show how components work together in complete systems

## Test Script Architecture

Each test script follows a consistent structure:

```javascript
// 1. Utility Functions - Core mathematical operations
// 2. Test Categories - Organized by cryptographic concept
// 3. Verification Logic - Detailed checking with explanations
// 4. Results Summary - Pass/fail status with detailed feedback
// 5. Educational Output - Step-by-step calculations and insights
```

## Maintenance and Updates

When updating chapter implementations:

1. **Run Corresponding Tests**: Verify changes don't break existing functionality
2. **Update Test Cases**: Add new test cases for new features
3. **Verify Edge Cases**: Ensure proper handling of boundary conditions
4. **Check Security Properties**: Maintain cryptographic guarantees
5. **Update Documentation**: Keep test descriptions current

## Security Considerations

These tests verify:
- **Mathematical Correctness**: Algorithms implement proper mathematics
- **Edge Case Handling**: Proper behavior with unusual inputs
- **Security Properties**: Cryptographic guarantees are maintained
- **Attack Resistance**: Common attacks are properly mitigated
- **Integration Security**: Components maintain security when combined

The test suite provides confidence that the educational implementations are both mathematically sound and educationally valuable for learning cryptographic concepts. 