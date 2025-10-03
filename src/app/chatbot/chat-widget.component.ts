import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../core/services/chat/chat.service';

interface Message { role: 'user' | 'assistant'; text: string }

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent {
  open = false;
  loading = false;
  input = '';
  messages = signal<Message[]>([
    { role: 'assistant', text: 'Hi! I can help with cryptography topics like AES, RSA, hashes, MACs, signatures, key exchange, and authentication. I will decline non-crypto questions.' }
  ]);

  constructor(private chat: ChatService) {}

  toggle() { this.open = !this.open; }

  send() {
    const q = this.input.trim();
    if (!q || this.loading) return;
    this.messages.update(arr => [...arr, { role: 'user', text: q }]);
    this.input = '';
    this.loading = true;
    this.chat.ask(q).subscribe({
      next: (res) => {
        const text = (res?.answer || '').trim() || 'Sorry, I can only answer cryptography questions.';
        this.messages.update(arr => [...arr, { role: 'assistant', text }]);
      },
      error: () => {
        this.messages.update(arr => [...arr, { role: 'assistant', text: 'Sorry, the chat service is unavailable right now.' }]);
      },
      complete: () => this.loading = false
    });
  }
}
