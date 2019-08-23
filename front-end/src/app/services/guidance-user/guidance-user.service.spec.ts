import { TestBed } from '@angular/core/testing';

import { GuidanceUserService } from './guidance-user.service';

describe('GuidanceUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GuidanceUserService = TestBed.get(GuidanceUserService);
    expect(service).toBeTruthy();
  });
});
