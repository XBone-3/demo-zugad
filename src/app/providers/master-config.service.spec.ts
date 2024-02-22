import { TestBed } from '@angular/core/testing';

import { MasterConfigService } from './master-config.service';

describe('MasterConfigService', () => {
  let service: MasterConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
