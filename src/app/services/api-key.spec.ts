import { ApiKeyService } from './api-key';


describe('ApiKeyService', () => {
  let service: ApiKeyService;

  beforeEach(() => {
    localStorage.clear();
    // vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('keys blank on start', () => {
      localStorage.clear();
      const service = new ApiKeyService();

      expect(service.anthropicKey()).toBe('');
      expect(service.openAiKey()).toBe('');
    });
  });

  describe('key modification checks', () => {
    it('initial set keys', () => {
      localStorage.setItem('anthropic_key', 'sk-ant-1');
      localStorage.setItem('openai_key', 'sk-oa-1');

      const service = new ApiKeyService();

      expect(service.anthropicKey()).toBe('sk-ant-1');
      expect(service.openAiKey()).toBe('sk-oa-1');
      expect(localStorage.getItem('anthropic_key')).toBe('sk-ant-1');
      expect(localStorage.getItem('openai_key')).toBe('sk-oa-1');
    });

    it('overwrite keys local', () => {
      localStorage.clear();
      localStorage.setItem('anthropic_key', 'sk-ant-1');
      localStorage.setItem('openai_key', 'sk-oa-1');

      const service = new ApiKeyService();

      expect(service.anthropicKey()).toBe('sk-ant-1');
      expect(localStorage.getItem('anthropic_key')).toBe('sk-ant-1');

      expect(service.openAiKey()).toBe('sk-oa-1');
      expect(localStorage.getItem('openai_key')).toBe('sk-oa-1');
    });

    it('removing keys', () => {
      const service = new ApiKeyService();
      service.setAnthropicKey('sk-ant-1');
      service.setAnthropicKey('');

      expect(service.anthropicKey()).toBe('');
      expect(localStorage.getItem('anthropic_key')).toBe('');

      service.setOpenAiKey('sk-ant-1');
      service.setOpenAiKey('');

      expect(service.openAiKey()).toBe('');
      expect(localStorage.getItem('openai_key')).toBe('');
    });
  });
});
