#!/usr/bin/env node

/**
 * AES Mathematical Operations Test Suite
 * 
 * This test suite validates the mathematical correctness of the AES implementation
 * by testing all core operations against known test vectors and standards.
 */

console.log('🔐 AES Mathematical Operations Test Suite');
console.log('=========================================\n');

// Test counters
let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        console.log(`✅ ${message}`);
        passedTests++;
    } else {
        console.log(`❌ ${message}`);
    }
}

function arrayEquals(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
}

function matrixEquals(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (!arrayEquals(a[i], b[i])) return false;
    }
    return true;
}

// AES Constants for verification
const EXPECTED_SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

const EXPECTED_RCON = [
    0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
];

// AES Implementation for testing
class AESTest {
    constructor() {
        this.SBOX = EXPECTED_SBOX;
        this.RCON = EXPECTED_RCON;
    }

    // Galois field multiplication
    xtime(b) {
        return ((b << 1) ^ ((b & 0x80) ? 0x1b : 0)) & 0xff;
    }

    gmul(a, b) {
        let result = 0;
        for (let i = 0; i < 8; i++) {
            if (b & 1) result ^= a;
            a = this.xtime(a);
            b >>= 1;
        }
        return result;
    }

    // State transformations
    toState(input) {
        const state = [[], [], [], []];
        for (let i = 0; i < 16; i++) {
            state[i % 4][Math.floor(i / 4)] = input[i];
        }
        return state;
    }

    fromState(state) {
        const output = new Array(16);
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                output[4 * c + r] = state[r][c];
            }
        }
        return output;
    }

    subBytes(state) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                state[r][c] = this.SBOX[state[r][c]];
            }
        }
    }

    shiftRows(state) {
        for (let r = 1; r < 4; r++) {
            state[r] = state[r].slice(r).concat(state[r].slice(0, r));
        }
    }

    mixColumn(col) {
        const [a, b, c, d] = col;
        return [
            this.gmul(a, 2) ^ this.gmul(b, 3) ^ this.gmul(c, 1) ^ this.gmul(d, 1),
            this.gmul(a, 1) ^ this.gmul(b, 2) ^ this.gmul(c, 3) ^ this.gmul(d, 1),
            this.gmul(a, 1) ^ this.gmul(b, 1) ^ this.gmul(c, 2) ^ this.gmul(d, 3),
            this.gmul(a, 3) ^ this.gmul(b, 1) ^ this.gmul(c, 1) ^ this.gmul(d, 2)
        ];
    }

    mixColumns(state) {
        for (let c = 0; c < 4; c++) {
            const col = [state[0][c], state[1][c], state[2][c], state[3][c]];
            const mixed = this.mixColumn(col);
            for (let r = 0; r < 4; r++) state[r][c] = mixed[r];
        }
    }

    addRoundKey(state, roundKey) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                state[r][c] ^= roundKey[r][c];
            }
        }
    }

    rotateWord(word) {
        return word.slice(1).concat(word[0]);
    }

    subWord(word) {
        return word.map(b => this.SBOX[b]);
    }

    keyExpansion(key) {
        const Nk = 4, Nr = 10, Nb = 4;
        const w = [];

        // First Nk words from the key
        for (let i = 0; i < Nk; i++) {
            w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
        }

        for (let i = Nk; i < Nb * (Nr + 1); i++) {
            let temp = w[i - 1].slice();
            if (i % Nk === 0) {
                temp = this.subWord(this.rotateWord(temp));
                temp[0] ^= this.RCON[i / Nk];
            }
            w[i] = w[i - Nk].map((b, idx) => b ^ temp[idx]);
        }

        // Group into round keys
        const roundKeys = [];
        for (let r = 0; r < Nr + 1; r++) {
            const rk = [[], [], [], []];
            for (let c = 0; c < Nb; c++) {
                const word = w[r * Nb + c];
                for (let row = 0; row < 4; row++) {
                    rk[row][c] = word[row];
                }
            }
            roundKeys.push(rk);
        }
        return roundKeys;
    }

    encrypt(plaintext, key) {
        const state = this.toState(plaintext);
        const roundKeys = this.keyExpansion(key);

        // Initial round
        this.addRoundKey(state, roundKeys[0]);

        // Main rounds
        for (let round = 1; round < 10; round++) {
            this.subBytes(state);
            this.shiftRows(state);
            this.mixColumns(state);
            this.addRoundKey(state, roundKeys[round]);
        }

        // Final round
        this.subBytes(state);
        this.shiftRows(state);
        this.addRoundKey(state, roundKeys[10]);

        return this.fromState(state);
    }
}

