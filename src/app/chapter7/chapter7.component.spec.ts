import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chapter7Component } from './chapter7.component';

describe('Chapter7Component', () => {
  let component: Chapter7Component;
  let fixture: ComponentFixture<Chapter7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chapter7Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chapter7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
