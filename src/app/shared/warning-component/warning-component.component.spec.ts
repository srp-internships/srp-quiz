import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningComponent } from './warning-component.component';

describe('WarningComponentComponent', () => {
  let component: WarningComponent;
  let fixture: ComponentFixture<WarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
