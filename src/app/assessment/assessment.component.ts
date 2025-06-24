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