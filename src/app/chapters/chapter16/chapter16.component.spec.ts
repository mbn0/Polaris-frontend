import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chapter16Component } from './chapter16.component';

describe('Chapter16Component', () => {
  let component: Chapter16Component;
  let fixture: ComponentFixture<Chapter16Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chapter16Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chapter16Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
