import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesMiPedidoComponent } from './detalles-mi-pedido.component';

describe('DetallesMiPedidoComponent', () => {
  let component: DetallesMiPedidoComponent;
  let fixture: ComponentFixture<DetallesMiPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetallesMiPedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesMiPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
