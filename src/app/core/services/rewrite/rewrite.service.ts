import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RewriteRequest {
  text: string;
  mode?: 'simplify' | 'eli5' | 'deepen' | 'concise' | 'analogies' | string;
  instruction?: string;
  preserveStructure?: boolean;
}

export interface RewriteResponse {
  rewritten: string;
  fromModel: boolean;
}

@Injectable({ providedIn: 'root' })
export class RewriteService {
  private baseUrl = environment.apiUrl.replace(/\/$/, '') + '/api/chat';

  constructor(private http: HttpClient) {}

  rewrite(body: RewriteRequest): Observable<RewriteResponse> {
    const payload: RewriteRequest = { preserveStructure: true, ...body };
    return this.http.post<RewriteResponse>(`${this.baseUrl}/rewrite`, payload);
  }
}
