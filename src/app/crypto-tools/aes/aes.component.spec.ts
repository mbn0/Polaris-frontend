import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AESComponent } from './aes.component';

describe('AESComponent', () => {
  let component: AESComponent;
  let fixture: ComponentFixture<AESComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AESComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AESComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
