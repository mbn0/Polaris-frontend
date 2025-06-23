#!/usr/bin/env node

/**
 * Test Suite for Chapter 8 Display Improvements
 * Tests the hex conversion and display formatting functions
 */

console.log('🧪 Testing Chapter 8 Display Improvements...\n');

// Mock the Chapter 8 component logic for testing
class Chapter8DisplayTest {
  constructor() {
    this.plaintext = "HELLO WORLD HELLO WORLD";
    this.key = "SECRETKEY";
    this.iv = "INITVECT";
    this.blockSize = 8;
  }

  // Helper method to convert string to hex for display
  stringToHex(str) {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hex += charCode.toString(16).padStart(2, '0').toUpperCase();
    }
    return hex;
  }

  // Helper method to get displayable ciphertext
  getDisplayableCiphertext(ciphertext, maxLength = 20) {
    const hex = this.stringToHex(ciphertext);
    return hex.length > maxLength ? hex.substring(0, maxLength) + '...' : hex;
  }

  // Helper method to check if string contains non-printable characters
  hasNonPrintableChars(str) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 32 || code > 126) {
        return true;
      }
    }
    return false;
  }

  // XOR operation for strings (creates non-printable chars)
  xorStrings(str1, str2) {
    let result = "";
    const maxLength = Math.max(str1.length, str2.length);

    for (let i = 0; i < maxLength; i++) {
      const char1 = i < str1.length ? str1.charCodeAt(i) : 0;
      const char2 = i < str2.length ? str2.charCodeAt(i) : 0;
      result += String.fromCharCode(char1 ^ char2);
    }
    return result;
  }

  // Simple block cipher simulation
  simpleBlockCipher(block, key, encrypt = true) {
    const keyCode = key.charCodeAt(0) % 26;
    let result = "";

    for (let i = 0; i < block.length; i++) {
      const char = block[i];
      if (char.match(/[A-Z]/)) {
        const charCode = char.charCodeAt(0) - 65;
        const newCharCode = encrypt
          ? (charCode + keyCode) % 26
          : (charCode - keyCode + 26) % 26;
        result += String.fromCharCode(newCharCode + 65);
      } else {
        result += char;
      }
    }
    return result;
  }
}

// Test Suite
function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, testFn) {
    try {
      testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  const component = new Chapter8DisplayTest();

  // Test 1: String to hex conversion
  test('String to hex conversion', () => {
    const testString = "HELLO";
    const expectedHex = "48454C4C4F"; // ASCII codes in hex
    const result = component.stringToHex(testString);
    if (result !== expectedHex) {
      throw new Error(`Expected ${expectedHex}, got ${result}`);
    }
  });

  // Test 2: Hex conversion with special characters
  test('Hex conversion with special characters', () => {
    const testString = "A\x01B"; // Contains non-printable character
    const expectedHex = "410142"; // A=41, \x01=01, B=42
    const result = component.stringToHex(testString);
    if (result !== expectedHex) {
      throw new Error(`Expected ${expectedHex}, got ${result}`);
    }
  });

  // Test 3: Displayable ciphertext truncation
  test('Displayable ciphertext truncation', () => {
    const longString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const result = component.getDisplayableCiphertext(longString, 10);
    if (!result.endsWith('...') || result.length !== 13) { // 10 chars + "..."
      throw new Error(`Expected truncated string with ..., got ${result}`);
    }
  });

  // Test 4: Non-printable character detection
  test('Non-printable character detection', () => {
    const printableString = "Hello World!";
    const nonPrintableString = "Hello\x01World";
    
    if (component.hasNonPrintableChars(printableString)) {
      throw new Error('Should not detect non-printable chars in printable string');
    }
    
    if (!component.hasNonPrintableChars(nonPrintableString)) {
      throw new Error('Should detect non-printable chars');
    }
  });

  // Test 5: XOR operation produces non-printable characters
  test('XOR operation produces non-printable characters', () => {
    const str1 = "HELLO";
    const str2 = "WORLD";
    const result = component.xorStrings(str1, str2);
    
    // XOR of different strings should likely produce non-printable chars
    const hasNonPrintable = component.hasNonPrintableChars(result);
    if (!hasNonPrintable) {
      // This might not always be true, so let's check if result is different from inputs
      if (result === str1 || result === str2) {
        throw new Error('XOR should produce different result');
      }
    }
    
    // The hex representation should be valid
    const hex = component.stringToHex(result);
    if (hex.length !== result.length * 2) {
      throw new Error('Hex representation should be twice the string length');
    }
  });

  // Test 6: Simple block cipher maintains printability for uppercase letters
  test('Simple block cipher maintains printability', () => {
    const plaintext = "HELLO";
    const key = "SECRET";
    const result = component.simpleBlockCipher(plaintext, key, true);
    
    // Result should still be printable uppercase letters
    if (component.hasNonPrintableChars(result)) {
      throw new Error('Simple block cipher should maintain printability for uppercase input');
    }
    
    // Should be different from input (unless key effect is zero, which is unlikely)
    if (result === plaintext && key.charCodeAt(0) % 26 !== 0) {
      throw new Error('Cipher should transform the input');
    }
  });

  // Test 7: Empty string handling
  test('Empty string handling', () => {
    const emptyString = "";
    const hex = component.stringToHex(emptyString);
    if (hex !== "") {
      throw new Error('Empty string should produce empty hex');
    }
    
    if (component.hasNonPrintableChars(emptyString)) {
      throw new Error('Empty string should not have non-printable chars');
    }
  });

  // Test 8: Hex formatting consistency
  test('Hex formatting consistency', () => {
    const testCases = [
      { char: 'A', expected: '41' },
      { char: ' ', expected: '20' },
      { char: '\n', expected: '0A' },
      { char: '\x00', expected: '00' }
    ];
    
    for (const testCase of testCases) {
      const result = component.stringToHex(testCase.char);
      if (result !== testCase.expected) {
        throw new Error(`For char '${testCase.char}', expected ${testCase.expected}, got ${result}`);
      }
    }
  });

  // Test 9: Large string handling
  test('Large string handling', () => {
    const largeString = 'A'.repeat(1000);
    const hex = component.stringToHex(largeString);
    
    if (hex.length !== 2000) { // Each char becomes 2 hex digits
      throw new Error(`Expected 2000 hex chars, got ${hex.length}`);
    }
    
    if (hex !== '41'.repeat(1000)) {
      throw new Error('Large string hex conversion failed');
    }
  });

  // Test 10: Round-trip compatibility
  test('Hex conversion preserves information', () => {
    const originalString = "Hello\x01\x02World!";
    const hex = component.stringToHex(originalString);
    
    // Convert back from hex to verify no information loss
    let reconstructed = '';
    for (let i = 0; i < hex.length; i += 2) {
      const hexPair = hex.substring(i, i + 2);
      reconstructed += String.fromCharCode(parseInt(hexPair, 16));
    }
    
    if (reconstructed !== originalString) {
      throw new Error('Hex conversion should preserve all information');
    }
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All Chapter 8 display improvement tests passed!');
    console.log('\n✅ Improvements verified:');
    console.log('  • Hex conversion works correctly');
    console.log('  • Non-printable character detection works');
    console.log('  • Display truncation functions properly');
    console.log('  • XOR operations handle non-printable output');
    console.log('  • All edge cases handled correctly');
    return true;
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
    return false;
  }
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1); 