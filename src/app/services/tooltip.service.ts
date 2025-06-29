import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  private tooltipStateSubject = new BehaviorSubject<boolean>(true);
  public tooltipState$ = this.tooltipStateSubject.asObservable();

  constructor() {
    // Initialize from localStorage
    const savedState = localStorage.getItem('tooltip-global-state');
    if (savedState !== null) {
      this.tooltipStateSubject.next(JSON.parse(savedState));
    }
  }

  setTooltipState(show: boolean): void {
    this.tooltipStateSubject.next(show);
    localStorage.setItem('tooltip-global-state', JSON.stringify(show));
  }

  getTooltipState(): boolean {
    return this.tooltipStateSubject.value;
  }
} 