import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeProductsByCategoryComponent } from './see-products-by-category.component';

describe('SeeProductsByCategoryComponent', () => {
  let component: SeeProductsByCategoryComponent;
  let fixture: ComponentFixture<SeeProductsByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeeProductsByCategoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeeProductsByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
