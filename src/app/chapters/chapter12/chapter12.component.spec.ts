import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chapter12Component } from './chapter12.component';

describe('Chapter12Component', () => {
  let component: Chapter12Component;
  let fixture: ComponentFixture<Chapter12Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chapter12Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chapter12Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
