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

  it('service should be blank', () => {
    expect(service.history()).toEqual([]);
    expect(service.currentChoices()).toEqual([]);
    expect(service.characterRegistry).toEqual({});
    expect(service.conversationHistory).toEqual([]);
  });

  describe('startStory', () => {
    it('initial message', async () => {
      const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse(claudeApiBody({ sceneText: 'Scene', choices: [] }))
      );
      await service.startStory('Matt', 'fake-key');

      const [, options] = fetchSpy.mock.lastCall!;
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.messages[0].content).toContain('Matt');
    });

    it('isLoading false when resolved', async () => {
      vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse(claudeApiBody({ sceneText: 'Scene', choices: [] }))
      );

      await service.startStory('Matt', 'fake-key');

      expect(service.isLoading()).toBe(false);
    });
  });

  describe('makeChoice', () => {
    it('write choice to history', async () => {
      service.history.set([
        { sceneText: 'Scene1', imageUrl: '', choiceMade: '', imagePrompt: '' },
      ]);
      service.currentCardIndex.set(0);

      vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse(claudeApiBody({ sceneText: 'Scene2', choices: [] }))
      );

      await service.makeChoice('Attack the goblin', 'fake-key');

      expect(service.history()[0].choiceMade).toBe('Attack the goblin');
    });

    it('sends choice and adds new card', async () => {
      service.history.set([{ sceneText: 'Scene1', imageUrl: '', choiceMade: '', imagePrompt: '' }]);
      service.currentCardIndex.set(0);

      const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse(claudeApiBody({ sceneText: 'Scene2', choices: [] }))
      ); 

      await service.makeChoice('Hide', 'fake-key');

      const [, options] = fetchSpy.mock.lastCall!;
      const body = JSON.parse((options as RequestInit).body as string);
      expect(body.messages[body.messages.length - 1].content).toBe('Player chose: Hide');
      expect(service.history().length).toBe(2);
      expect(service.history()[1].sceneText).toBe('Scene2');
      expect(service.currentCardIndex()).toBe(1);
    });
  });  

  describe('claude response parsing', () => {
    it('remove fencing'), async () => {
      const reponse = '```\n' + JSON.stringify({ sceneText: 'Scene1', choices: [] }) + '\n```';
      vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse({ content: [{ type: 'text', text: reponse }] })
      );
      await service.startStory('Matt', 'fake-key');

      expect(service.currentScene()).toBe('Scene1');
    }

    it('detects a status update', async () => {
      const statsUpdate = { healthChange: -10, xpGain: 20 };
      vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse(claudeApiBody({ sceneText: 'Scene', choices: [], statsUpdate }))
      );

      await service.startStory('Aria', 'fake-key');

      expect(service.pendingStatsUpdate()).toEqual(statsUpdate);
    });

    it('detects new item pick up', async () => {
      const itemGain = {
        id: 'sword-1', name: 'Rusty Sword', description: '', slot: 'mainHand' as const,
        bonus: { attackMinBonus: 1 },
      };
      vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse(claudeApiBody({ sceneText: 'Scene', choices: [], itemGain }))
      );

      await service.startStory('Matt', 'fake-key');

      expect(service.pendingItemGain()).toEqual(itemGain);
    });

    it('detects and stores image prompt', async () => {
      vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse(claudeApiBody({ sceneText: 'Scene', choices: [], imagePrompt: 'forest with grass' }))
      );

      await service.startStory('Matt', 'fake-key');

      expect(service.history()[0].imagePrompt).toBe('forest with grass');
    });
  });
});
