import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeCategoriesComponent } from './see-categories.component';

describe('SeeCategoriesComponent', () => {
  let component: SeeCategoriesComponent;
  let fixture: ComponentFixture<SeeCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeeCategoriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeeCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
