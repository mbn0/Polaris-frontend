import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

interface Chapter {
  id: number;
  title: string;
  description: string;
  icon: string;
  isAvailable: boolean;
  estimatedTime: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  currentUser: any = null;

  chapters: Chapter[] = [
    {
      id: 1,
      title: 'Introduction',
      description: 'Fundamentals of cryptography and its historical context',
      icon: '🔐',
      isAvailable: true,
      estimatedTime: '2 hours'
    },
    {
      id: 2,
      title: 'Traditional Symmetric-Key Ciphers',
      description: 'Classical encryption methods and their analysis',
      icon: '🗝️',
      isAvailable: true,
      estimatedTime: '3 hours'
    },
    {
      id: 3,
      title: 'Introduction to Modern Symmetric-key Ciphers',
      description: 'Evolution from classical to modern symmetric encryption',
      icon: '🔄',
      isAvailable: true,
      estimatedTime: '3 hours'
    },
    {
      id: 4,
      title: 'Advanced Encryption Standard (AES)',
      description: 'In-depth study of the AES algorithm',
      icon: '🛡️',
      isAvailable: true,
      estimatedTime: '4 hours'
    },
    {
      id: 5,
      title: 'Encipherment Using Modern Symmetric Key Cryptography',
      description: 'Practical applications of symmetric encryption',
      icon: '🔒',
      isAvailable: true,
      estimatedTime: '3 hours'
    },
    {
      id: 6,
      title: 'Mathematics of Asymmetric-Key Cryptography',
      description: 'Mathematical foundations for public-key cryptography',
      icon: '📊',
      isAvailable: true,
      estimatedTime: '4 hours'
    },
    {
      id: 7,
      title: 'Asymmetric-Key Cryptography',
      description: 'Public-key cryptographic systems and algorithms',
      icon: '🔑',
      isAvailable: true,
      estimatedTime: '4 hours'
    },
    {
      id: 8,
      title: 'Message Integrity and Message Authentication',
      description: 'Ensuring data integrity and authenticity',
      icon: '✅',
      isAvailable: true,
      estimatedTime: '3 hours'
    },
    {
      id: 9,
      title: 'Cryptographic Hash Function',
      description: 'Hash functions and their cryptographic properties',
      icon: '#️⃣',
      isAvailable: true,
      estimatedTime: '3 hours'
    },
    {
      id: 10,
      title: 'Digital Signature',
      description: 'Digital signature schemes and applications',
      icon: '✍️',
      isAvailable: true,
      estimatedTime: '3 hours'
    },
    {
      id: 11,
      title: 'Entity Authentication',
      description: 'Authentication protocols and mechanisms',
      icon: '🆔',
      isAvailable: true,
      estimatedTime: '3 hours'
    },
    {
      id: 12,
      title: 'Key Management',
      description: 'Key distribution and management protocols',
      icon: '🗃️',
      isAvailable: true,
      estimatedTime: '3 hours'
    },
    {
      id: 13,
      title: 'Introduction to Homomorphic Cryptography',
      description: 'Advanced topic: Computing on encrypted data',
      icon: '🧮',
      isAvailable: true,
      estimatedTime: '4 hours'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onChapterClick(chapter: Chapter) {
    if (chapter.isAvailable) {
      // Navigate to chapter page (will be implemented later)
      console.log(`Navigating to chapter ${chapter.id}: ${chapter.title}`);
      // this.router.navigate(['/chapter', chapter.id]);
    }
  }
}
