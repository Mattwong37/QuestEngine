import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Game } from './game';

describe('Game', () => {
  let component: Game;
  let fixture: ComponentFixture<Game>;

  beforeEach(async () => {
    localStorage.clear()
    
    await TestBed.configureTestingModule({
      imports: [Game],
    }).compileComponents();

    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function setUp() {
      fixture = TestBed.createComponent(Game);
      component = fixture.componentInstance;
      const storyService = component.storyService;
      const gameService = component.gameService;
      const apiKeyService = component.apiKeyService;
      
      return { fixture, component, gameService, storyService, apiKeyService };
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('test ngOnInit', () => {
    it('shows "no API key" and stall when no claude key', () => {
      const { storyService } =  setUp();
      vi.spyOn(storyService, 'startStory').mockResolvedValue();
      fixture.detectChanges();
      
      expect(storyService.currentScene()).toContain('No Anthropic API key found');
      expect(storyService.startStory).not.toHaveBeenCalled();
    });

    it('start new game with claude key loaded', () => {
        const { storyService, gameService, apiKeyService } = setUp();
        vi.spyOn(storyService, 'startStory').mockResolvedValue();
        
        apiKeyService.setAnthropicKey('sk-ant-test');
        gameService.initPlayer('Matt');
        fixture.detectChanges();

        expect(storyService.startStory).toHaveBeenCalledWith('Matt', 'sk-ant-test');
      });

    it ('regenerate images on load', () => {
        const { storyService, gameService, apiKeyService } = setUp();

        apiKeyService.setAnthropicKey('sk-ant-test');
        apiKeyService.setOpenAiKey('sk-oa-test');

        vi.spyOn(storyService, 'regenerateImages').mockResolvedValue();
        vi.spyOn(storyService, 'startStory').mockResolvedValue();

        gameService.isLoadedFromSave.set(true);
        fixture.detectChanges();

        expect(storyService.regenerateImages).toHaveBeenCalledWith('sk-oa-test');
        expect(storyService.startStory).not.toHaveBeenCalled();
    });

    it('image regen not done if no API key', () => {
      const { gameService, storyService } = setUp();
      gameService.isLoadedFromSave.set(true);

      vi.spyOn(storyService, 'regenerateImages').mockResolvedValue();
      vi.spyOn(storyService, 'startStory').mockResolvedValue();

      fixture.detectChanges();

      expect(storyService.regenerateImages).not.toHaveBeenCalled();
      expect(storyService.startStory).not.toHaveBeenCalled();
    });
  });

  describe('stat percentage getters', () => {
    it('health stat', () => {
      const { component, gameService } = setUp();
      expect(component.healthPercent()).toBe(100);
      gameService.player.update(p => ({ ...p, currentHealth: 50, maxHealth: 100 }));
      expect(component.healthPercent()).toBe(50);
    });

    it('magic stat', () => {
      const { component, gameService } = setUp();
      expect(component.magicPercent()).toBe(100);
      gameService.player.update(p => ({ ...p, currentMagic: 50, maxMagic: 100 }));
      expect(component.magicPercent()).toBe(50);
    });

    it('xp percentage', () => {
      const { component, gameService } = setUp();
      expect(component.xpPercent()).toBe(0);
      gameService.player.update(p => ({ ...p, xp: 50 }));
      expect(component.xpPercent()).toBe(50);
    });
  });

  describe('format bonus', () => {
    it('format attack bonus', () => {
      const { component } = setUp();
      expect(component.formatBonus({ attackMinBonus: 1, attackMaxBonus: 5 })).toEqual(['+1–5 ATK']);
    });

    it('format defense bonus', () => {
      const { component } = setUp();
      expect(component.formatBonus({ defenseBonus: 5 })).toEqual(['+5 DEF']);
    });


    it('format stamina drain reduction', () => {
      const { component } = setUp();
      expect(component.formatBonus({ staminaDrainReduction: 5 })).toEqual(['+5 Stamina Drain']);
      expect(component.formatBonus({ staminaDrainReduction: -5 })).toEqual(['-5 Stamina Drain']);
    });

    it('format stamina recovery bonus', () => {
      const { component } = setUp();
      expect(component.formatBonus({ staminaRecoveryBonus: 5 })).toEqual(['+5 Stamina Recovery']);
    });

    it('format all stat bonuses', () => {
      const { component } = setUp();
      const result = component.formatBonus({
        attackMinBonus: 1, attackMaxBonus: 2, defenseBonus: 3, staminaRecoveryBonus: 4,
      });
      expect(result).toEqual(['+1–2 ATK', '+3 DEF', '+4 Stamina Recovery']);
    });

    it('empty inputs', () => {
      const { component } = setUp();
      expect(component.formatBonus({})).toEqual([]);
    });
  });

  describe('format bonus', () => {
    it('empty inputs', () => {
      const { component } = setUp();
      expect(component.formatBonus({})).toEqual([]);
    });
  });

  describe('saveApiKey', () => {
    it('openAI key saves and overwrites', () => {
      const { component, apiKeyService } = setUp();
      vi.spyOn(window, 'alert');
      component.openAiKey.set('sk-oa-test');
      component.saveApiKey();

      expect(apiKeyService.openAiKey()).toBe('sk-oa-test');
      expect(window.alert).toHaveBeenCalled();

      component.openAiKey.set('sk-oa-test2');
      component.saveApiKey();

      expect(apiKeyService.openAiKey()).toBe('sk-oa-test2');
      expect(window.alert).toHaveBeenCalled();
    });

  it('regen image when no image url', () => {
      const { component, storyService } = setUp();
      storyService.history.set([
        { sceneText: 'Scene', imageUrl: '', choiceMade: 'dummyOption', imagePrompt: 'a field of grass' },
      ]);
      component.openAiKey.set('sk-oa-test');

      vi.spyOn(storyService, 'generateImage').mockResolvedValue('filler.png');
      component.saveApiKey();

      expect(storyService.generateImage).toHaveBeenCalledWith('a field of grass', 'sk-oa-test');
    });

    it('does not regen image if there is one', () => {
      const { component, storyService } = setUp();
      storyService.history.set([
        { sceneText: 'Scene', imageUrl: 'filler.png', choiceMade: 'dummyOption', imagePrompt: 'a field of grass' },
      ]);
      component.openAiKey.set('sk-oa-test');

      vi.spyOn(storyService, 'generateImage').mockResolvedValue('');
      component.saveApiKey();

      expect(storyService.generateImage).not.toHaveBeenCalled();
    });

    it('does not regen an image if there is no history', () => {
      const { component, storyService } = setUp();
      component.openAiKey.set('sk-oa-test');

      vi.spyOn(storyService, 'generateImage').mockResolvedValue('');
      component.saveApiKey();

      expect(storyService.generateImage).not.toHaveBeenCalled();
    });
  });

  describe('saveAnthropicKey', () => {
    it('key save and overwrite', () => {
      const { component, apiKeyService } = setUp();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      component.anthropicKey.set('sk-ant-test');
      component.saveAnthropicKey();

      expect(apiKeyService.anthropicKey()).toBe('sk-ant-test');
      expect(window.alert).toHaveBeenCalled();

      apiKeyService.setAnthropicKey('sk-ant-test2');
      expect(apiKeyService.anthropicKey()).toBe('sk-ant-test2');
      expect(window.alert).toHaveBeenCalled();
    });

    it('reject new key save', () => {
      const { component, apiKeyService } = setUp();
      apiKeyService.anthropicKey.set('sk-ant-test');

      vi.spyOn(window, 'confirm').mockReturnValue(false);
      apiKeyService.setAnthropicKey('sk-ant-test1');

      component.saveAnthropicKey();
      expect(apiKeyService.anthropicKey()).toBe('sk-ant-test1');
    });

    it('reject new key save', () => {
      const { component, apiKeyService } = setUp();
      apiKeyService.anthropicKey.set('sk-ant-test');

      vi.spyOn(window, 'confirm').mockReturnValue(false);
      apiKeyService.setAnthropicKey('sk-ant-test1');

      component.saveAnthropicKey();
      expect(apiKeyService.anthropicKey()).toBe('sk-ant-test1');
    });

    it('does not start new story when has history', () => {
      const { component, storyService } = setUp();
      storyService.history.set([
        { sceneText: 'Scene', imageUrl: 'filler.png', choiceMade: 'dummyOption', imagePrompt: 'a field of grass' },
      ]);
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      vi.spyOn(storyService, 'startStory').mockResolvedValue();
      component.anthropicKey.set('sk-ant-test1');
      component.saveAnthropicKey();

      expect(storyService.startStory).not.toHaveBeenCalled();
    });

    it('start new story when no history', () => {
      const { component, storyService } = setUp();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.spyOn(storyService, 'startStory').mockResolvedValue();
      component.anthropicKey.set('sk-ant-test1');
      component.saveAnthropicKey();

      expect(storyService.startStory).toHaveBeenCalled();
    });
  });
});


