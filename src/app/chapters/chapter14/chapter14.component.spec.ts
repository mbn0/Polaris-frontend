import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chapter14Component } from './chapter14.component';

describe('Chapter14Component', () => {
  let component: Chapter14Component;
  let fixture: ComponentFixture<Chapter14Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chapter14Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chapter14Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
