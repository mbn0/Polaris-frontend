import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesToolComponent } from './des-tool.component';

describe('DesToolComponent', () => {
  let component: DesToolComponent;
  let fixture: ComponentFixture<DesToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
