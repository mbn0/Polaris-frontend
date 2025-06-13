import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chapter10Component } from './chapter10.component';

describe('Chapter10Component', () => {
  let component: Chapter10Component;
  let fixture: ComponentFixture<Chapter10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chapter10Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chapter10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
