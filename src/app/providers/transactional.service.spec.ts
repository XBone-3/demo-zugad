import { TestBed } from '@angular/core/testing';

import { TransactionalService } from './transactional.service';

describe('TransactionalService', () => {
  let service: TransactionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
