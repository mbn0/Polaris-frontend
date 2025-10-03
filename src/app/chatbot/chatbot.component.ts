import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../core/services/chat/chat.service';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  input = '';
  loading = false;
  messages = signal<Message[]>([
    { role: 'assistant', text: 'Hi! Ask me anything about cryptography (AES, RSA, hashes, MACs, signatures, key exchange, authentication, etc.). I will decline non-crypto questions.' }
  ]);

  constructor(private chat: ChatService) {}

  send() {
    const q = this.input.trim();
    if (!q || this.loading) return;
    this.messages.update(arr => [...arr, { role: 'user', text: q }]);
    this.input = '';
    this.loading = true;
    this.chat.ask(q).subscribe({
      next: (res) => {
        const text = (res?.answer || '').trim();
        this.messages.update(arr => [...arr, { role: 'assistant', text }]);
      },
      error: () => {
        this.messages.update(arr => [...arr, { role: 'assistant', text: 'Sorry, the chat service is unavailable right now.' }]);
      },
      complete: () => this.loading = false
    });
  }
}
