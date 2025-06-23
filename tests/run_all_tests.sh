#!/bin/bash

# Cryptography Education Test Suite Runner
# Runs all chapter verification tests sequentially

echo "======================================================================="
echo "CRYPTOGRAPHY EDUCATION - COMPREHENSIVE TEST SUITE"
echo "======================================================================="
echo "Running verification tests for all chapters..."
echo ""

# Array of test files
tests=(
        "test_chapter9.js"
    "test_chapter10.js"
    "test_chapter11.js"
    "test_chapter12.js"
    "test_chapter13.js"
    "test_chapter14.js"
    "test_chapter15.js"
    "test_chapter16.js"
    "test_des_tool.js"
    "test_rsa_math.js"
    "test_sha256_math.js"
    "test_aes_math.js"
    "test_chapter7_animation.js"
    "test_chapter8_display.js"
)

# Chapter names for display
chapter_names=(
    "Chapter 9: Mathematics of Asymmetric Cryptography"
    "Chapter 10: Asymmetric-Key Cryptography"
    "Chapter 11: Message Integrity"
    "Chapter 12: Cryptographic Hash Functions"
    "Chapter 13: Digital Signatures"
    "Chapter 14: Entity Authentication"
    "Chapter 15: Key Management"
    "Chapter 16: Homomorphic Encryption"
    "DES Tool: Mathematical Verification"
    "RSA Tool: Mathematical Operations Verification"
    "SHA-256 Tool: Mathematical Operations Verification"
    "AES Tool: Mathematical Operations Verification"
    "Chapter 7: AES Animation Enhancement Verification"
    "Chapter 8: Display and Formatting Verification"
)

# Track overall results
total_tests=0
passed_tests=0
failed_tests=0

# Run each test
for i in "${!tests[@]}"; do
    test_file="${tests[$i]}"
    chapter_name="${chapter_names[$i]}"
    
    echo "======================================================================="
    echo "RUNNING: $chapter_name"
    echo "FILE: $test_file"
    echo "======================================================================="
    
    # Check if test file exists
    if [ ! -f "$test_file" ]; then
        echo "❌ ERROR: Test file $test_file not found!"
        echo ""
        ((failed_tests++))
        ((total_tests++))
        continue
    fi
    
    # Run the test and capture output
    if node "$test_file"; then
        echo ""
        echo "✅ $chapter_name: PASSED"
        ((passed_tests++))
    else
        echo ""
        echo "❌ $chapter_name: FAILED"
        ((failed_tests++))
    fi
    
    ((total_tests++))
    echo ""
    echo "Press Enter to continue to next test..."
    read -r
done

# Final summary
echo "======================================================================="
echo "FINAL TEST SUITE SUMMARY"
echo "======================================================================="
echo "Total Tests Run: $total_tests"
echo "Tests Passed: $passed_tests"
echo "Tests Failed: $failed_tests"
echo ""

if [ $failed_tests -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! 🎉"
    echo "The cryptography education implementation is mathematically sound!"
    echo ""
    echo "✅ All number theory algorithms verified"
    echo "✅ All asymmetric cryptosystems working correctly"
    echo "✅ All message integrity mechanisms functional"
    echo "✅ All hash function implementations verified"
    echo "✅ All digital signature schemes validated"
    echo "✅ All authentication protocols verified"
    echo "✅ All key management systems validated"
    echo "✅ All homomorphic encryption schemes verified"
    echo "✅ DES tool mathematical operations verified"
    echo "✅ RSA tool mathematical operations verified"
    echo "✅ SHA-256 tool mathematical operations verified"
    echo "✅ AES tool mathematical operations verified"
else
    echo "⚠️  SOME TESTS FAILED"
    echo "Please review the failed tests and fix the implementations."
    echo ""
    echo "Success Rate: $(( passed_tests * 100 / total_tests ))%"
fi

echo ""
echo "======================================================================="
echo "Test suite completed. Thank you for using the verification system!"
echo "=======================================================================" 