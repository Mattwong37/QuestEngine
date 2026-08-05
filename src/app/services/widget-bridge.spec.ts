import { TestBed } from '@angular/core/testing';

import { WidgetBridge } from './widget-bridge';

describe('WidgetBridge', () => {
  let service: WidgetBridge;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WidgetBridge);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
