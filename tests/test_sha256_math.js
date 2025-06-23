// SHA-256 Mathematical Operations Test Suite
// This file tests all mathematical functions used in the SHA-256 implementation

console.log("=== SHA-256 Mathematical Operations Test Suite ===\n")

// SHA-256 Constants for verification
const K_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
  0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
  0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
  0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2,
]

const INITIAL_HASH_VALUES = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]

// Test vectors for SHA-256
const TEST_VECTORS = [
  {
    input: "",
    expected: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    input: "abc",
    expected: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  },
  {
    input: "Hello World",
    expected: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
  }
]

// Helper class implementing SHA-256 mathematical operations
class SHA256MathTester {
  static K = K_CONSTANTS
  static IV = INITIAL_HASH_VALUES

  // Right rotate function
  static ROTR(x, n) {
    return ((x >>> n) | (x << (32 - n))) >>> 0
  }

  // Choose function: (x & y) ^ (~x & z)
  static Ch(x, y, z) {
    return ((x & y) ^ (~x & z)) >>> 0
  }

  // Majority function: (x & y) ^ (x & z) ^ (y & z)
  static Maj(x, y, z) {
    return ((x & y) ^ (x & z) ^ (y & z)) >>> 0
  }

  // Upper case Sigma 0: ROTR(x,2) ^ ROTR(x,13) ^ ROTR(x,22)
  static Σ0(x) {
    return (this.ROTR(x, 2) ^ this.ROTR(x, 13) ^ this.ROTR(x, 22)) >>> 0
  }

  // Upper case Sigma 1: ROTR(x,6) ^ ROTR(x,11) ^ ROTR(x,25)
  static Σ1(x) {
    return (this.ROTR(x, 6) ^ this.ROTR(x, 11) ^ this.ROTR(x, 25)) >>> 0
  }

  // Lower case sigma 0: ROTR(x,7) ^ ROTR(x,18) ^ (x >>> 3)
  static σ0(x) {
    return (this.ROTR(x, 7) ^ this.ROTR(x, 18) ^ (x >>> 3)) >>> 0
  }

  // Lower case sigma 1: ROTR(x,17) ^ ROTR(x,19) ^ (x >>> 10)
  static σ1(x) {
    return (this.ROTR(x, 17) ^ this.ROTR(x, 19) ^ (x >>> 10)) >>> 0
  }

  // Message padding according to SHA-256 specification
  static padMessage(msgBytes) {
    const len = msgBytes.length * 8
    // Calculate padding: message + 1 bit + k zero bits + 64-bit length = multiple of 512 bits
    let k = (448 - (msgBytes.length * 8 + 1)) % 512
    if (k < 0) k += 512
    
    const paddingLength = Math.floor((k + 1) / 8)
    const padded = new Uint8Array(msgBytes.length + paddingLength + 8)
    
    // Copy original message
    padded.set(msgBytes)
    
    // Add 1 bit followed by zeros
    padded[msgBytes.length] = 0x80

    // Add length in bits as big-endian 64-bit integer
    const view = new DataView(padded.buffer)
    const lengthInBits = BigInt(len)
    view.setBigUint64(padded.length - 8, lengthInBits, false) // false for big-endian
    
    return padded
  }

  // Complete SHA-256 hash computation
  static hash(message) {
    const msgBytes = new TextEncoder().encode(message)
    const padded = this.padMessage(msgBytes)
    
    // Parse into blocks
    const blocks = []
    const view = new DataView(padded.buffer)
    
    for (let i = 0; i < padded.length; i += 64) {
      const W = []
      for (let j = 0; j < 16; j++) {
        W.push(view.getUint32(i + j * 4, false)) // false for big-endian
      }
      blocks.push(W)
    }
    
    let H = [...this.IV]
    
    for (const block of blocks) {
      // Expand message schedule
      const W = [...block]
      for (let t = 16; t < 64; t++) {
        W[t] = (this.σ1(W[t - 2]) + W[t - 7] + this.σ0(W[t - 15]) + W[t - 16]) >>> 0
      }
      
      let [a, b, c, d, e, f, g, h] = H

      for (let t = 0; t < 64; t++) {
        const T1 = (h + this.Σ1(e) + this.Ch(e, f, g) + this.K[t] + W[t]) >>> 0
        const T2 = (this.Σ0(a) + this.Maj(a, b, c)) >>> 0
        
        h = g
        g = f
        f = e
        e = (d + T1) >>> 0
        d = c
        c = b
        b = a
        a = (T1 + T2) >>> 0
      }

      H = [
        (H[0] + a) >>> 0,
        (H[1] + b) >>> 0,
        (H[2] + c) >>> 0,
        (H[3] + d) >>> 0,
        (H[4] + e) >>> 0,
        (H[5] + f) >>> 0,
        (H[6] + g) >>> 0,
        (H[7] + h) >>> 0,
      ]
    }

    return H.map(h => h.toString(16).padStart(8, '0')).join('')
  }
}

