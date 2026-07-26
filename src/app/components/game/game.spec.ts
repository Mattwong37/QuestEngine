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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('test ngOnInit', () => {
    it('shows "no API key" and stall when no claude key', () => {
      fixture = TestBed.createComponent(Game);
      component = fixture.componentInstance;
      const storyService = component.storyService;
      vi.spyOn(storyService, 'startStory').mockResolvedValue();
      fixture.detectChanges();
      
      expect(storyService.currentScene()).toContain('No Anthropic API key found');
      expect(storyService.startStory).not.toHaveBeenCalled();
    });
  });

  it('start new game with claude key loaded', () => {
      fixture = TestBed.createComponent(Game);
      component = fixture.componentInstance;
      const storyService = component.storyService;
      const gameService = component.gameService;
      const apiKeyService = component.apiKeyService;
      vi.spyOn(storyService, 'startStory').mockResolvedValue();
      
      apiKeyService.setAnthropicKey('sk-ant-test');
      gameService.initPlayer('Matt');
      fixture.detectChanges();

      expect(storyService.startStory).toHaveBeenCalledWith('Matt', 'sk-ant-test');
    });
});


