import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { DarkMode } from './dark-mode';

describe('DarkMode', () => {
  let service: DarkMode;
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DarkMode);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
