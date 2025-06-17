import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chapter3Component } from './chapter3.component';

describe('Chapter3Component', () => {
  let component: Chapter3Component;
  let fixture: ComponentFixture<Chapter3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chapter3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chapter3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
