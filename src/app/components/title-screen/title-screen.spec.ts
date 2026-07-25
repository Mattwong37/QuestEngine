import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleScreen } from './title-screen';
import { GameService } from '../../services/game';
import { ApiKeyService } from '../../services/api-key';

describe('TitleScreen', () => {
  let component: TitleScreen;
  let fixture: ComponentFixture<TitleScreen>;
  let gameService: GameService;
  let apiKeyService: ApiKeyService;

  beforeEach(async () => {
    localStorage.clear();
    document.body.className = '';
    vi.spyOn(window, 'alert');

    await TestBed.configureTestingModule({
      imports: [TitleScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(TitleScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
    gameService = component.gameService;  
    apiKeyService = component.apiKeyService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('title screen navigation', () => {
    it('startGame goes to character creation', () => {
      component.startGame();
      expect(component.currentScreen()).toBe('character-creation');
    });

    it('creating character goes to game page', () => {
      component.playerName.set('Matt');
      component.createCharacter();
      expect(component.currentScreen()).toBe('game');

      expect(component.showSettingsButton()).toBe(false);
    });

    it('continueGame goes to save load page', () => {
      component.continueGame();
      expect(component.currentScreen()).toBe('load');
    });

    it('selecting a save goes to the game page', () => {
      vi.spyOn(gameService, 'loadGame');
      component.loadGame(1);
      expect(component.currentScreen()).toBe('game');

      expect(component.showSettingsButton()).toBe(false);
    });

    it('settings button brings up pip', () => {
      const settingsBtn = fixture.nativeElement.querySelector('.settings-button');
      expect(settingsBtn).not.toBeNull();
      settingsBtn!.click();
      fixture.detectChanges();

      expect(component.showSettings()).toBe(true);
      expect(fixture.nativeElement.querySelector('.settings-overlay')).not.toBeNull();
    });

    it('close in settings closes the pip', () => {
      component.showSettings.set(true);
      fixture.detectChanges();

      const closeBtn = fixture.nativeElement.querySelector('.close-button');
      expect(closeBtn).not.toBeNull();
      closeBtn!.click();
      fixture.detectChanges();

      expect(component.showSettings()).toBe(false);
      expect(fixture.nativeElement.querySelector('.settings-overlay')).toBeNull();
    });
  });

  describe('API key handling', () => {
    it('saveAnthropicKey is connected to service and pop up triggered', () => {
      component.anthropicKey.set('sk-ant-1');
      component.saveAnthropicKey();
      expect(apiKeyService.anthropicKey()).toBe('sk-ant-1');
      expect(window.alert).toHaveBeenCalled();
    });

    it('saveOpenAiKey is connected to service and pop up triggered', () => {
      component.openAiKey.set('sk-oa-1');
      component.saveOpenAiKey();
      expect(apiKeyService.openAiKey()).toBe('sk-oa-1');
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('darkModeToggle', () => {
    it('darkmode toggle on/off', () => {
      expect(component.darkMode()).toBe(false);
      expect(document.body.classList.contains('dark-bg')).toBe(false);
      component.darkModeToggle();
      expect(component.darkMode()).toBe(true);
      expect(document.body.classList.contains('dark-bg')).toBe(true);
      expect(document.body.classList.contains('light-bg')).toBe(false);
      component.darkModeToggle();
      expect(component.darkMode()).toBe(false);
      expect(document.body.classList.contains('light-bg')).toBe(true);
      expect(document.body.classList.contains('dark-bg')).toBe(false);
    });
  });

  describe('save page rendering', () => {
    it('no saves page rendering', () => {
      component.continueGame();
      fixture.detectChanges();
      
      expect(fixture.nativeElement.textContent).toContain('No saves yet');
      expect(fixture.nativeElement.querySelectorAll('.save-slot').length).toBe(0);
    });

    it('populated saves page rendering', () => {
      gameService.saveSlots.set([
        { id: 1, name: 'testSave1', timestamp: 1, playerName: 'Matt', scenePreview: '', data: {} as any },
      ]);
      component.continueGame();
      fixture.detectChanges();
      
      expect(fixture.nativeElement.textContent).not.toContain('No saves yet');
      expect(fixture.nativeElement.querySelectorAll('.save-slot').length).toBe(1);
    });
  });
});