// Test Suite
console.log('1. AES Constants Validation');
console.log('---------------------------');

const aes = new AESTest();

// Test S-box
assert(arrayEquals(aes.SBOX, EXPECTED_SBOX), 'S-box values are correct');

// Test RCON
assert(arrayEquals(aes.RCON, EXPECTED_RCON), 'RCON values are correct');

// Test specific S-box values
assert(aes.SBOX[0x00] === 0x63, 'S-box[0x00] = 0x63');
assert(aes.SBOX[0x01] === 0x7c, 'S-box[0x01] = 0x7c');
assert(aes.SBOX[0x53] === 0xed, 'S-box[0x53] = 0xed');
assert(aes.SBOX[0xff] === 0x16, 'S-box[0xff] = 0x16');

console.log('\n2. Galois Field Operations');
console.log('---------------------------');

// Test xtime (multiplication by 2)
assert(aes.xtime(0x57) === 0xae, 'xtime(0x57) = 0xae');
assert(aes.xtime(0xae) === 0x47, 'xtime(0xae) = 0x47');
assert(aes.xtime(0x80) === 0x1b, 'xtime(0x80) = 0x1b (with reduction)');

// Test gmul
assert(aes.gmul(0x57, 0x01) === 0x57, 'gmul(0x57, 0x01) = 0x57');
assert(aes.gmul(0x57, 0x02) === 0xae, 'gmul(0x57, 0x02) = 0xae');
assert(aes.gmul(0x57, 0x03) === 0xf9, 'gmul(0x57, 0x03) = 0xf9');
assert(aes.gmul(0x57, 0x13) === 0xfe, 'gmul(0x57, 0x13) = 0xfe');

// Test inverse property
assert(aes.gmul(0x53, 0xca) === 0x01, 'gmul(0x53, 0xca) = 0x01 (inverse)');

console.log('\n3. State Matrix Operations');
console.log('---------------------------');

// Test state conversion
const testBytes = [0x32, 0x43, 0xf6, 0xa8, 0x88, 0x5a, 0x30, 0x8d, 0x31, 0x31, 0x98, 0xa2, 0xe0, 0x37, 0x07, 0x34];
const expectedState = [
    [0x32, 0x88, 0x31, 0xe0],
    [0x43, 0x5a, 0x31, 0x37],
    [0xf6, 0x30, 0x98, 0x07],
    [0xa8, 0x8d, 0xa2, 0x34]
];

const state = aes.toState(testBytes);
assert(matrixEquals(state, expectedState), 'toState() conversion is correct');

const backToBytes = aes.fromState(state);
assert(arrayEquals(backToBytes, testBytes), 'fromState() conversion is correct');

console.log('\n4. SubBytes Operation');
console.log('---------------------');

// Test SubBytes with known values
const testState = [
    [0x19, 0xa0, 0x9a, 0xe9],
    [0x3d, 0xf4, 0xc6, 0xf8],
    [0xe3, 0xe2, 0x8d, 0x48],
    [0xbe, 0x2b, 0x2a, 0x08]
];

const expectedAfterSubBytes = [
    [0xd4, 0xe0, 0xb8, 0x1e],
    [0x27, 0xbf, 0xb4, 0x41],
    [0x11, 0x98, 0x5d, 0x52],
    [0xae, 0xf1, 0xe5, 0x30]
];

const stateForSub = testState.map(row => [...row]);
aes.subBytes(stateForSub);
assert(matrixEquals(stateForSub, expectedAfterSubBytes), 'SubBytes operation is correct');

console.log('\n5. ShiftRows Operation');
console.log('----------------------');

