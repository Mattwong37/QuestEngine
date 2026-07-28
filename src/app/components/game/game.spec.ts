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
});


