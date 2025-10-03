import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  fromModel: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = environment.apiUrl.replace(/\/$/, '') + '/api/chat';

  constructor(private http: HttpClient) {}

  ask(question: string): Observable<ChatResponse> {
    const body: ChatRequest = { question };
    return this.http.post<ChatResponse>(`${this.baseUrl}/ask`, body);
  }
}
