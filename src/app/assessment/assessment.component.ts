import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService, StudentAssessment } from '../core/services/student/student.service';
import { AuthService } from '../core/services/auth/auth.service';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct answer (0-3)
  explanation?: string;
}

interface QuestionBank {
  [assessmentId: number]: Question[];
}

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AssessmentComponent implements OnInit, OnDestroy {
  assessmentId: number = 0;
  assessment: StudentAssessment | null = null;
  
  // Assessment state
  currentQuestionIndex = 0;
  selectedQuestions: Question[] = [];
  userAnswers: (number | null)[] = [];
  isSubmitted = false;
  score = 0;
  showResults = false;
  timeRemaining = 0;
  timerInterval: any;

  // Question bank for Module 1 (Introduction to Cryptography)
  questionBank: QuestionBank = {
    1: [ // Assuming assessment ID 1 is for Module 1
      {
        id: 1,
        question: "Which of the following is not a core objective of information security?",
        options: ["Confidentiality", "Data Integrity", "Message Compression", "Entity Authentication"],
        correctAnswer: 2,
        explanation: "Message Compression is not a core objective of information security. The main objectives are Confidentiality, Integrity, and Availability."
      },
      {
        id: 2,
        question: "Which mechanism ensures that a message was not altered during transmission?",
        options: ["Confidentiality", "Data Integrity", "Timestamping", "Non-repudiation"],
        correctAnswer: 1,
        explanation: "Data Integrity ensures that information has not been altered during transmission or storage."
      },
      {
        id: 3,
        question: "The main goal of cryptography is to:",
        options: ["Increase system speed", "Encrypt large files only", "Ensure secrecy, authenticity, and integrity", "Reduce file sizes"],
        correctAnswer: 2,
        explanation: "Cryptography aims to ensure secrecy (confidentiality), authenticity, and integrity of information."
      },
      {
        id: 4,
        question: "In a symmetric key system:",
        options: ["One key encrypts, a different one decrypts", "The same key is used for encryption and decryption", "No key is used at all", "It uses digital signatures"],
        correctAnswer: 1,
        explanation: "In symmetric key cryptography, the same key is used for both encryption and decryption."
      },
      {
        id: 5,
        question: "Which threat type involves unauthorized access and modifying an asset?",
        options: ["Interruption", "Interception", "Modification", "Fabrication"],
        correctAnswer: 2,
        explanation: "Modification attacks involve unauthorized access to and alteration of data or assets."
      },
      {
        id: 6,
        question: "Which type of attack only observes the data without altering it?",
        options: ["Passive attack", "Active attack", "Forgery attack", "Brute-force attack"],
        correctAnswer: 0,
        explanation: "Passive attacks involve observing or monitoring data without altering it, such as eavesdropping."
      },
      {
        id: 7,
        question: "What is the main weakness of symmetric key cryptography?",
        options: ["Too slow for long messages", "Public keys are hard to distribute", "Requires secure key exchange", "Cannot encrypt at all"],
        correctAnswer: 2,
        explanation: "The main weakness of symmetric key cryptography is the need for secure key distribution and exchange."
      },
      {
        id: 8,
        question: "What is the key feature of a stream cipher?",
        options: ["Encrypts in blocks", "Requires a trusted third party", "Encrypts data character-by-character", "Cannot be used for real-time encryption"],
        correctAnswer: 2,
        explanation: "Stream ciphers encrypt data character-by-character or bit-by-bit, making them suitable for real-time encryption."
      },
      {
        id: 9,
        question: "A cryptographic hash function should NOT allow:",
        options: ["Efficient hash calculation", "Easy retrieval of original message", "Avalanche effect", "Collision resistance"],
        correctAnswer: 1,
        explanation: "Hash functions should be one-way functions, making it computationally infeasible to retrieve the original message from the hash."
      },
      {
        id: 10,
        question: "Which concept ensures that a sender cannot deny sending a message?",
        options: ["Integrity", "Authorization", "Non-repudiation", "Availability"],
        correctAnswer: 2,
        explanation: "Non-repudiation ensures that a sender cannot deny having sent a message or performed an action."
      },
      {
        id: 11,
        question: "The equation P = D(E(P)) describes:",
        options: ["Keyless encryption", "Authentication protocol", "Basic encryption-decryption model", "Stream cipher model"],
        correctAnswer: 2,
        explanation: "This equation represents the basic encryption-decryption model where plaintext P is encrypted E(P) and then decrypted D(E(P)) to get back the original plaintext."
      },
      {
        id: 12,
        question: "What is Kerckhoffs' Principle about?",
        options: ["Secret algorithms must be used", "System security should depend only on key secrecy", "Encryption should be randomized", "Public key systems must be patented"],
        correctAnswer: 1,
        explanation: "Kerckhoffs' Principle states that the security of a cryptographic system should depend only on the secrecy of the key, not the algorithm."
      },
      {
        id: 13,
        question: "In chosen-plaintext attack, the attacker:",
        options: ["Has ciphertext only", "Cannot choose input messages", "Can select plaintexts and get ciphertexts", "Uses brute force"],
        correctAnswer: 2,
        explanation: "In a chosen-plaintext attack, the attacker can choose specific plaintexts and obtain their corresponding ciphertexts."
      },
      {
        id: 14,
        question: "Which type of cipher is faster and better suited for real-time encryption?",
        options: ["Block cipher", "Stream cipher", "Asymmetric cipher", "Substitution cipher"],
        correctAnswer: 1,
        explanation: "Stream ciphers are generally faster and better suited for real-time encryption as they process data continuously."
      },
      {
        id: 15,
        question: "Which component of a cryptosystem defines the encrypted message space?",
        options: ["Plaintext space", "Ciphertext space", "Key space", "Decryption function"],
        correctAnswer: 1,
        explanation: "The ciphertext space defines the set of all possible encrypted messages in a cryptosystem."
      },
      {
        id: 16,
        question: "What cannot cryptography do?",
        options: ["Provide confidentiality", "Prevent insider leaks", "Support digital signatures", "Enable secure key exchange"],
        correctAnswer: 1,
        explanation: "Cryptography cannot prevent insider threats or leaks from authorized users who have legitimate access to information."
      },
      {
        id: 17,
        question: "A breakable cipher is one that:",
        options: ["Can never be broken", "Is easily broken by anyone", "Has a known attack method but is not feasible to break", "Uses unbreakable keys"],
        correctAnswer: 2,
        explanation: "A breakable cipher has known attack methods but breaking it is not computationally feasible with current resources."
      },
      {
        id: 18,
        question: "The key difference between asymmetric and symmetric cryptography is:",
        options: ["Symmetric is more secure", "Asymmetric uses two different keys", "Symmetric is public", "Asymmetric cannot be decrypted"],
        correctAnswer: 1,
        explanation: "Asymmetric cryptography uses a pair of different keys (public and private), while symmetric uses the same key for encryption and decryption."
      },
      {
        id: 19,
        question: "In block cipher, one disadvantage is:",
        options: ["Too fast for secure use", "Cannot encrypt long messages", "Error propagation", "Can't encrypt binary data"],
        correctAnswer: 2,
        explanation: "Block ciphers can suffer from error propagation, where errors in one block can affect the decryption of subsequent blocks."
      },
      {
        id: 20,
        question: "Cryptanalysis refers to:",
        options: ["Writing secure protocols", "Designing digital signatures", "Attempting to break encryption", "Securing transmission media"],
        correctAnswer: 2,
        explanation: "Cryptanalysis is the study of analyzing and breaking cryptographic systems and encrypted messages."
      }
    ],
    2: [ // Assessment ID 2 - Chapter 2: Mathematics of Cryptography
      {
        id: 1,
        question: "What is the correct expression for the integer division of a by n?",
        options: ["a = q + n × r", "a = q × n − r", "a = q × n + r", "a = q / n + r"],
        correctAnswer: 2,
        explanation: "The correct expression is a = q × n + r, where q is the quotient and r is the remainder."
      },
      {
        id: 2,
        question: "Which of the following is true about the set of integers Z?",
        options: ["It only contains positive numbers", "It contains decimals and fractions", "It includes all whole numbers and their negatives", "It starts from 0 to infinity"],
        correctAnswer: 2,
        explanation: "The set Z includes all whole numbers and their negatives: {..., -2, -1, 0, 1, 2, ...}."
      },
      {
        id: 3,
        question: "What is the gcd of two numbers a and b if b = 0?",
        options: ["0", "a", "1", "Infinity"],
        correctAnswer: 1,
        explanation: "When b = 0, gcd(a, b) = gcd(a, 0) = a, since any number divides 0."
      },
      {
        id: 4,
        question: "Two numbers a and b are relatively prime if:",
        options: ["a = b", "gcd(a, b) = 0", "gcd(a, b) = 1", "a divides b"],
        correctAnswer: 2,
        explanation: "Two numbers are relatively prime (coprime) if their greatest common divisor is 1."
      },
      {
        id: 5,
        question: "The modulo operation returns:",
        options: ["Quotient", "Sum", "Product", "Remainder"],
        correctAnswer: 3,
        explanation: "The modulo operation returns the remainder after division."
      },
      {
        id: 6,
        question: "What is the value of (−7 mod 10)?",
        options: ["−7", "7", "3", "17"],
        correctAnswer: 2,
        explanation: "−7 mod 10 = 3, because −7 = 10 × (−1) + 3."
      },
      {
        id: 7,
        question: "What does the notation a ≡ b mod n mean?",
        options: ["a = b always", "a and b give the same remainder when divided by n", "a is larger than b", "a and b are relatively prime"],
        correctAnswer: 1,
        explanation: "a ≡ b mod n means that a and b are congruent modulo n, i.e., they give the same remainder when divided by n."
      },
      {
        id: 8,
        question: "Which set contains all integers modulo n?",
        options: ["Z", "Z*", "Zn", "Zn*"],
        correctAnswer: 2,
        explanation: "Zn is the set of all integers modulo n: {0, 1, 2, ..., n-1}."
      },
      {
        id: 9,
        question: "What is the additive inverse of 4 in Z10?",
        options: ["6", "5", "4", "10"],
        correctAnswer: 0,
        explanation: "The additive inverse of 4 in Z10 is 6, because 4 + 6 ≡ 0 mod 10."
      },
      {
        id: 10,
        question: "Which of the following does not have a multiplicative inverse in Z10?",
        options: ["3", "9", "8", "1"],
        correctAnswer: 2,
        explanation: "8 does not have a multiplicative inverse in Z10 because gcd(10, 8) = 2 ≠ 1."
      },
      {
        id: 11,
        question: "Which pair are multiplicative inverses in Z11?",
        options: ["(2, 5)", "(3, 4)", "(2, 6)", "(5, 10)"],
        correctAnswer: 2,
        explanation: "(2, 6) are multiplicative inverses in Z11 because 2 × 6 = 12 ≡ 1 mod 11."
      },
      {
        id: 12,
        question: "What condition must be true for a number a to have a multiplicative inverse in Zn?",
        options: ["a is even", "a is divisible by n", "gcd(a, n) = 1", "a mod n = 0"],
        correctAnswer: 2,
        explanation: "A number a has a multiplicative inverse in Zn if and only if gcd(a, n) = 1."
      },
      {
        id: 13,
        question: "In modular arithmetic, Zp* is:",
        options: ["A set of real numbers", "A set of even numbers", "A set of all integers modulo a prime number excluding 0", "The full set Zn"],
        correctAnswer: 2,
        explanation: "Zp* is the multiplicative group of integers modulo p, excluding 0, where p is prime."
      },
      {
        id: 14,
        question: "Which operation is used in modular arithmetic to 'wrap around' values?",
        options: ["Division", "Multiplication", "Addition", "Modulo"],
        correctAnswer: 3,
        explanation: "The modulo operation is used to 'wrap around' values to stay within the range [0, n-1]."
      },
      {
        id: 15,
        question: "The extended Euclidean algorithm is useful for:",
        options: ["Factoring large integers", "Converting binary to decimal", "Finding multiplicative inverses in Zn", "Encrypting messages"],
        correctAnswer: 2,
        explanation: "The extended Euclidean algorithm can find multiplicative inverses in Zn by solving the equation ax + ny = 1."
      },
      {
        id: 16,
        question: "What is the multiplicative inverse of 23 in Z100?",
        options: ["13", "−13", "87", "27"],
        correctAnswer: 2,
        explanation: "The multiplicative inverse of 23 in Z100 is 87, because 23 × 87 = 2001 ≡ 1 mod 100."
      },
      {
        id: 17,
        question: "Which set would you use when only multiplicative inverses are required?",
        options: ["Z", "Zn", "Zn*", "Zm"],
        correctAnswer: 2,
        explanation: "Zn* is the set of integers modulo n that have multiplicative inverses, i.e., those coprime to n."
      }
    ],
    3: [ // Assessment ID 3 - Chapter 3: Traditional Symmetric-Key Ciphers
      {
        id: 1,
        question: "In a symmetric-key cipher, the same key is used for:",
        options: ["Authentication only", "Both encryption and decryption", "Signing only", "Hashing"],
        correctAnswer: 1,
        explanation: "In symmetric-key cryptography, the same key is used for both encryption and decryption operations."
      },
      {
        id: 2,
        question: "According to Kerckhoff's Principle, the secrecy of a cipher depends on:",
        options: ["The complexity of the algorithm", "Keeping the algorithm and key secret", "The secrecy of the key only", "Frequent key changes"],
        correctAnswer: 2,
        explanation: "Kerckhoff's Principle states that the security of a cryptographic system should depend only on the secrecy of the key, not the algorithm."
      },
      {
        id: 3,
        question: "What is cryptanalysis?",
        options: ["Art of writing encryption algorithms", "Art of secure key exchange", "Science of breaking ciphers", "Secure email protocols"],
        correctAnswer: 2,
        explanation: "Cryptanalysis is the science of analyzing and breaking cryptographic systems and encrypted messages."
      },
      {
        id: 4,
        question: "Which attack only uses intercepted ciphertext?",
        options: ["Known-plaintext attack", "Chosen-plaintext attack", "Ciphertext-only attack", "Side-channel attack"],
        correctAnswer: 2,
        explanation: "A ciphertext-only attack relies solely on intercepted ciphertext without any knowledge of the plaintext or key."
      },
      {
        id: 5,
        question: "What type of attack involves attacker selecting plaintexts and seeing ciphertexts?",
        options: ["Chosen-plaintext attack", "Known-ciphertext attack", "Cipher collision attack", "Brute-force attack"],
        correctAnswer: 0,
        explanation: "In a chosen-plaintext attack, the attacker can choose specific plaintexts and obtain their corresponding ciphertexts."
      },
      {
        id: 6,
        question: "A substitution cipher:",
        options: ["Alters the position of characters", "Replaces characters with other characters", "Deletes characters", "Stores characters in a table"],
        correctAnswer: 1,
        explanation: "A substitution cipher replaces each character in the plaintext with another character according to a fixed system."
      },
      {
        id: 7,
        question: "In a monoalphabetic substitution cipher:",
        options: ["One plaintext maps to multiple ciphertexts", "Ciphertext changes every time", "One-to-one mapping is used", "Multiple keys are used per letter"],
        correctAnswer: 2,
        explanation: "A monoalphabetic substitution cipher uses a one-to-one mapping where each plaintext character is replaced by exactly one ciphertext character."
      },
      {
        id: 8,
        question: "A Caesar cipher is a:",
        options: ["Polyalphabetic cipher", "Monoalphabetic cipher with a fixed shift", "Stream cipher", "Block cipher"],
        correctAnswer: 1,
        explanation: "The Caesar cipher is a monoalphabetic substitution cipher that shifts each letter by a fixed number of positions in the alphabet."
      },
      {
        id: 9,
        question: "What is the ciphertext of 'HELLO' using Caesar cipher with key = 3?",
        options: ["KHOOR", "ZEBBW", "DAAKN", "WTAAD"],
        correctAnswer: 0,
        explanation: "H→K, E→H, L→O, L→O, O→R, so 'HELLO' becomes 'KHOOR' with a shift of 3."
      },
      {
        id: 10,
        question: "What does frequency analysis target in cryptanalysis?",
        options: ["The encryption key", "Character repetition in ciphertext", "Position of letters", "Noise in the transmission"],
        correctAnswer: 1,
        explanation: "Frequency analysis examines the frequency of characters in ciphertext to identify patterns and break substitution ciphers."
      },
      {
        id: 11,
        question: "In a multiplicative cipher, the key must be from:",
        options: ["Z26", "Z26*", "Z52", "Any odd number"],
        correctAnswer: 1,
        explanation: "The key for a multiplicative cipher must be from Z26* (coprime to 26) to ensure a unique decryption exists."
      },
      {
        id: 12,
        question: "Which keys are valid for multiplicative cipher in Z26?",
        options: ["2, 4, 6", "3, 7, 11", "0, 1, 26", "All even numbers"],
        correctAnswer: 1,
        explanation: "Valid keys for multiplicative cipher in Z26 are those coprime to 26: 3, 7, 11, etc. (gcd(key, 26) = 1)."
      },
      {
        id: 13,
        question: "What is the weakness of monoalphabetic ciphers?",
        options: ["High computational time", "Complex key generation", "Easy to crack using frequency analysis", "Only encrypts binary"],
        correctAnswer: 2,
        explanation: "Monoalphabetic ciphers are vulnerable to frequency analysis because they preserve the frequency distribution of characters."
      },
      {
        id: 14,
        question: "In polyalphabetic ciphers like Vigenère, the key:",
        options: ["Is reused for each letter", "Is longer than plaintext", "Is the ciphertext itself", "Is generated randomly"],
        correctAnswer: 0,
        explanation: "In polyalphabetic ciphers, the key is reused cyclically for each letter, providing better security than monoalphabetic ciphers."
      },
      {
        id: 15,
        question: "The autokey cipher:",
        options: ["Uses fixed key for encryption", "Uses previous plaintext as next key", "Uses public key", "Uses block chaining"],
        correctAnswer: 1,
        explanation: "The autokey cipher uses the previous plaintext characters as the key for subsequent encryption, creating a self-synchronizing stream."
      },
      {
        id: 16,
        question: "What technique helps break Vigenère cipher?",
        options: ["Brute-force", "Kasiski test", "RSA probing", "S-box mapping"],
        correctAnswer: 1,
        explanation: "The Kasiski test identifies repeated patterns in ciphertext to determine the key length of a Vigenère cipher."
      },
      {
        id: 17,
        question: "The one-time pad achieves:",
        options: ["Maximum efficiency", "Public key encryption", "Perfect secrecy", "Block-level security"],
        correctAnswer: 2,
        explanation: "The one-time pad achieves perfect secrecy when the key is truly random, used only once, and as long as the plaintext."
      },
      {
        id: 18,
        question: "What type of cipher rearranges characters but does not replace them?",
        options: ["Substitution", "Permutation", "Transposition", "Vigenère"],
        correctAnswer: 2,
        explanation: "A transposition cipher rearranges the positions of characters without changing the characters themselves."
      },
      {
        id: 19,
        question: "The rail fence cipher is an example of:",
        options: ["Keyed transposition", "Keyless transposition", "Autokey cipher", "Caesar cipher"],
        correctAnswer: 1,
        explanation: "The rail fence cipher is a keyless transposition cipher that writes the plaintext in a zigzag pattern across multiple rails."
      },
      {
        id: 20,
        question: "What is a double transposition cipher?",
        options: ["Two Caesar ciphers", "Transposition cipher used twice", "Uses two keys for substitution", "Uses XOR and S-box"],
        correctAnswer: 1,
        explanation: "A double transposition cipher applies a transposition cipher twice, typically with different keys, to increase security."
      }
    ],
    5: [ // Assessment ID 5 - Chapter 5: Modern Symmetric-Key Ciphers
      {
        id: 1,
        question: "A modern block cipher operates on:",
        options: ["Individual characters", "Variable-length strings", "Fixed-size blocks", "Bytecode only"],
        correctAnswer: 2,
        explanation: "Modern block ciphers process data in fixed-size blocks (e.g., 64-bit or 128-bit blocks) rather than individual characters."
      },
      {
        id: 2,
        question: "What is the purpose of designing modern block ciphers as substitution ciphers?",
        options: ["To save space", "To reduce encryption time", "To resist exhaustive-search attacks", "To allow streaming"],
        correctAnswer: 2,
        explanation: "Modern block ciphers are designed as substitution ciphers to resist exhaustive-search attacks by making the relationship between plaintext and ciphertext complex."
      },
      {
        id: 3,
        question: "In block ciphers, what do P-boxes perform?",
        options: ["Substitution", "Permutation", "Compression", "Addition"],
        correctAnswer: 1,
        explanation: "P-boxes (Permutation boxes) perform permutation operations, rearranging the positions of bits without changing their values."
      },
      {
        id: 4,
        question: "A straight P-box is:",
        options: ["Non-invertible", "Compressing data", "Invertible", "Only used in stream ciphers"],
        correctAnswer: 2,
        explanation: "A straight P-box is invertible, meaning the permutation can be reversed to recover the original bit positions."
      },
      {
        id: 5,
        question: "Which type of P-box has fewer outputs than inputs?",
        options: ["Straight P-box", "Expansion P-box", "Compression P-box", "Reversal P-box"],
        correctAnswer: 2,
        explanation: "A compression P-box has fewer outputs than inputs, reducing the number of bits in the output."
      },
      {
        id: 6,
        question: "What does an S-box (Substitution box) perform?",
        options: ["Permutation", "Bit inversion", "Substitution", "Decryption"],
        correctAnswer: 2,
        explanation: "S-boxes perform substitution operations, replacing input bit patterns with different output bit patterns according to a predefined table."
      },
      {
        id: 7,
        question: "An S-box with 3 input bits and 2 output bits is called:",
        options: ["3x2 S-box", "2x3 Sub-Box", "GF-Box", "Byte XOR box"],
        correctAnswer: 0,
        explanation: "An S-box with 3 input bits and 2 output bits is called a 3x2 S-box, indicating 3-bit input and 2-bit output."
      },
      {
        id: 8,
        question: "A product cipher is made by combining:",
        options: ["XOR and hashing", "Substitution and permutation", "Padding and truncation", "Key expansion and compression"],
        correctAnswer: 1,
        explanation: "A product cipher combines substitution and permutation operations to create a more secure cipher than either alone."
      },
      {
        id: 9,
        question: "In a Feistel cipher, encryption and decryption:",
        options: ["Use different processes", "Use inverse of S-box", "Are symmetric and use the same structure", "Require a larger key"],
        correctAnswer: 2,
        explanation: "Feistel ciphers are symmetric in that encryption and decryption use the same structure, just with keys in reverse order."
      },
      {
        id: 10,
        question: "Which property hides the relationship between ciphertext and plaintext?",
        options: ["Confusion", "Hashing", "Diffusion", "Obfuscation"],
        correctAnswer: 2,
        explanation: "Diffusion hides the relationship between ciphertext and plaintext by spreading the influence of plaintext bits across multiple ciphertext bits."
      },
      {
        id: 11,
        question: "Which property hides the relationship between ciphertext and key?",
        options: ["Confusion", "Obfuscation", "Diffusion", "Multiplexing"],
        correctAnswer: 0,
        explanation: "Confusion hides the relationship between ciphertext and key by making the relationship between them as complex as possible."
      },
      {
        id: 12,
        question: "Which component is self-invertible and used in block ciphers?",
        options: ["Circular shift", "P-box", "XOR", "SubBytes"],
        correctAnswer: 2,
        explanation: "XOR is self-invertible - applying XOR twice with the same key returns the original value: (P ⊕ K) ⊕ K = P."
      },
      {
        id: 13,
        question: "What is a distinguishing feature of non-Feistel ciphers?",
        options: ["Uses half blocks", "Only invertible components", "No key expansion", "Uses RSA internally"],
        correctAnswer: 1,
        explanation: "Non-Feistel ciphers use only invertible components, meaning every component must have a mathematical inverse."
      },
      {
        id: 14,
        question: "What type of cryptanalysis uses chosen plaintext?",
        options: ["Linear", "Statistical", "Differential", "Known-ciphertext"],
        correctAnswer: 2,
        explanation: "Differential cryptanalysis uses chosen plaintext pairs to analyze how differences in plaintext propagate through the cipher."
      },
      {
        id: 15,
        question: "Linear cryptanalysis was introduced by:",
        options: ["Eli Biham", "Adi Shamir", "Mitsuru Matsui", "Ron Rivest"],
        correctAnswer: 2,
        explanation: "Linear cryptanalysis was introduced by Mitsuru Matsui in 1993 as a method to attack block ciphers."
      },
      {
        id: 16,
        question: "What are the two main classes of product ciphers?",
        options: ["Stream and block", "Feistel and non-Feistel", "Public and private", "Hash and symmetric"],
        correctAnswer: 1,
        explanation: "Product ciphers are classified into two main categories: Feistel ciphers and non-Feistel ciphers."
      },
      {
        id: 17,
        question: "In XOR operation, if one input is fixed (e.g., key), the operation becomes:",
        options: ["Random", "Asymmetric", "Self-invertible", "Unpredictable"],
        correctAnswer: 2,
        explanation: "When one input to XOR is fixed (like a key), the operation becomes self-invertible: (P ⊕ K) ⊕ K = P."
      },
      {
        id: 18,
        question: "What is the maximum period of an LFSR with m cells?",
        options: ["2^m", "2^m – 1", "m!", "m^2"],
        correctAnswer: 1,
        explanation: "The maximum period of an LFSR with m cells is 2^m – 1, achieved when the feedback polynomial is primitive."
      },
      {
        id: 19,
        question: "Which shift register produces a pseudo-random key stream?",
        options: ["DFF", "LFSR", "PSR", "MUX"],
        correctAnswer: 1,
        explanation: "Linear Feedback Shift Register (LFSR) produces a pseudo-random key stream used in stream ciphers."
      },
      {
        id: 20,
        question: "In a synchronous stream cipher, the key stream:",
        options: ["Depends on plaintext", "Depends on ciphertext", "Is independent of both plaintext and ciphertext", "Is chosen at random each time"],
        correctAnswer: 2,
        explanation: "In a synchronous stream cipher, the key stream is generated independently of both plaintext and ciphertext, making it more secure."
      }
    ],
    6: [ // Assessment ID 6 - Chapter 6: Data Encryption Standard (DES)
      {
        id: 1,
        question: "DES is what type of cipher?",
        options: ["Stream cipher", "Asymmetric block cipher", "Symmetric block cipher", "Hash function"],
        correctAnswer: 2,
        explanation: "DES is a symmetric block cipher that uses the same key for both encryption and decryption, processing data in 64-bit blocks."
      },
      {
        id: 2,
        question: "How many rounds does DES use?",
        options: ["8", "10", "16", "20"],
        correctAnswer: 2,
        explanation: "DES uses 16 rounds of encryption, with each round applying the Feistel structure to transform the plaintext."
      },
      {
        id: 3,
        question: "The structure used in each DES round is:",
        options: ["Substitution-permutation network", "Vigenère square", "Feistel structure", "LFSR"],
        correctAnswer: 2,
        explanation: "DES uses the Feistel structure in each round, which allows the same algorithm to be used for both encryption and decryption."
      },
      {
        id: 4,
        question: "What is the size of the input block in DES?",
        options: ["32 bits", "56 bits", "64 bits", "128 bits"],
        correctAnswer: 2,
        explanation: "DES processes data in 64-bit blocks, with the input block being 64 bits in size."
      },
      {
        id: 5,
        question: "The DES key is technically 64 bits, but only how many bits are used for encryption?",
        options: ["56", "64", "48", "32"],
        correctAnswer: 0,
        explanation: "DES uses a 64-bit key, but only 56 bits are actually used for encryption (8 bits are parity bits)."
      },
      {
        id: 6,
        question: "What is the role of the initial permutation (IP) in DES?",
        options: ["Adds security", "Acts as padding", "Rearranges the input bits", "Compresses data"],
        correctAnswer: 2,
        explanation: "The initial permutation (IP) rearranges the input bits according to a fixed pattern, preparing the data for the Feistel rounds."
      },
      {
        id: 7,
        question: "The final permutation (FP) in DES:",
        options: ["Is identical to initial permutation", "Is the inverse of the initial permutation", "Is random", "Does not affect encryption"],
        correctAnswer: 1,
        explanation: "The final permutation (FP) is the inverse of the initial permutation (IP), restoring the original bit order after the 16 rounds."
      },
      {
        id: 8,
        question: "What is the size of the right half that enters the DES round function?",
        options: ["32 bits", "48 bits", "56 bits", "64 bits"],
        correctAnswer: 0,
        explanation: "In each DES round, the right half (32 bits) enters the round function while the left half (32 bits) is XORed with the function output."
      },
      {
        id: 9,
        question: "Before entering the S-boxes, the right half is expanded to:",
        options: ["32 bits", "48 bits", "56 bits", "64 bits"],
        correctAnswer: 1,
        explanation: "The right half is expanded from 32 bits to 48 bits using an expansion P-box before being XORed with the round key."
      },
      {
        id: 10,
        question: "Each S-box in DES takes how many input bits and outputs how many?",
        options: ["4 in, 4 out", "8 in, 8 out", "6 in, 4 out", "6 in, 6 out"],
        correctAnswer: 2,
        explanation: "Each S-box in DES takes 6 input bits and produces 4 output bits, providing the substitution component of the cipher."
      },
      {
        id: 11,
        question: "The number of S-boxes in DES is:",
        options: ["4", "6", "8", "10"],
        correctAnswer: 2,
        explanation: "DES uses 8 S-boxes, each taking 6 bits and producing 4 bits, for a total of 48 input bits producing 32 output bits."
      },
      {
        id: 12,
        question: "What operation is used to combine the expanded R and the round key?",
        options: ["Addition", "XOR", "Multiplication", "Bitwise AND"],
        correctAnswer: 1,
        explanation: "The expanded right half (48 bits) is XORed with the round key (48 bits) before entering the S-boxes."
      },
      {
        id: 13,
        question: "DES function output size after each round is:",
        options: ["48 bits", "64 bits", "32 bits", "56 bits"],
        correctAnswer: 2,
        explanation: "The DES round function produces a 32-bit output, which is then XORed with the left half to complete the round."
      },
      {
        id: 14,
        question: "The avalanche effect in DES means:",
        options: ["Key is exposed", "Small input change → big output change", "No error propagation", "Output is always fixed"],
        correctAnswer: 1,
        explanation: "The avalanche effect ensures that a small change in the input (plaintext or key) produces a large change in the output, providing good diffusion."
      },
      {
        id: 15,
        question: "Which of the following is not a weakness of DES?",
        options: ["Short key size", "Known S-box structure", "Non-invertible rounds", "Vulnerability to brute force"],
        correctAnswer: 2,
        explanation: "DES rounds are invertible (that's how decryption works). The weaknesses include short key size, known S-box structure, and vulnerability to brute force."
      },
      {
        id: 16,
        question: "What is the purpose of multiple DES (2DES or 3DES)?",
        options: ["Speed up encryption", "Reduce storage", "Improve security", "Hide key from user"],
        correctAnswer: 2,
        explanation: "Multiple DES (2DES or 3DES) is used to improve security by increasing the effective key length and resistance to attacks."
      },
      {
        id: 17,
        question: "Why is 2DES considered insecure?",
        options: ["Short key", "Repeats round keys", "Meet-in-the-middle attack", "Uses linear S-boxes"],
        correctAnswer: 2,
        explanation: "2DES is vulnerable to the meet-in-the-middle attack, which reduces the effective security from 112 bits to approximately 57 bits."
      },
      {
        id: 18,
        question: "How many keys are used in Triple DES (3DES) with three-key version?",
        options: ["1", "2", "3", "4"],
        correctAnswer: 2,
        explanation: "Triple DES with three-key version uses three different keys: K1, K2, and K3, providing 168-bit effective key length."
      },
      {
        id: 19,
        question: "Which attack has no known effective method against full DES?",
        options: ["Brute force", "Differential cryptanalysis", "Linear cryptanalysis", "Side-channel attack"],
        correctAnswer: 1,
        explanation: "Differential cryptanalysis has no known effective method against the full 16-round DES, though it can attack reduced-round versions."
      },
      {
        id: 20,
        question: "Which DES component provides confusion?",
        options: ["Expansion P-box", "Straight permutation", "S-boxes", "XOR"],
        correctAnswer: 2,
        explanation: "The S-boxes provide confusion by creating a complex, non-linear relationship between the input and output bits."
      }
    ],
    7: [ // Assessment ID 7 - Chapter 7: Advanced Encryption Standard (AES)
      {
        id: 1,
        question: "AES is a:",
        options: ["Feistel cipher", "Stream cipher", "Non-Feistel block cipher", "Substitution-only cipher"],
        correctAnswer: 2,
        explanation: "AES is a non-Feistel block cipher that uses a substitution-permutation network structure instead of the Feistel structure."
      },
      {
        id: 2,
        question: "What is the block size for AES?",
        options: ["64 bits", "128 bits", "256 bits", "Variable"],
        correctAnswer: 1,
        explanation: "AES has a fixed block size of 128 bits, which is larger than DES's 64-bit blocks, providing better security."
      },
      {
        id: 3,
        question: "How many rounds does AES-256 use?",
        options: ["10", "12", "14", "16"],
        correctAnswer: 2,
        explanation: "AES-256 uses 14 rounds, while AES-128 uses 10 rounds and AES-192 uses 12 rounds."
      },
      {
        id: 4,
        question: "AES supports which key sizes?",
        options: ["128, 192, 256 bits", "64, 128, 256 bits", "128 only", "192 only"],
        correctAnswer: 0,
        explanation: "AES supports three key sizes: 128 bits (AES-128), 192 bits (AES-192), and 256 bits (AES-256)."
      },
      {
        id: 5,
        question: "The AES SubBytes transformation provides:",
        options: ["Permutation", "Key expansion", "Substitution", "Compression"],
        correctAnswer: 2,
        explanation: "SubBytes provides substitution by replacing each byte with another byte using a predefined S-box lookup table."
      },
      {
        id: 6,
        question: "The ShiftRows transformation:",
        options: ["Rotates columns", "Shifts bytes in each row", "Mixes columns", "Adds round key"],
        correctAnswer: 1,
        explanation: "ShiftRows shifts bytes in each row by different amounts: row 0 unchanged, row 1 shifted by 1, row 2 by 2, row 3 by 3."
      },
      {
        id: 7,
        question: "Which transformation provides diffusion in AES?",
        options: ["SubBytes", "AddRoundKey", "ShiftRows", "MixColumns"],
        correctAnswer: 3,
        explanation: "MixColumns provides diffusion by mixing the bytes within each column using matrix multiplication in GF(2⁸)."
      },
      {
        id: 8,
        question: "In AES, the final round does not include:",
        options: ["MixColumns", "ShiftRows", "SubBytes", "AddRoundKey"],
        correctAnswer: 0,
        explanation: "The final round omits MixColumns to make the encryption and decryption processes symmetric."
      },
      {
        id: 9,
        question: "AES round keys are generated using:",
        options: ["Random number generator", "XOR with IV", "Key expansion algorithm", "LFSR"],
        correctAnswer: 2,
        explanation: "AES uses a key expansion algorithm to generate round keys from the original key, with different schedules for different key sizes."
      },
      {
        id: 10,
        question: "The AddRoundKey transformation involves:",
        options: ["Modular multiplication", "Exclusive-OR (XOR)", "Polynomial division", "Swapping rows"],
        correctAnswer: 1,
        explanation: "AddRoundKey performs a bitwise XOR operation between the state matrix and the round key."
      },
      {
        id: 11,
        question: "AES treats data as a:",
        options: ["2x2 matrix", "4x4 matrix of bytes", "4x4 matrix of bits", "1D array of 16 bits"],
        correctAnswer: 1,
        explanation: "AES treats the 128-bit block as a 4x4 matrix of bytes, with each byte representing 8 bits."
      },
      {
        id: 12,
        question: "What is the size of each cell in the AES state matrix?",
        options: ["1 bit", "4 bits", "8 bits", "16 bits"],
        correctAnswer: 2,
        explanation: "Each cell in the AES state matrix is 8 bits (1 byte), with the 4x4 matrix containing 16 bytes total."
      },
      {
        id: 13,
        question: "What mathematical field is AES based on?",
        options: ["Prime groups", "GF(2⁸)", "Real numbers", "Complex polynomials"],
        correctAnswer: 1,
        explanation: "AES is based on the Galois Field GF(2⁸), which allows efficient byte-level operations and matrix multiplications."
      },
      {
        id: 14,
        question: "In AES, each byte is substituted using:",
        options: ["Linear transformation", "S-box lookup", "Circular shift", "XOR with previous byte"],
        correctAnswer: 1,
        explanation: "Each byte in AES is substituted using an S-box lookup table that provides non-linear transformation."
      },
      {
        id: 15,
        question: "In InvShiftRows, rows are shifted:",
        options: ["Left", "Right", "Up", "Down"],
        correctAnswer: 1,
        explanation: "In InvShiftRows (inverse of ShiftRows), rows are shifted right by the same amounts as the forward transformation."
      },
      {
        id: 16,
        question: "AES is stronger than DES mainly because:",
        options: ["More rounds", "Larger key size", "Uses public key", "Has LFSR"],
        correctAnswer: 1,
        explanation: "AES is stronger than DES primarily due to its larger key size (128/192/256 bits vs 56 bits), making brute force attacks infeasible."
      },
      {
        id: 17,
        question: "AES can be efficiently implemented in:",
        options: ["Hardware only", "Software only", "Hardware, software, and firmware", "Only in secure environments"],
        correctAnswer: 2,
        explanation: "AES can be efficiently implemented in hardware, software, and firmware, making it versatile for various applications."
      },
      {
        id: 18,
        question: "Which AES component uses matrix multiplication?",
        options: ["SubBytes", "ShiftRows", "MixColumns", "AddRoundKey"],
        correctAnswer: 2,
        explanation: "MixColumns uses matrix multiplication in GF(2⁸) to mix the bytes within each column, providing diffusion."
      },
      {
        id: 19,
        question: "The inverse of AddRoundKey is:",
        options: ["MixColumns", "Itself (AddRoundKey)", "SubBytes", "ShiftRows"],
        correctAnswer: 1,
        explanation: "AddRoundKey is self-invertible - applying the same operation twice returns the original value: (S ⊕ K) ⊕ K = S."
      },
      {
        id: 20,
        question: "AES was published as:",
        options: ["RSA-1024", "FIPS 46-3", "FIPS 197", "ISO/IEC 27001"],
        correctAnswer: 2,
        explanation: "AES was published as FIPS 197 (Federal Information Processing Standard 197) by NIST in 2001."
      }
    ],
    8: [ // Assessment ID 8 - Chapter 8: Encipherment Using Modern Symmetric-Key Ciphers
      {
        id: 1,
        question: "Which problem does cipher modes of operation solve?",
        options: ["Key generation", "Padding algorithms", "Encrypting long messages with block ciphers", "Generating hash values"],
        correctAnswer: 2,
        explanation: "Cipher modes of operation solve the problem of encrypting long messages with block ciphers by defining how to handle multiple blocks."
      },
      {
        id: 2,
        question: "What is the simplest block cipher mode?",
        options: ["CBC", "OFB", "ECB", "CTR"],
        correctAnswer: 2,
        explanation: "ECB (Electronic Codebook) is the simplest mode where each block is encrypted independently without any chaining."
      },
      {
        id: 3,
        question: "In ECB mode, the same plaintext block:",
        options: ["Produces different ciphertexts", "Is randomized each time", "Always gives the same ciphertext", "Cannot be encrypted"],
        correctAnswer: 2,
        explanation: "In ECB mode, identical plaintext blocks always produce identical ciphertext blocks, which is a major security weakness."
      },
      {
        id: 4,
        question: "What is a major weakness of ECB mode?",
        options: ["Requires IV", "High error propagation", "Reveals patterns in repeated data", "Slow encryption speed"],
        correctAnswer: 2,
        explanation: "ECB mode reveals patterns in repeated data because identical plaintext blocks produce identical ciphertext blocks."
      },
      {
        id: 5,
        question: "In CBC mode, each plaintext block is:",
        options: ["Hashed before encryption", "XORed with previous ciphertext", "Padded with random bits", "Reversed before encryption"],
        correctAnswer: 1,
        explanation: "In CBC mode, each plaintext block is XORed with the previous ciphertext block before encryption."
      },
      {
        id: 6,
        question: "CBC mode requires which of the following?",
        options: ["Same key length", "Initialization Vector (IV)", "Hash digest", "LFSR"],
        correctAnswer: 1,
        explanation: "CBC mode requires an Initialization Vector (IV) for the first block since there is no previous ciphertext block."
      },
      {
        id: 7,
        question: "What is the main weakness of CBC mode?",
        options: ["It requires too many keys", "Bit errors in ciphertext affect multiple plaintext blocks", "Same ciphertext for same plaintext", "Slow decryption"],
        correctAnswer: 1,
        explanation: "In CBC mode, a bit error in one ciphertext block affects the decryption of that block and the next block due to chaining."
      },
      {
        id: 8,
        question: "What does CFB stand for?",
        options: ["Cipher First Block", "Cipher Feedback", "Control Flow Block", "Cipher Format Block"],
        correctAnswer: 1,
        explanation: "CFB stands for Cipher Feedback, where the ciphertext is fed back to encrypt the next block."
      },
      {
        id: 9,
        question: "Which mode turns a block cipher into a stream cipher?",
        options: ["ECB", "CBC", "CFB", "CTR"],
        correctAnswer: 2,
        explanation: "CFB mode turns a block cipher into a stream cipher by using the cipher to generate a keystream that is XORed with the plaintext."
      },
      {
        id: 10,
        question: "In OFB mode, ciphertext is:",
        options: ["Randomly shuffled", "Dependent on feedback of previous plaintext", "Independent of ciphertext feedback", "Reversed after each round"],
        correctAnswer: 2,
        explanation: "In OFB mode, the keystream is generated independently of the plaintext, making ciphertext independent of ciphertext feedback."
      },
      {
        id: 11,
        question: "Which mode is least prone to error propagation?",
        options: ["CBC", "ECB", "CFB", "OFB"],
        correctAnswer: 3,
        explanation: "OFB mode is least prone to error propagation because bit errors in ciphertext only affect the corresponding plaintext bit."
      },
      {
        id: 12,
        question: "What is used in CTR mode to generate key streams?",
        options: ["LFSR", "Counter", "Hashing", "IV chaining"],
        correctAnswer: 1,
        explanation: "CTR mode uses a counter to generate key streams, encrypting counter values instead of plaintext blocks."
      },
      {
        id: 13,
        question: "Which mode encrypts counter values instead of plaintext?",
        options: ["ECB", "CBC", "CTR", "OFB"],
        correctAnswer: 2,
        explanation: "CTR mode encrypts counter values to generate a keystream, which is then XORed with the plaintext."
      },
      {
        id: 14,
        question: "In which mode are encryption and decryption processes identical?",
        options: ["CFB", "OFB", "ECB", "CBC"],
        correctAnswer: 1,
        explanation: "In OFB mode, encryption and decryption processes are identical because both involve XORing with the same keystream."
      },
      {
        id: 15,
        question: "Which mode can be parallelized easily?",
        options: ["CBC", "ECB", "CFB", "CTR"],
        correctAnswer: 3,
        explanation: "CTR mode can be easily parallelized because each block's keystream can be generated independently using different counter values."
      },
      {
        id: 16,
        question: "Which stream cipher was widely used in Wi-Fi and SSL?",
        options: ["A5/1", "RC4", "DES", "AES"],
        correctAnswer: 1,
        explanation: "RC4 was widely used in Wi-Fi (WEP) and SSL/TLS protocols, though it has since been deprecated due to security vulnerabilities."
      },
      {
        id: 17,
        question: "In RC4, each byte of plaintext is:",
        options: ["Subtracted from the key", "Encrypted with a random key", "XORed with a byte of the keystream", "Converted to binary"],
        correctAnswer: 2,
        explanation: "In RC4, each byte of plaintext is XORed with a byte of the keystream generated by the RC4 algorithm."
      },
      {
        id: 18,
        question: "What is the primary structure used in A5/1?",
        options: ["Hash chain", "Stream XOR", "Three LFSRs", "P-box permutation"],
        correctAnswer: 2,
        explanation: "A5/1 uses three LFSRs (Linear Feedback Shift Registers) of different lengths to generate the keystream."
      },
      {
        id: 19,
        question: "In A5/1, what determines which LFSRs are clocked?",
        options: ["IV", "Majority function of clocking bits", "Feedback bits", "Round number"],
        correctAnswer: 1,
        explanation: "In A5/1, a majority function of the clocking bits determines which LFSRs are clocked in each step."
      },
      {
        id: 20,
        question: "What is a purpose of ciphertext stealing (CTS)?",
        options: ["To increase block size", "To avoid padding", "To reverse block order", "To corrupt last block"],
        correctAnswer: 1,
        explanation: "Ciphertext stealing (CTS) is used to avoid padding by stealing ciphertext from the second-to-last block to pad the last block."
      }
    ],
    9: [ // Assessment ID 9 - Chapter 9: Mathematics of Asymmetric-Key Cryptography
      {
        id: 1,
        question: "What is a prime number?",
        options: ["A number divisible by 2 only", "A number divisible by itself and 1 only", "A number with no factors", "A number divisible by all numbers"],
        correctAnswer: 1,
        explanation: "A prime number is a natural number greater than 1 that is divisible only by itself and 1."
      },
      {
        id: 2,
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correctAnswer: 2,
        explanation: "2 is the smallest prime number and the only even prime number."
      },
      {
        id: 3,
        question: "Which of the following numbers is not prime?",
        options: ["2", "7", "13", "21"],
        correctAnswer: 3,
        explanation: "21 is not prime because it is divisible by 3 and 7 (21 = 3 × 7)."
      },
      {
        id: 4,
        question: "To check if a number is prime, we must:",
        options: ["Divide it by 2 only", "Check divisibility by all primes ≤ √n", "Use Fermat's Theorem", "Use logarithms"],
        correctAnswer: 1,
        explanation: "To check if a number n is prime, we only need to test divisibility by all prime numbers less than or equal to √n."
      },
      {
        id: 5,
        question: "What is φ(7) where 7 is prime?",
        options: ["6", "5", "0", "3"],
        correctAnswer: 0,
        explanation: "For a prime number p, φ(p) = p - 1, so φ(7) = 7 - 1 = 6."
      },
      {
        id: 6,
        question: "Which of the following is not a correct use of Euler's phi function?",
        options: ["φ(13) = 12", "φ(10) = φ(2) × φ(5)", "φ(49) = φ(7) × φ(7)", "φ(240) = (2⁴−2³)(3−1)(5−1)"],
        correctAnswer: 2,
        explanation: "φ(49) = φ(7) × φ(7) is incorrect because 7 and 7 are not coprime. For prime powers p^k, φ(p^k) = p^k - p^(k-1)."
      },
      {
        id: 7,
        question: "If n = 14, how many elements are in Z₁₄*?",
        options: ["7", "14", "6", "12"],
        correctAnswer: 2,
        explanation: "Z₁₄* contains elements coprime to 14. Since 14 = 2 × 7, φ(14) = φ(2) × φ(7) = 1 × 6 = 6."
      },
      {
        id: 8,
        question: "Fermat's Little Theorem applies only when:",
        options: ["n is even", "a and n are coprime", "n is a prime number", "a is odd"],
        correctAnswer: 2,
        explanation: "Fermat's Little Theorem applies when n is a prime number p, stating that a^(p-1) ≡ 1 mod p for any a not divisible by p."
      },
      {
        id: 9,
        question: "Fermat's Little Theorem formula is:",
        options: ["aⁿ mod n = 1", "a^(p−1) ≡ 1 mod p", "a^p ≡ a mod n", "a^n = 0"],
        correctAnswer: 1,
        explanation: "Fermat's Little Theorem states that for a prime p and any integer a not divisible by p, a^(p-1) ≡ 1 mod p."
      },
      {
        id: 10,
        question: "According to Fermat's Theorem, 2¹⁶ mod 17 equals:",
        options: ["0", "16", "1", "2"],
        correctAnswer: 2,
        explanation: "By Fermat's Little Theorem, 2^(17-1) = 2^16 ≡ 1 mod 17, since 17 is prime."
      },
      {
        id: 11,
        question: "Which of the following gives the multiplicative inverse of a mod p (prime)?",
        options: ["a² mod p", "a⁻¹ = a^(p−2) mod p", "a + p mod a", "a × φ(p) mod p"],
        correctAnswer: 1,
        explanation: "For a prime p, the multiplicative inverse of a mod p is a^(p-2) mod p, since a × a^(p-2) ≡ a^(p-1) ≡ 1 mod p."
      },
      {
        id: 12,
        question: "If φ(35) = 24, what is 6²⁴ mod 35?",
        options: ["0", "1", "24", "6"],
        correctAnswer: 1,
        explanation: "By Euler's Theorem, since gcd(6, 35) = 1, 6^φ(35) = 6^24 ≡ 1 mod 35."
      },
      {
        id: 13,
        question: "Euler's Theorem generalizes Fermat's Theorem to:",
        options: ["All real numbers", "All primes only", "Any a, n where gcd(a, n) = 1", "Only multiples of 3"],
        correctAnswer: 2,
        explanation: "Euler's Theorem generalizes Fermat's Little Theorem to any integers a and n where gcd(a, n) = 1."
      },
      {
        id: 14,
        question: "What is the second version of Euler's Theorem?",
        options: ["a^n ≡ 1 mod n", "a^(kφ(n)+1) ≡ a mod n", "a^2 ≡ a mod n", "a × φ(n) ≡ 1 mod n"],
        correctAnswer: 1,
        explanation: "The second version of Euler's Theorem states that a^(kφ(n)+1) ≡ a mod n for any integer k."
      },
      {
        id: 15,
        question: "What is the multiplicative inverse of 11 mod 26?",
        options: ["7", "13", "19", "It doesn't exist"],
        correctAnswer: 2,
        explanation: "The multiplicative inverse of 11 mod 26 is 19, since 11 × 19 = 209 ≡ 1 mod 26."
      },
      {
        id: 16,
        question: "What is the gcd(60, 25)?",
        options: ["0", "1", "5", "10"],
        correctAnswer: 2,
        explanation: "gcd(60, 25) = 5, since 60 = 2² × 3 × 5 and 25 = 5², so the greatest common divisor is 5."
      },
      {
        id: 17,
        question: "If gcd(a, n) ≠ 1, then:",
        options: ["a has an inverse mod n", "a is a multiple of n", "a has no inverse mod n", "a = n"],
        correctAnswer: 2,
        explanation: "If gcd(a, n) ≠ 1, then a has no multiplicative inverse modulo n."
      },
      {
        id: 18,
        question: "Which method can be used to find multiplicative inverse mod n when n is composite?",
        options: ["Extended Euclidean algorithm", "Prime testing", "Frequency analysis", "Hill cipher"],
        correctAnswer: 0,
        explanation: "The Extended Euclidean algorithm can find multiplicative inverses modulo composite numbers by solving the equation ax + ny = 1."
      },
      {
        id: 19,
        question: "In Z₁₀, which numbers have inverses?",
        options: ["All even numbers", "1, 3, 7, 9", "Only 5", "None"],
        correctAnswer: 1,
        explanation: "In Z₁₀, only numbers coprime to 10 have inverses: 1, 3, 7, 9 (since gcd of each with 10 is 1)."
      },
      {
        id: 20,
        question: "What is the inverse of 23 in Z100?",
        options: ["−13 mod 100", "87", "Both A and B", "None"],
        correctAnswer: 2,
        explanation: "The inverse of 23 in Z100 is both -13 mod 100 = 87 and 87, since 23 × 87 = 2001 ≡ 1 mod 100."
      }
    ],
    10: [ // Assessment ID 10 - Chapter 10: Asymmetric-Key Cryptography
      {
        id: 1,
        question: "Asymmetric-key cryptography is also known as:",
        options: ["Block cipher", "Public-key cryptography", "Stream cipher", "Symmetric encryption"],
        correctAnswer: 1,
        explanation: "Asymmetric-key cryptography is also known as public-key cryptography because it uses a public key and a private key."
      },
      {
        id: 2,
        question: "In asymmetric encryption, which keys are used?",
        options: ["Same key for both operations", "Two identical keys", "One public key and one private key", "Randomly changing keys"],
        correctAnswer: 2,
        explanation: "Asymmetric encryption uses two different keys: a public key for encryption and a private key for decryption."
      },
      {
        id: 3,
        question: "Which operation is easy to compute, but hard to reverse without a secret?",
        options: ["XOR", "Trapdoor one-way function", "Caesar cipher", "Frequency mapping"],
        correctAnswer: 1,
        explanation: "A trapdoor one-way function is easy to compute in one direction but computationally infeasible to reverse without knowing the trapdoor (secret)."
      },
      {
        id: 4,
        question: "Which of the following is a trapdoor one-way function?",
        options: ["XOR cipher", "Hash function", "n = p × q (large primes)", "n = p + q"],
        correctAnswer: 2,
        explanation: "The multiplication of two large prime numbers (n = p × q) is a trapdoor one-way function - easy to multiply, hard to factor without knowing the primes."
      },
      {
        id: 5,
        question: "The discrete logarithm problem appears in:",
        options: ["DES", "Vigenère Cipher", "ElGamal and ECC", "Caesar Cipher"],
        correctAnswer: 2,
        explanation: "The discrete logarithm problem is the foundation for ElGamal cryptosystem and Elliptic Curve Cryptography (ECC)."
      },
      {
        id: 6,
        question: "In RSA, encryption is done using:",
        options: ["Private key", "Hash function", "Public key", "Random key"],
        correctAnswer: 2,
        explanation: "In RSA, encryption is performed using the public key, which can be shared openly."
      },
      {
        id: 7,
        question: "In RSA, what must be true about e and φ(n)?",
        options: ["e must divide φ(n)", "e must equal φ(n)", "e must be relatively prime to φ(n)", "e must be a multiple of φ(n)"],
        correctAnswer: 2,
        explanation: "In RSA, the public exponent e must be relatively prime to φ(n) to ensure that a multiplicative inverse d exists."
      },
      {
        id: 8,
        question: "What is the modulus in RSA key generation?",
        options: ["e × d", "φ(n)", "p × q", "n / 2"],
        correctAnswer: 2,
        explanation: "The modulus n in RSA is the product of two large prime numbers: n = p × q."
      },
      {
        id: 9,
        question: "What is φ(n) if n = p × q?",
        options: ["p × q", "(p − 1) × (q − 1)", "p + q", "n + 1"],
        correctAnswer: 1,
        explanation: "If n = p × q where p and q are prime, then φ(n) = (p - 1) × (q - 1)."
      },
      {
        id: 10,
        question: "In RSA, decryption uses:",
        options: ["The public key", "The modulus only", "The private key d", "Elliptic curves"],
        correctAnswer: 2,
        explanation: "In RSA, decryption is performed using the private key d, which must be kept secret."
      },
      {
        id: 11,
        question: "RSA works under what mathematical assumption?",
        options: ["Finding cube roots is hard", "Discrete log over real numbers", "Factoring large numbers is hard", "Multiplication is slow"],
        correctAnswer: 2,
        explanation: "RSA's security is based on the assumption that factoring large composite numbers into their prime factors is computationally infeasible."
      },
      {
        id: 12,
        question: "What is a potential risk when RSA encrypts short messages?",
        options: ["Brute-force", "Message padding leaks", "Short message attacks", "Key collision"],
        correctAnswer: 2,
        explanation: "Short message attacks can occur when small messages are encrypted without proper padding, making them vulnerable to mathematical analysis."
      },
      {
        id: 13,
        question: "What is OAEP?",
        options: ["A block cipher", "Error correction scheme", "Optimal Asymmetric Encryption Padding", "Elliptic curve hashing"],
        correctAnswer: 2,
        explanation: "OAEP (Optimal Asymmetric Encryption Padding) is a padding scheme used with RSA to prevent various attacks including short message attacks."
      },
      {
        id: 14,
        question: "RSA is not ideal for:",
        options: ["Signing digital certificates", "Long messages", "Secure key exchange", "Encrypting short data"],
        correctAnswer: 1,
        explanation: "RSA is not ideal for encrypting long messages due to computational overhead and size limitations. It's better suited for short data like session keys."
      },
      {
        id: 15,
        question: "The Rabin cryptosystem decryption gives:",
        options: ["A single plaintext", "Encrypted output only", "Four possible plaintexts", "No output"],
        correctAnswer: 2,
        explanation: "The Rabin cryptosystem decryption can produce four possible plaintexts due to the quadratic nature of the encryption function."
      },
      {
        id: 16,
        question: "In the Rabin cryptosystem, encryption uses:",
        options: ["C = P³ mod n", "C = P² mod n", "C = P × Q mod n", "C = E(P) + φ(n)"],
        correctAnswer: 1,
        explanation: "In the Rabin cryptosystem, encryption is performed using the formula C = P² mod n, where P is the plaintext and n is the modulus."
      },
      {
        id: 17,
        question: "Which cryptosystem is based on discrete logarithms?",
        options: ["DES", "RSA", "ElGamal", "Rabin"],
        correctAnswer: 2,
        explanation: "The ElGamal cryptosystem is based on the discrete logarithm problem, where the difficulty of computing discrete logarithms provides security."
      },
      {
        id: 18,
        question: "Which cryptosystem provides strong security with smaller key sizes?",
        options: ["RSA", "ECC", "Rabin", "Caesar"],
        correctAnswer: 1,
        explanation: "Elliptic Curve Cryptography (ECC) provides equivalent security to RSA with much smaller key sizes, making it more efficient."
      },
      {
        id: 19,
        question: "ECC's security is based on:",
        options: ["Integer factoring", "Elliptic curve multiplication", "Permutation tables", "One-time pads"],
        correctAnswer: 1,
        explanation: "ECC's security is based on the difficulty of the elliptic curve discrete logarithm problem, which involves elliptic curve multiplication."
      },
      {
        id: 20,
        question: "Which of the following shows equivalent key sizes for same security?",
        options: ["RSA 1024 ≈ ECC 80", "RSA 512 ≈ ECC 256", "RSA 2048 ≈ ECC 224", "RSA 7680 ≈ ECC 128"],
        correctAnswer: 2,
        explanation: "RSA 2048-bit keys provide approximately the same security level as ECC 224-bit keys, demonstrating ECC's efficiency advantage."
      }
    ],
    11: [ // Assessment ID 11 - Chapter 11: Message Integrity and Message Authentication
      {
        id: 1,
        question: "What does a cryptographic hash function provide?",
        options: ["Confidentiality", "Integrity", "Authentication", "Encryption"],
        correctAnswer: 1,
        explanation: "A cryptographic hash function provides integrity by creating a fixed-size digest that changes if the message is modified."
      },
      {
        id: 2,
        question: "What is the digital equivalent of a document with a fingerprint?",
        options: ["Encrypted message", "Signed letter", "Message and message digest", "Public key and private key"],
        correctAnswer: 2,
        explanation: "A message and its message digest (hash) is the digital equivalent of a document with a fingerprint, providing a unique identifier for the message."
      },
      {
        id: 3,
        question: "The message digest must be:",
        options: ["Longer than the message", "Kept secret", "Unchangeable", "Equal in size to the message"],
        correctAnswer: 2,
        explanation: "The message digest must be unchangeable - any modification to the message should result in a different digest."
      },
      {
        id: 4,
        question: "A message digest is created using:",
        options: ["Symmetric encryption", "Hash functions", "RSA", "Digital signature"],
        correctAnswer: 1,
        explanation: "A message digest is created using hash functions, which take variable-length input and produce a fixed-length output."
      },
      {
        id: 5,
        question: "What is the main use of a message digest?",
        options: ["Data compression", "Ensuring secrecy", "Verifying message integrity", "Key generation"],
        correctAnswer: 2,
        explanation: "The main use of a message digest is to verify message integrity by detecting any changes to the original message."
      },
      {
        id: 6,
        question: "Which of the following is a property of a cryptographic hash function?",
        options: ["Preimage resistance", "Random output", "Compression", "Decryption"],
        correctAnswer: 0,
        explanation: "Preimage resistance is a fundamental property of cryptographic hash functions, making it computationally infeasible to find the original input from the hash."
      },
      {
        id: 7,
        question: "What does preimage resistance mean?",
        options: ["It is hard to find two messages with the same hash", "It is hard to find the message from a given hash", "The hash is longer than the message", "The output is always random"],
        correctAnswer: 1,
        explanation: "Preimage resistance means it is computationally infeasible to find the original message given only the hash value."
      },
      {
        id: 8,
        question: "Second preimage resistance ensures:",
        options: ["Same input → same output", "It is hard to find a different input with the same hash", "Easy encryption", "Output size equals input size"],
        correctAnswer: 1,
        explanation: "Second preimage resistance ensures it is computationally infeasible to find a different message that produces the same hash as a given message."
      },
      {
        id: 9,
        question: "Collision resistance means:",
        options: ["Hashes are short", "Message can be recovered", "Two different inputs produce the same output is very unlikely", "Every input has a unique hash"],
        correctAnswer: 2,
        explanation: "Collision resistance means it is computationally infeasible to find any two different inputs that produce the same hash output."
      },
      {
        id: 10,
        question: "Why can't we use checksum as a secure hash function?",
        options: ["It is too slow", "It lacks preimage resistance", "It is encrypted", "It is too complex"],
        correctAnswer: 1,
        explanation: "Checksums lack preimage resistance - it is easy to find inputs that produce a given checksum, making them unsuitable for cryptographic purposes."
      },
      {
        id: 11,
        question: "What is MDC?",
        options: ["Message Digest Code", "Message Detection Channel", "Modification Detection Code", "Modular Digest Calculation"],
        correctAnswer: 2,
        explanation: "MDC stands for Modification Detection Code, which is used to detect unauthorized changes to a message."
      },
      {
        id: 12,
        question: "What does MDC detect?",
        options: ["Sender identity", "Message length", "Message modification", "Message order"],
        correctAnswer: 2,
        explanation: "MDC (Modification Detection Code) detects message modification by creating a hash that changes if the message is altered."
      },
      {
        id: 13,
        question: "What is MAC used for?",
        options: ["Encrypting messages", "Ensuring confidentiality", "Message authentication", "Data compression"],
        correctAnswer: 2,
        explanation: "MAC (Message Authentication Code) is used for message authentication, providing both integrity and authenticity verification."
      },
      {
        id: 14,
        question: "How is a MAC different from an MDC?",
        options: ["MAC only checks integrity", "MAC provides authentication", "MAC is not based on hash", "MAC uses public keys"],
        correctAnswer: 1,
        explanation: "MAC provides authentication (verifying the sender) in addition to integrity, while MDC only provides integrity checking."
      },
      {
        id: 15,
        question: "What is required to verify a MAC?",
        options: ["Public key", "Secret shared key", "Checksum", "Timestamp"],
        correctAnswer: 1,
        explanation: "To verify a MAC, both the sender and receiver must share the same secret key used to create the MAC."
      },
      {
        id: 16,
        question: "What does HMAC stand for?",
        options: ["Hashed MAC", "Hidden MAC", "Hash-based Message Authentication Code", "Hybrid MAC"],
        correctAnswer: 2,
        explanation: "HMAC stands for Hash-based Message Authentication Code, which uses a cryptographic hash function to create a MAC."
      },
      {
        id: 17,
        question: "The security of HMAC depends on:",
        options: ["Message size", "Shared secret", "Underlying hash function", "Signature scheme"],
        correctAnswer: 2,
        explanation: "The security of HMAC depends on the underlying hash function and the shared secret key."
      },
      {
        id: 18,
        question: "Which is a real-world implementation of MAC?",
        options: ["MD5", "HMAC", "Diffie-Hellman", "SHA-1"],
        correctAnswer: 1,
        explanation: "HMAC is a real-world implementation of MAC that combines a hash function with a secret key."
      },
      {
        id: 19,
        question: "What is the purpose of CMAC?",
        options: ["Encryption", "Message authentication using block ciphers", "Digital signatures", "Compression"],
        correctAnswer: 1,
        explanation: "CMAC (Cipher-based MAC) is used for message authentication using block ciphers like AES."
      },
      {
        id: 20,
        question: "What happens if the MAC and recomputed MAC do not match?",
        options: ["Message is valid", "Sender is verified", "Message has been modified", "Message is encrypted"],
        correctAnswer: 2,
        explanation: "If the MAC and recomputed MAC do not match, it indicates that the message has been modified during transmission."
      }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.assessmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAssessment();
    this.initializeQuestions();
  }

  loadAssessment(): void {
    this.studentService.getVisibleAssessments().subscribe({
      next: (assessments) => {
        this.assessment = assessments.find(a => a.assessmentId === this.assessmentId) || null;
        if (!this.assessment) {
          this.router.navigate(['/student-dashboard']);
        }
      },
      error: (error) => {
        console.error('Error loading assessment:', error);
        this.router.navigate(['/student-dashboard']);
      }
    });
  }

  initializeQuestions(): void {
    const questions = this.questionBank[this.assessmentId] || [];
    if (questions.length === 0) {
      console.error('No questions found for this assessment');
      return;
    }

    // Randomly select 10 questions from the available questions
    this.selectedQuestions = this.getRandomQuestions(questions, 10);
    this.userAnswers = new Array(this.selectedQuestions.length).fill(null);
    
    // Set timer for 30 minutes (1800 seconds)
    this.timeRemaining = 1800;
    this.startTimer();
  }

  getRandomQuestions(questions: Question[], count: number): Question[] {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, questions.length));
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.submitAssessment();
      }
    }, 1000);
  }

  selectAnswer(answerIndex: number): void {
    if (!this.isSubmitted) {
      this.userAnswers[this.currentQuestionIndex] = answerIndex;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.selectedQuestions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  submitAssessment(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.isSubmitted = true;
    this.calculateScore();
    
    // Submit results to backend
    this.studentService.submitResult(this.assessmentId, this.score).subscribe({
      next: (response) => {
        console.log('Result submitted successfully:', response);
        this.showResults = true;
      },
      error: (error) => {
        console.error('Error submitting result:', error);
        // Still show results even if submission fails
        this.showResults = true;
      }
    });
  }

  calculateScore(): void {
    let correct = 0;
    for (let i = 0; i < this.selectedQuestions.length; i++) {
      if (this.userAnswers[i] === this.selectedQuestions[i].correctAnswer) {
        correct++;
      }
    }
    this.score = Math.round((correct / this.selectedQuestions.length) * 100);
  }

  getTimeFormatted(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  isAnswered(questionIndex: number): boolean {
    return this.userAnswers[questionIndex] !== null;
  }

  getScoreColor(): string {
    if (this.score >= 80) return 'text-green-600';
    if (this.score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  retakeAssessment(): void {
    this.currentQuestionIndex = 0;
    this.isSubmitted = false;
    this.showResults = false;
    this.score = 0;
    this.initializeQuestions();
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
} 