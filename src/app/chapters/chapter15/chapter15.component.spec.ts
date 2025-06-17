import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chapter15Component } from './chapter15.component';

describe('Chapter15Component', () => {
  let component: Chapter15Component;
  let fixture: ComponentFixture<Chapter15Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chapter15Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chapter15Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
