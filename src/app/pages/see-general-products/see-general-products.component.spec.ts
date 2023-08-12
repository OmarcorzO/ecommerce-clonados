import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeGeneralProductsComponent } from './see-general-products.component';

describe('SeeGeneralProductsComponent', () => {
  let component: SeeGeneralProductsComponent;
  let fixture: ComponentFixture<SeeGeneralProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeeGeneralProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeeGeneralProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