// Test 1: SHA-256 Constants Verification
console.log("1. Testing SHA-256 Constants")
console.log("=" .repeat(40))

if (K_CONSTANTS.length === 64) {
  console.log(`✅ K constants array has correct length: 64`)
} else {
  console.log(`❌ K constants array has wrong length: ${K_CONSTANTS.length}`)
}

if (INITIAL_HASH_VALUES.length === 8) {
  console.log(`✅ IV array has correct length: 8`)
} else {
  console.log(`❌ IV array has wrong length: ${INITIAL_HASH_VALUES.length}`)
}

// Test 2: Bit Operations
console.log("\n2. Testing Bit Operations")
console.log("=" .repeat(40))

// Test ROTR function
const rotrTests = [
  { x: 0x12345678, n: 4, expected: 0x81234567 },
  { x: 0xabcdef00, n: 8, expected: 0x00abcdef },
  { x: 0x80000000, n: 31, expected: 0x00000001 }
]

for (const test of rotrTests) {
  const result = SHA256MathTester.ROTR(test.x, test.n)
  const status = result === test.expected ? "✅" : "❌"
  console.log(`ROTR(0x${test.x.toString(16)}, ${test.n}) = 0x${result.toString(16)} ${status}`)
}

// Test 3: Logical Functions
console.log("\n3. Testing Logical Functions")
console.log("=" .repeat(40))

// Test Ch function
const chTests = [
  { x: 0xffffffff, y: 0x12345678, z: 0x87654321, expected: 0x12345678 },
  { x: 0x00000000, y: 0x12345678, z: 0x87654321, expected: 0x87654321 }
]

for (const test of chTests) {
  const result = SHA256MathTester.Ch(test.x, test.y, test.z)
  const status = result === test.expected ? "✅" : "❌"
  console.log(`Ch(0x${test.x.toString(16)}, 0x${test.y.toString(16)}, 0x${test.z.toString(16)}) = 0x${result.toString(16)} ${status}`)
}

// Test Maj function
const majTests = [
  { x: 0xffffffff, y: 0xffffffff, z: 0x00000000, expected: 0xffffffff },
  { x: 0x00000000, y: 0x00000000, z: 0xffffffff, expected: 0x00000000 }
]

for (const test of majTests) {
  const result = SHA256MathTester.Maj(test.x, test.y, test.z)
  const status = result === test.expected ? "✅" : "❌"
  console.log(`Maj(0x${test.x.toString(16)}, 0x${test.y.toString(16)}, 0x${test.z.toString(16)}) = 0x${result.toString(16)} ${status}`)
}

// Test 4: Message Padding
console.log("\n4. Testing Message Padding")
console.log("=" .repeat(40))

const paddingTests = [
  { input: "", expectedBits: 512 },
  { input: "abc", expectedBits: 512 },
  { input: "a".repeat(55), expectedBits: 512 },
  { input: "a".repeat(56), expectedBits: 1024 }
]

for (const test of paddingTests) {
  const msgBytes = new TextEncoder().encode(test.input)
  const padded = SHA256MathTester.padMessage(msgBytes)
  const paddedBits = padded.length * 8
  
  console.log(`Input: "${test.input.length > 20 ? test.input.substring(0, 20) + '...' : test.input}" (${test.input.length} chars)`)
  console.log(`  Padded: ${padded.length} bytes = ${paddedBits} bits`)
  
  if (paddedBits === test.expectedBits) {
    console.log(`  ✅ Correct padding length`)
  } else {
    console.log(`  ❌ Wrong padding length, expected ${test.expectedBits} bits`)
  }
  
  // Check that padding is multiple of 512 bits
  if (paddedBits % 512 === 0) {
    console.log(`  ✅ Length is multiple of 512 bits`)
  } else {
    console.log(`  ❌ Length is not multiple of 512 bits`)
  }
}

// Test 5: Complete Hash Verification
console.log("\n5. Testing Complete Hash Computation")
console.log("=" .repeat(40))

for (const vector of TEST_VECTORS) {
  const computed = SHA256MathTester.hash(vector.input)
  const status = computed === vector.expected ? "✅" : "❌"
  
  console.log(`Input: "${vector.input}"`)
  console.log(`Expected: ${vector.expected}`)
  console.log(`Computed: ${computed}`)
  console.log(`Status: ${status}`)
  console.log()
}

console.log("=== SHA-256 Mathematical Test Suite Complete ===") 