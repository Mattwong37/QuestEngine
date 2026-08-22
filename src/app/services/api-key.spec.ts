// @vitest-environment jsdom
import { ApiKeyService } from './api-key';
import { StorageService } from './storage';
import { TestBed } from '@angular/core/testing';

class FakeStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null { return this.map.get(key) ?? null; }
  setItem(key: string, value: string): void { this.map.set(key, value); }
  removeItem(key: string): void { this.map.delete(key); }
}

describe('ApiKeyService', () => {
  let storage: FakeStorage;

  function makeService(): ApiKeyService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storage }]
    });
    return TestBed.inject(ApiKeyService);
  }

  beforeEach(() => {
    storage = new FakeStorage();
  });

  describe('initial state', () => {
    it('keys blank on start', () => {
      const service = makeService();

      expect(service.anthropicKey()).toBe('');
      expect(service.openAiKey()).toBe('');
    });
  });

  describe('key modification checks', () => {
    it('initial set keys and makes sure local storage is updated', () => {
      storage.setItem('anthropic_key', 'sk-ant-1');
      storage.setItem('openai_key', 'sk-oa-1');

      const service = makeService();

      expect(service.anthropicKey()).toBe('sk-ant-1');
      expect(service.openAiKey()).toBe('sk-oa-1');
      expect(storage.getItem('anthropic_key')).toBe('sk-ant-1');
      expect(storage.getItem('openai_key')).toBe('sk-oa-1');
    });

    it('overwrite keys', () => {
      storage.setItem('anthropic_key', 'sk-ant-1');
      storage.setItem('openai_key', 'sk-oa-1');

      const service = makeService();

      expect(service.anthropicKey()).toBe('sk-ant-1');
      expect(storage.getItem('anthropic_key')).toBe('sk-ant-1');

      expect(service.openAiKey()).toBe('sk-oa-1');
      expect(storage.getItem('openai_key')).toBe('sk-oa-1');
    });

    it('remove anthropic key', () => {
      const service = makeService();
      service.setAnthropicKey('sk-ant-1');
      service.setAnthropicKey('');

      expect(service.anthropicKey()).toBe('');
      expect(storage.getItem('anthropic_key')).toBe('');
    });

    it('remove openai key', () => {
      const service = makeService();
      service.setOpenAiKey('sk-oa-1');
      service.setOpenAiKey('');

      expect(service.openAiKey()).toBe('');
      expect(storage.getItem('openai_key')).toBe('');
    });

    it('key updates are exclusive', () => {
      const service = makeService();
      service.setOpenAiKey('sk-oa-1');

      expect(service.anthropicKey()).toBe('');

      expect(service.openAiKey()).toBe('sk-oa-1');
      expect(storage.getItem('openai_key')).toBe('sk-oa-1');
    });
  });
});