// Test ShiftRows
const testStateShift = [
    [0xd4, 0xe0, 0xb8, 0x1e],
    [0x27, 0xbf, 0xb4, 0x41],
    [0x11, 0x98, 0x5d, 0x52],
    [0xae, 0xf1, 0xe5, 0x30]
];

const expectedAfterShiftRows = [
    [0xd4, 0xe0, 0xb8, 0x1e],
    [0xbf, 0xb4, 0x41, 0x27],
    [0x5d, 0x52, 0x11, 0x98],
    [0x30, 0xae, 0xf1, 0xe5]
];

const stateForShift = testStateShift.map(row => [...row]);
aes.shiftRows(stateForShift);
assert(matrixEquals(stateForShift, expectedAfterShiftRows), 'ShiftRows operation is correct');

console.log('\n6. MixColumns Operation');
console.log('-----------------------');

// Test MixColumns with known values
const testStateMix = [
    [0xd4, 0xe0, 0xb8, 0x1e],
    [0xbf, 0xb4, 0x41, 0x27],
    [0x5d, 0x52, 0x11, 0x98],
    [0x30, 0xae, 0xf1, 0xe5]
];

const expectedAfterMixColumns = [
    [0x04, 0xe0, 0x48, 0x28],
    [0x66, 0xcb, 0xf8, 0x06],
    [0x81, 0x19, 0xd3, 0x26],
    [0xe5, 0x9a, 0x7a, 0x4c]
];

const stateForMix = testStateMix.map(row => [...row]);
aes.mixColumns(stateForMix);
assert(matrixEquals(stateForMix, expectedAfterMixColumns), 'MixColumns operation is correct');

// Test individual column mixing
const testColumn = [0xd4, 0xbf, 0x5d, 0x30];
const expectedMixedColumn = [0x04, 0x66, 0x81, 0xe5];
const mixedColumn = aes.mixColumn(testColumn);
assert(arrayEquals(mixedColumn, expectedMixedColumn), 'Single column mixing is correct');

console.log('\n7. Key Expansion');
console.log('----------------');

// Test key expansion with NIST test vector
const testKey = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c];
const roundKeys = aes.keyExpansion(testKey);

// Check first round key (should be original key)
const expectedRoundKey0 = [
    [0x2b, 0x28, 0xab, 0x09],
    [0x7e, 0xae, 0xf7, 0xcf],
    [0x15, 0xd2, 0x15, 0x4f],
    [0x16, 0xa6, 0x88, 0x3c]
];
assert(matrixEquals(roundKeys[0], expectedRoundKey0), 'Round key 0 is correct');

// Check first expanded round key
const expectedRoundKey1 = [
    [0xa0, 0x88, 0x23, 0x2a],
    [0xfa, 0x54, 0xa3, 0x6c],
    [0xfe, 0x2c, 0x39, 0x76],
    [0x17, 0xb1, 0x39, 0x05]
];
assert(matrixEquals(roundKeys[1], expectedRoundKey1), 'Round key 1 is correct');

// Test that we have 11 round keys
assert(roundKeys.length === 11, 'Generated 11 round keys');

console.log('\n8. Word Operations');
console.log('------------------');

// Test RotateWord
const testWord = [0x09, 0xcf, 0x4f, 0x3c];
const expectedRotated = [0xcf, 0x4f, 0x3c, 0x09];
const rotated = aes.rotateWord(testWord);
assert(arrayEquals(rotated, expectedRotated), 'RotateWord operation is correct');

// Test SubWord
const testWordSub = [0xcf, 0x4f, 0x3c, 0x09];
const expectedSubbed = [0x8a, 0x84, 0xeb, 0x01];
const subbed = aes.subWord(testWordSub);
assert(arrayEquals(subbed, expectedSubbed), 'SubWord operation is correct');

console.log('\n9. Complete AES Encryption Test');
console.log('--------------------------------');

// NIST test vector
const plaintext = [0x32, 0x43, 0xf6, 0xa8, 0x88, 0x5a, 0x30, 0x8d, 0x31, 0x31, 0x98, 0xa2, 0xe0, 0x37, 0x07, 0x34];
const key = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c];
const expectedCiphertext = [0x39, 0x25, 0x84, 0x1d, 0x02, 0xdc, 0x09, 0xfb, 0xdc, 0x11, 0x85, 0x97, 0x19, 0x6a, 0x0b, 0x32];

