import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface LearningOutcome {
  id: number;
  text: string;
  completed: boolean;
}

interface SecurityService {
  term: string;
  definition: string;
}

interface AttackType {
  name: string;
  description: string;
  category: 'passive' | 'active';
}

@Component({
  selector: 'app-chapter1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chapter1.component.html',
  styleUrls: ['./chapter1.component.css']
})
export class Chapter1Component implements OnInit {
  currentSection = 1;
  totalSections = 14;

  learningOutcomes: LearningOutcome[] = [
    { id: 1, text: 'Illustrate fundamental concepts in cryptography.', completed: false },
    { id: 2, text: 'Perform encryption and decryption processes using appropriate theory.', completed: false },
    { id: 3, text: 'Differentiate cryptographic techniques and their typical applications.', completed: false },
    { id: 4, text: 'Recommend current tools, methodologies, and trends for data security.', completed: false },
    { id: 5, text: 'Formulate data-security strategies leveraging state-of-the-art cryptography.', completed: false }
  ];

  securityServices: SecurityService[] = [
    { term: 'Confidentiality / Privacy', definition: 'Keeping information secret from all but authorized parties.' },
    { term: 'Data Integrity', definition: 'Ensuring data hasn\'t been altered by unauthorized or unknown means.' },
    { term: 'Authentication', definition: 'Verifying the identity of an entity (person, machine, software).' },
    { term: 'Message Authentication', definition: 'Corroborating the origin of information (data-origin authentication).' },
    { term: 'Non-Repudiation', definition: 'Preventing entities from denying prior commitments or actions.' },
    { term: 'Authorization & Access Control', definition: 'Granting or restricting permissions to resources.' },
    { term: 'Certification & Timestamping', definition: 'Certification: Endorsement by a trusted authority. Timestamping: Recording when information was created to prevent later denial.' },
    { term: 'Availability', definition: 'Ensuring legitimate users can access resources when needed.' }
  ];

  attackTypes: AttackType[] = [
    { name: 'Information Leakage', description: 'Unauthorized disclosure of sensitive information', category: 'passive' },
    { name: 'Integrity Violation', description: 'Unauthorized modification of data', category: 'active' },
    { name: 'Masquerading (Impersonation)', description: 'Pretending to be someone else', category: 'active' },
    { name: 'Denial of Service', description: 'Making resources unavailable to legitimate users', category: 'active' },
    { name: 'Illegitimate Use / Insider Attacks', description: 'Misuse of authorized access', category: 'active' },
    { name: 'Malware & Backdoors/Trojans', description: 'Malicious software and hidden access points', category: 'active' }
  ];

  // Caesar Cipher Activity
  caesarPlaintext = 'RASHIDAH';
  caesarKey = 5;
  caesarResult = '';
  userCaesarResult = '';
  showCaesarSolution = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.calculateCaesarCipher();
  }

  toggleLearningOutcome(id: number) {
    const outcome = this.learningOutcomes.find(o => o.id === id);
    if (outcome) {
      outcome.completed = !outcome.completed;
    }
  }

  calculateCaesarCipher() {
    let result = '';
    for (let char of this.caesarPlaintext) {
      if (char >= 'A' && char <= 'Z') {
        result += String.fromCharCode(((char.charCodeAt(0) - 65 + this.caesarKey) % 26) + 65);
      } else {
        result += char;
      }
    }
    this.caesarResult = result;
  }

  checkCaesarAnswer() {
    this.showCaesarSolution = true;
  }

  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.currentSection++;
    }
  }

  previousSection() {
    if (this.currentSection > 1) {
      this.currentSection--;
    }
  }

  goToSection(section: number) {
    this.currentSection = section;
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
