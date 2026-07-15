import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { StoryService } from './story';

// Builds a fake response with only the fields we call
function jsonResponse(body: any, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

// Wraps the payload in claude format
function claudeApiBody(scenePayload: any) {
  return { content: [{ type: 'text', text: JSON.stringify(scenePayload) }] };
}

describe('StoryService', () => {
  let service: StoryService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoryService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('start blank', () => {
    expect(service.history()).toEqual([]);
    expect(service.currentChoices()).toEqual([]);
    expect(service.characterRegistry).toEqual({});
    expect(service.conversationHistory).toEqual([]);
  });
});