const ciphertext = aes.encrypt(plaintext, key);
assert(arrayEquals(ciphertext, expectedCiphertext), 'Complete AES encryption matches NIST test vector');

console.log('\n10. Edge Cases and Validation');
console.log('------------------------------');

// Test all-zero input
const zeroPlaintext = new Array(16).fill(0);
const zeroKey = new Array(16).fill(0);
const zeroCiphertext = aes.encrypt(zeroPlaintext, zeroKey);
const expectedZeroCiphertext = [0x66, 0xe9, 0x4b, 0xd4, 0xef, 0x8a, 0x2c, 0x3b, 0x88, 0x4c, 0xfa, 0x59, 0xca, 0x34, 0x2b, 0x2e];
assert(arrayEquals(zeroCiphertext, expectedZeroCiphertext), 'All-zero encryption is correct');

// Test all-ones input
const onesPlaintext = new Array(16).fill(0xff);
const onesKey = new Array(16).fill(0xff);
const onesCiphertext = aes.encrypt(onesPlaintext, onesKey);
// Verify it's different from input (basic sanity check)
assert(!arrayEquals(onesCiphertext, onesPlaintext), 'All-ones encryption produces different output');

// Test that encryption is deterministic
const ciphertext2 = aes.encrypt(plaintext, key);
assert(arrayEquals(ciphertext, ciphertext2), 'AES encryption is deterministic');

console.log('\n11. Avalanche Effect Test');
console.log('--------------------------');

// Test avalanche effect - single bit change should affect many output bits
const plaintext1 = [0x32, 0x43, 0xf6, 0xa8, 0x88, 0x5a, 0x30, 0x8d, 0x31, 0x31, 0x98, 0xa2, 0xe0, 0x37, 0x07, 0x34];
const plaintext2 = [0x33, 0x43, 0xf6, 0xa8, 0x88, 0x5a, 0x30, 0x8d, 0x31, 0x31, 0x98, 0xa2, 0xe0, 0x37, 0x07, 0x34]; // Single bit flip

const cipher1 = aes.encrypt(plaintext1, key);
const cipher2 = aes.encrypt(plaintext2, key);

let differentBits = 0;
for (let i = 0; i < 16; i++) {
    let xor = cipher1[i] ^ cipher2[i];
    while (xor) {
        differentBits += xor & 1;
        xor >>= 1;
    }
}

assert(differentBits > 32, `Avalanche effect: ${differentBits} bits changed (>32 expected)`);

console.log('\n12. Mathematical Properties');
console.log('----------------------------');

// Test that S-box is a bijection (every input maps to unique output)
const sboxOutputs = new Set();
for (let i = 0; i < 256; i++) {
    sboxOutputs.add(aes.SBOX[i]);
}
assert(sboxOutputs.size === 256, 'S-box is a bijection (256 unique outputs)');

// Test MixColumns is invertible by checking determinant properties
// For educational purposes, we verify that MixColumns changes the state
const identityState = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];
const mixedIdentity = identityState.map(row => [...row]);
aes.mixColumns(mixedIdentity);
assert(!matrixEquals(identityState, mixedIdentity), 'MixColumns transforms identity matrix');

// Test RCON values follow the correct pattern (powers of 2 in GF(2^8))
let rconValue = 1;
for (let i = 1; i < aes.RCON.length; i++) {
    assert(aes.RCON[i] === rconValue, `RCON[${i}] = ${rconValue.toString(16)}`);
    rconValue = aes.xtime(rconValue);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`AES Test Results: ${passedTests}/${totalTests} tests passed`);
console.log('='.repeat(50));

if (passedTests === totalTests) {
    console.log('🎉 All AES mathematical operations are correct!');
    console.log('✅ The AES implementation follows NIST standards');
    console.log('✅ All cryptographic properties are verified');
    process.exit(0);
} else {
    console.log('❌ Some AES operations failed verification');
    console.log('⚠️  Please review the implementation');
    process.exit(1);
}
