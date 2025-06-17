import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chapter5Component } from './chapter5.component';

describe('Chapter5Component', () => {
  let component: Chapter5Component;
  let fixture: ComponentFixture<Chapter5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chapter5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chapter5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
