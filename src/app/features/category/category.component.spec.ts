import { ComponentFixture, TestBed } from '@angular/core/testing';

import { categoryComponent } from './category.component';

describe('DashboardPageComponent', () => {
  let component: categoryComponent;
  let fixture: ComponentFixture<categoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [categoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(categoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
