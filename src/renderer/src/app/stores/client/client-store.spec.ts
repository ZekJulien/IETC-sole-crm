import { TestBed } from '@angular/core/testing';

import { ClientStore } from './client-store';

describe('ClientStore', () => {
  let service: ClientStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
