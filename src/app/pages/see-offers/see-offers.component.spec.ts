import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeOffersComponent } from './see-offers.component';

describe('SeeOffersComponent', () => {
  let component: SeeOffersComponent;
  let fixture: ComponentFixture<SeeOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeeOffersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeeOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
