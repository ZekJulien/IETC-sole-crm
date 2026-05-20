import { TestBed } from '@angular/core/testing';

import { CompanyStore } from './company-store';

describe('CompanyStore', () => {
  let service: CompanyStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
