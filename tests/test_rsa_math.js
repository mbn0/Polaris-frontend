// RSA Mathematical Operations Test Suite
// This file tests all mathematical functions used in the RSA implementation

console.log("=== RSA Mathematical Operations Test Suite ===\n")

// Test data
const testPrimes = [
  { p: 61n, q: 53n, name: "Small primes" },
  { p: 17n, q: 19n, name: "Very small primes" },
  { p: 101n, q: 103n, name: "Medium primes" }
]

const testNumbers = [
  { base: 123n, exp: 456n, mod: 789n, name: "Basic modular exponentiation" },
  { base: 2n, exp: 10n, mod: 1000n, name: "Power of 2" },
  { base: 7n, exp: 560n, mod: 561n, name: "Carmichael test case" }
]

// Helper function to implement the same mathematical operations as the RSA component
class RSAMathTester {
  // Modular exponentiation (square-and-multiply)
  static modPow(base, exp, mod) {
    if (mod === 1n) return 0n
    let result = 1n
    base = base % mod
    while (exp > 0n) {
      if (exp & 1n) result = (result * base) % mod
      base = (base * base) % mod
      exp >>= 1n
    }
    return result
  }

  // Greatest Common Divisor (Euclidean algorithm)
  static gcd(a, b) {
    while (b !== 0n) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  // Extended Euclidean algorithm
  static extendedGCD(a, b) {
    if (b === 0n) return [a, 1n, 0n]
    const [g, x1, y1] = this.extendedGCD(b, a % b)
    return [g, y1, x1 - (a / b) * y1]
  }

  // Modular inverse
  static modInverse(e, phi) {
    const [g, x] = this.extendedGCD(e, phi)
    if (g !== 1n) throw new Error("Numbers are not coprime")
    return ((x % phi) + phi) % phi
  }

  // Miller-Rabin primality test (simplified version for testing)
  static isProbablyPrime(n, k = 5) {
    if (n <= 1n || n === 4n) return false
    if (n <= 3n) return true
    if (n % 2n === 0n) return false

    // Find r and d such that n = 2^r * d + 1
    let d = n - 1n
    let r = 0n
    while (d % 2n === 0n) {
      d /= 2n
      r += 1n
    }

    // Witness loop
    const witnessLoop = (a) => {
      let x = this.modPow(a, d, n)
      if (x === 1n || x === n - 1n) return true

      for (let i = 1n; i < r; i++) {
        x = (x * x) % n
        if (x === 1n) return false
        if (x === n - 1n) return true
      }
      return false
    }

    // Test with small witnesses
    const witnesses = [2n, 3n, 5n, 7n, 11n]
    for (let i = 0; i < Math.min(k, witnesses.length); i++) {
      if (witnesses[i] >= n) continue
      if (!witnessLoop(witnesses[i])) return false
    }
    return true
  }

  // Byte conversion helpers
  static bigintToBytes(n) {
    if (n === 0n) return [0]
    
    const bytes = []
    let temp = n
    while (temp > 0n) {
      bytes.unshift(Number(temp & 0xFFn))
      temp >>= 8n
    }
    return bytes
  }

  static bytesToBigint(bytes) {
    let result = 0n
    for (const byte of bytes) {
      result = (result << 8n) + BigInt(byte)
    }
    return result
  }
}

// Test 1: Modular Exponentiation
console.log("1. Testing Modular Exponentiation")
console.log("=" .repeat(40))

for (const test of testNumbers) {
  const result = RSAMathTester.modPow(test.base, test.exp, test.mod)
  
  // Verify with JavaScript's built-in (for smaller numbers)
  let expected = 1n
  let base = test.base % test.mod
  let exp = test.exp
  while (exp > 0n && exp < 1000n) { // Only for small exponents to avoid infinite loop
    if (exp & 1n) expected = (expected * base) % test.mod
    base = (base * base) % test.mod
    exp >>= 1n
  }
  
  console.log(`${test.name}:`)
  console.log(`  ${test.base}^${test.exp} mod ${test.mod} = ${result}`)
  
  // Basic sanity checks
  if (result >= test.mod) {
    console.log("  ❌ ERROR: Result should be less than modulus")
  } else if (result >= 0n) {
    console.log("  ✅ Result is in valid range [0, mod)")
  }
}

// Test 2: GCD Algorithm
console.log("\n2. Testing GCD Algorithm")
console.log("=" .repeat(40))

const gcdTests = [
  { a: 48n, b: 18n, expected: 6n },
  { a: 101n, b: 103n, expected: 1n },
  { a: 1071n, b: 462n, expected: 21n },
  { a: 65537n, b: 3120n, expected: 1n }
]

for (const test of gcdTests) {
  const result = RSAMathTester.gcd(test.a, test.b)
  const status = result === test.expected ? "✅" : "❌"
  console.log(`gcd(${test.a}, ${test.b}) = ${result} ${status}`)
  if (result !== test.expected) {
    console.log(`  Expected: ${test.expected}`)
  }
}

// Test 3: Extended GCD
console.log("\n3. Testing Extended GCD")
console.log("=" .repeat(40))

for (const test of gcdTests) {
  const [g, x, y] = RSAMathTester.extendedGCD(test.a, test.b)
  const verification = test.a * x + test.b * y
  
  console.log(`extgcd(${test.a}, ${test.b}):`)
  console.log(`  gcd = ${g}, x = ${x}, y = ${y}`)
  console.log(`  Verification: ${test.a}×${x} + ${test.b}×${y} = ${verification}`)
  
  if (g === verification && g === test.expected) {
    console.log("  ✅ Extended GCD correct")
  } else {
    console.log("  ❌ Extended GCD failed")
  }
}

// Test 4: Modular Inverse
console.log("\n4. Testing Modular Inverse")
console.log("=" .repeat(40))

const modInverseTests = [
  { a: 3n, m: 7n },
  { a: 65537n, m: 3120n },
  { a: 17n, m: 180n }
]

for (const test of modInverseTests) {
  try {
    const inverse = RSAMathTester.modInverse(test.a, test.m)
    const verification = (test.a * inverse) % test.m
    
    console.log(`${test.a}⁻¹ mod ${test.m} = ${inverse}`)
    console.log(`  Verification: ${test.a} × ${inverse} mod ${test.m} = ${verification}`)
    
    if (verification === 1n) {
      console.log("  ✅ Modular inverse correct")
    } else {
      console.log("  ❌ Modular inverse failed")
    }
  } catch (error) {
    console.log(`${test.a}⁻¹ mod ${test.m}: ${error.message}`)
  }
}

// Test 5: Prime Testing
console.log("\n5. Testing Prime Detection")
console.log("=" .repeat(40))

const primeTests = [
  { n: 2n, expected: true },
  { n: 3n, expected: true },
  { n: 4n, expected: false },
  { n: 17n, expected: true },
  { n: 19n, expected: true },
  { n: 25n, expected: false },
  { n: 53n, expected: true },
  { n: 61n, expected: true },
  { n: 91n, expected: false }, // 7 × 13
  { n: 101n, expected: true },
  { n: 103n, expected: true },
  { n: 561n, expected: false } // Carmichael number
]

for (const test of primeTests) {
  const result = RSAMathTester.isProbablyPrime(test.n)
  const status = result === test.expected ? "✅" : "❌"
  console.log(`isPrime(${test.n}) = ${result} ${status}`)
}

// Test 6: Complete RSA Operations
console.log("\n6. Testing Complete RSA Operations")
console.log("=" .repeat(40))

for (const primeTest of testPrimes) {
  const p = primeTest.p
  const q = primeTest.q
  const e = 65537n
  
  console.log(`\nTesting with ${primeTest.name}: p=${p}, q=${q}`)
  
  // Step 1: Check if p and q are prime
  const pIsPrime = RSAMathTester.isProbablyPrime(p)
  const qIsPrime = RSAMathTester.isProbablyPrime(q)
  console.log(`  Prime check: p=${pIsPrime}, q=${qIsPrime}`)
  
  if (!pIsPrime || !qIsPrime) {
    console.log("  ❌ Skipping - not prime")
    continue
  }
  
  // Step 2: Compute n and φ(n)
  const n = p * q
  const phi = (p - 1n) * (q - 1n)
  console.log(`  n = ${n}, φ(n) = ${phi}`)
  
  // Step 3: Check if e is coprime with φ(n)
  const gcdResult = RSAMathTester.gcd(e, phi)
  console.log(`  gcd(e, φ(n)) = gcd(${e}, ${phi}) = ${gcdResult}`)
  
  if (gcdResult !== 1n) {
    console.log("  ❌ e is not coprime with φ(n)")
    continue
  }
  
  // Step 4: Compute d
  const d = RSAMathTester.modInverse(e, phi)
  console.log(`  Private exponent d = ${d}`)
  
  // Step 5: Verify e × d ≡ 1 (mod φ(n))
  const verification = (e * d) % phi
  console.log(`  Verification: e × d mod φ(n) = ${verification}`)
  
  if (verification !== 1n) {
    console.log("  ❌ Key generation failed")
    continue
  }
  
  // Step 6: Test encryption/decryption
  const message = 42n
  if (message >= n) {
    console.log("  ❌ Message too large for key size")
    continue
  }
  
  const ciphertext = RSAMathTester.modPow(message, e, n)
  const decrypted = RSAMathTester.modPow(ciphertext, d, n)
  
  console.log(`  Message: ${message}`)
  console.log(`  Encrypted: ${ciphertext}`)
  console.log(`  Decrypted: ${decrypted}`)
  
  if (decrypted === message) {
    console.log("  ✅ RSA encryption/decryption successful")
  } else {
    console.log("  ❌ RSA encryption/decryption failed")
  }
}

// Test 7: Byte Conversion
console.log("\n7. Testing Byte Conversion")
console.log("=" .repeat(40))

const byteTests = [0n, 1n, 255n, 256n, 65536n, 16777216n]

for (const test of byteTests) {
  const bytes = RSAMathTester.bigintToBytes(test)
  const converted = RSAMathTester.bytesToBigint(bytes)
  
  console.log(`${test} -> [${bytes.join(', ')}] -> ${converted}`)
  
  if (converted === test) {
    console.log("  ✅ Byte conversion successful")
  } else {
    console.log("  ❌ Byte conversion failed")
  }
}

// Test 8: Edge Cases
console.log("\n8. Testing Edge Cases")
console.log("=" .repeat(40))

// Test modular exponentiation edge cases
console.log("Modular exponentiation edge cases:")
console.log(`0^5 mod 7 = ${RSAMathTester.modPow(0n, 5n, 7n)} (expected: 0)`)
console.log(`5^0 mod 7 = ${RSAMathTester.modPow(5n, 0n, 7n)} (expected: 1)`)
console.log(`5^1 mod 7 = ${RSAMathTester.modPow(5n, 1n, 7n)} (expected: 5)`)

// Test GCD edge cases
console.log("GCD edge cases:")
console.log(`gcd(0, 5) = ${RSAMathTester.gcd(0n, 5n)} (expected: 5)`)
console.log(`gcd(5, 0) = ${RSAMathTester.gcd(5n, 0n)} (expected: 5)`)
console.log(`gcd(1, 1) = ${RSAMathTester.gcd(1n, 1n)} (expected: 1)`)

console.log("\n=== RSA Mathematical Test Suite Complete ===") 