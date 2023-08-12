import { TestBed } from '@angular/core/testing';

import { ListAdministratorService } from './list-administrator.service';

describe('ListAdministratorService', () => {
  let service: ListAdministratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListAdministratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
