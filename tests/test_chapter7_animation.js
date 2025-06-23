#!/usr/bin/env node

/**
 * Test Suite for Chapter 7 AES Animation Enhancements
 * Tests the improved animation logic and state management
 */

console.log('🧪 Testing Chapter 7 AES Animation Enhancements...\n');

// Mock the AES component logic for testing
class Chapter7AnimationTest {
  constructor() {
    this.currentSection = 3;
    this.plaintext = "00112233445566778899aabbccddeeff";
    this.key = "000102030405060708090a0b0c0d0e0f";
    this.keySize = 128;
    this.rounds = 10;
    
    this.currentState = [];
    this.originalState = [];
    this.roundKeys = [];
    this.encryptionRounds = [];
    this.currentRound = 0;
    this.currentStep = 0;
    
    this.isAnimating = false;
    this.isPaused = false;
    this.animationSpeed = 1000;
    
    // AES S-Box (first 16 values for testing)
    this.sBox = [
      0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 
      0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76
    ];
  }

  // Convert hex string to 4x4 state matrix
  hexStringToState(hexString) {
    const bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    const state = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        state[row][col] = bytes[col * 4 + row];
      }
    }
    return state;
  }

  deepCopyState(state) {
    return state.map(row => [...row]);
  }

  // Simulate initialization
  initializeAES() {
    this.currentState = this.hexStringToState(this.plaintext);
    this.originalState = this.deepCopyState(this.currentState);
    
    // Mock round keys generation
    this.roundKeys = [];
    for (let i = 0; i <= this.rounds; i++) {
      const roundKey = Array.from({ length: 4 }, () => 
        Array.from({ length: 4 }, () => Math.floor(Math.random() * 256))
      );
      this.roundKeys.push(roundKey);
    }
    
    // Mock encryption rounds
    this.encryptionRounds = [];
    for (let i = 1; i <= this.rounds; i++) {
      this.encryptionRounds.push({
        roundNumber: i,
        beforeSubBytes: this.deepCopyState(this.currentState),
        afterSubBytes: this.deepCopyState(this.currentState),
        afterShiftRows: this.deepCopyState(this.currentState),
        afterMixColumns: this.deepCopyState(this.currentState),
        afterAddRoundKey: this.deepCopyState(this.currentState),
        roundKey: this.roundKeys[i]
      });
    }
  }

  // Enhanced step naming function
  getStepName(step) {
    if (this.currentRound === 0) {
      return step === 0 ? "Initial AddRoundKey" : "Initial State";
    }
    
    switch (step) {
      case 0: return `Round ${this.currentRound} - Start`;
      case 1: return `Round ${this.currentRound} - SubBytes`;
      case 2: return `Round ${this.currentRound} - ShiftRows`;
      case 3: return `Round ${this.currentRound} - MixColumns`;
      case 4: return `Round ${this.currentRound} - AddRoundKey`;
      default: return "Unknown";
    }
  }

  getCurrentRoundKey() {
    if (this.roundKeys.length > this.currentRound) {
      return this.roundKeys[this.currentRound];
    }
    return [];
  }

  getAnimationProgress() {
    if (!this.isAnimating) return 0;
    const totalSteps = this.rounds * 4 + 1; // Each round has 4 steps + initial
    const currentSteps = this.currentRound * 4 + this.currentStep;
    return Math.min((currentSteps / totalSteps) * 100, 100);
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
  }

  pauseAnimation() {
    this.isPaused = !this.isPaused;
  }

  stopAnimation() {
    this.isAnimating = false;
    this.isPaused = false;
    this.currentRound = 0;
    this.currentStep = 0;
    this.currentState = this.deepCopyState(this.originalState);
  }

  // Simulate animation logic (without actual delays)
  simulateAnimation() {
    this.isAnimating = true;
    this.isPaused = false;
    this.currentRound = 0;
    this.currentStep = 0;

    const steps = [];
    
    // Initial state
    steps.push({
      round: 0,
      step: 0,
      stepName: this.getStepName(0),
      progress: this.getAnimationProgress()
    });

    // Process each round
    for (let i = 0; i < this.encryptionRounds.length; i++) {
      this.currentRound = i + 1;
      
      // Before SubBytes
      this.currentStep = 0;
      steps.push({
        round: this.currentRound,
        step: this.currentStep,
        stepName: this.getStepName(this.currentStep),
        progress: this.getAnimationProgress()
      });

      // SubBytes
      this.currentStep = 1;
      steps.push({
        round: this.currentRound,
        step: this.currentStep,
        stepName: this.getStepName(this.currentStep),
        progress: this.getAnimationProgress()
      });

      // ShiftRows
      this.currentStep = 2;
      steps.push({
        round: this.currentRound,
        step: this.currentStep,
        stepName: this.getStepName(this.currentStep),
        progress: this.getAnimationProgress()
      });

      // MixColumns (skip for final round)
      if (i < this.encryptionRounds.length - 1) {
        this.currentStep = 3;
        steps.push({
          round: this.currentRound,
          step: this.currentStep,
          stepName: this.getStepName(this.currentStep),
          progress: this.getAnimationProgress()
        });
      }

      // AddRoundKey
      this.currentStep = 4;
      steps.push({
        round: this.currentRound,
        step: this.currentStep,
        stepName: this.getStepName(this.currentStep),
        progress: this.getAnimationProgress()
      });
    }

    this.isAnimating = false;
    return steps;
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

  const component = new Chapter7AnimationTest();
  component.initializeAES();

  // Test 1: Initialization
  test('Component initializes correctly', () => {
    if (component.originalState.length !== 4) throw new Error('State matrix should be 4x4');
    if (component.roundKeys.length !== 11) throw new Error('Should have 11 round keys for AES-128');
    if (component.encryptionRounds.length !== 10) throw new Error('Should have 10 encryption rounds');
  });

  // Test 2: Step naming
  test('Step naming works correctly', () => {
    component.currentRound = 0;
    component.currentStep = 0;
    if (component.getStepName(0) !== "Initial AddRoundKey") {
      throw new Error('Initial step naming incorrect');
    }

    component.currentRound = 1;
    component.currentStep = 1;
    if (component.getStepName(1) !== "Round 1 - SubBytes") {
      throw new Error('Round step naming incorrect');
    }
  });

  // Test 3: Animation progress calculation
  test('Animation progress calculation', () => {
    component.isAnimating = true;
    component.currentRound = 5;
    component.currentStep = 2;
    const progress = component.getAnimationProgress();
    if (progress < 0 || progress > 100) {
      throw new Error('Progress should be between 0 and 100');
    }
  });

  // Test 4: Animation controls
  test('Animation control functions', () => {
    component.isAnimating = true;
    component.pauseAnimation();
    if (!component.isPaused) throw new Error('Pause should set isPaused to true');
    
    component.pauseAnimation();
    if (component.isPaused) throw new Error('Second pause should toggle isPaused to false');

    component.stopAnimation();
    if (component.isAnimating || component.isPaused) {
      throw new Error('Stop should reset animation state');
    }
  });

  // Test 5: Speed control
  test('Animation speed control', () => {
    const originalSpeed = component.animationSpeed;
    component.setAnimationSpeed(500);
    if (component.animationSpeed !== 500) {
      throw new Error('Speed should be updated');
    }
    component.setAnimationSpeed(originalSpeed);
  });

  // Test 6: Round key access
  test('Round key access', () => {
    component.currentRound = 0;
    const roundKey = component.getCurrentRoundKey();
    if (roundKey.length !== 4) throw new Error('Round key should be 4x4 matrix');
    
    component.currentRound = 999; // Invalid round
    const invalidKey = component.getCurrentRoundKey();
    if (invalidKey.length !== 0) throw new Error('Invalid round should return empty array');
  });

  // Test 7: Animation step sequence
  test('Animation step sequence', () => {
    const steps = component.simulateAnimation();
    
    // Should have initial step + steps for each round
    const expectedMinSteps = 1 + (component.rounds * 4); // Minimum steps
    if (steps.length < expectedMinSteps) {
      throw new Error(`Should have at least ${expectedMinSteps} steps, got ${steps.length}`);
    }

    // Check that steps progress correctly
    let lastProgress = -1;
    for (const step of steps) {
      if (step.progress < lastProgress) {
        throw new Error('Progress should be non-decreasing');
      }
      lastProgress = step.progress;
    }

    // Check final step reaches 100%
    const finalStep = steps[steps.length - 1];
    if (finalStep.progress < 95) { // Allow some tolerance
      throw new Error('Final step should reach near 100% progress');
    }
  });

  // Test 8: State matrix format
  test('State matrix format validation', () => {
    const testHex = "0123456789abcdef0123456789abcdef";
    const state = component.hexStringToState(testHex);
    
    if (state.length !== 4 || state[0].length !== 4) {
      throw new Error('State should be 4x4 matrix');
    }

    // Test column-major order
    if (state[0][0] !== 0x01 || state[1][0] !== 0x23) {
      throw new Error('State matrix should use column-major order');
    }
  });

  // Test 9: Deep copy functionality
  test('Deep copy state functionality', () => {
    const original = [[1, 2], [3, 4]];
    const copy = component.deepCopyState(original);
    
    copy[0][0] = 99;
    if (original[0][0] === 99) {
      throw new Error('Deep copy should not affect original');
    }
  });

  // Test 10: Animation state consistency
  test('Animation state consistency', () => {
    // Start animation
    component.isAnimating = true;
    component.currentRound = 5;
    component.currentStep = 2;
    
    // Stop animation should reset everything
    component.stopAnimation();
    
    if (component.currentRound !== 0 || component.currentStep !== 0) {
      throw new Error('Stop should reset round and step counters');
    }
    
    if (component.isAnimating || component.isPaused) {
      throw new Error('Stop should reset animation flags');
    }
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All Chapter 7 animation enhancement tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
    return false;
  }
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1); 