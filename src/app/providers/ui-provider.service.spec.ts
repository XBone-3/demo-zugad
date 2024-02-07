import { TestBed } from '@angular/core/testing';

import { UiProviderService } from './ui-provider.service';

describe('UiProviderService', () => {
  let service: UiProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
