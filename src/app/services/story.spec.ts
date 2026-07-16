import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { StoryService } from './story';
import { ApiKeyService } from './api-key';

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
  let apiKeyService: ApiKeyService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoryService);
    apiKeyService = TestBed.inject(ApiKeyService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
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
    it('remove fencing', async () => {
      const reponse = '```\n' + JSON.stringify({ sceneText: 'Scene1', choices: [] }) + '\n```';
      vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse({ content: [{ type: 'text', text: reponse }] })
      );
      await service.startStory('Matt', 'fake-key');

      expect(service.currentScene()).toBe('Scene1');
    });

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

  describe('image generation', () => {
    it('calls the OpenAI image endpoint when has imagePrompt OpenAI key', async () => {
      apiKeyService.setOpenAiKey('fake-key');

      const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation(((url: RequestInfo | URL) => {
        const urlStr = url.toString();
        if (urlStr.includes('anthropic.com')) {
          return Promise.resolve(jsonResponse(claudeApiBody({ sceneText: 'Scene', choices: [], imagePrompt: 'forest with grass' })));
        }
        if (urlStr.includes('openai.com')) {
          return Promise.resolve(jsonResponse({ data: [{ b64_json: 'Zm9yZXN0IHdpdGggZ3Jhc3M=' }] }));
        }
        return Promise.reject(new Error('unexpected url: ' + urlStr));
      }) as any);

      await service.startStory('Matt', 'fake-key');

      const openAiCall = fetchSpy.mock.calls.find(args => args[0].toString().includes('openai.com'));
      expect(openAiCall).toBeDefined();
      expect(service.history()[0].imageUrl).toBe('data:image/png;base64,Zm9yZXN0IHdpdGggZ3Jhc3M=');
    });
  });

  it('doesn\'t call image endpoint when missing key', async () => {
      const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse(claudeApiBody({ sceneText: 'Scene', choices: [], imagePrompt: 'forest with grass' }))
      );

      await service.startStory('Matt', 'fake-key');

      expect(fetchSpy.mock.calls.length).toBe(1);
      expect(service.history()[0].imageUrl).toBe('');
    });

  describe('regenerateImages on load', () => {
    it('regenerate images with a prompt, and no image', async () => {
      service.history.set([
        { sceneText: 'Scene 1', imageUrl: 'data:image/png;base64,Zm9yZXN0IHdpdGggZ3Jhc3M=', choiceMade: '', imagePrompt: 'prompt1' },
        { sceneText: 'Scene 2', imageUrl: '', choiceMade: '', imagePrompt: 'prompt2' },
        { sceneText: 'Scene 3', imageUrl: '', choiceMade: '', imagePrompt: '' }
      ]);

      const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
        jsonResponse({ data: [{ b64_json: 'Zm9yZXN0IHdpdGggZ3Jhc3MgMg==' }] })
      );

      await service.regenerateImages('fake-key');

      expect(fetchSpy.mock.calls.length).toBe(1);
      expect(service.history()[0].imageUrl).toBe('data:image/png;base64,Zm9yZXN0IHdpdGggZ3Jhc3M=');
      expect(service.history()[1].imageUrl).toBe('data:image/png;base64,Zm9yZXN0IHdpdGggZ3Jhc3MgMg==');
      expect(service.history()[2].imageUrl).toBe('');
    });

    it('ignores when no history', async () => {
      service.history.set([]);
      const fetchSpy = vi.spyOn(window, 'fetch');
      await service.regenerateImages('fake-key');
      expect(fetchSpy.mock.calls.length).toBe(0);
    });
  });
});
