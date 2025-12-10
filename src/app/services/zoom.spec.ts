import { TestBed } from '@angular/core/testing';

import { Zoom } from './zoom';

describe('Zoom', () => {
  let service: Zoom;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Zoom);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
