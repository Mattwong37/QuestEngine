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
    it('Begin Adventure button goes to character creation', () => {
      const beginBtn = fixture.nativeElement.querySelector('.begin-adventure-button');
      expect(beginBtn).not.toBeNull();

      beginBtn!.click();
      fixture.detectChanges();

      expect(component.currentScreen()).toBe('character-creation');
    });

    it('startGame goes to character creation', () => {
      component.startGame();
      expect(component.currentScreen()).toBe('character-creation');
    });

    it('create character submit button goes to game page', () => {
      component.startGame();
      fixture.detectChanges();
      component.playerName.set('Matt');
      fixture.detectChanges();

      const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.character-creation-content button');
      expect(submitBtn.disabled).toBe(false);

      submitBtn.click();
      fixture.detectChanges();

      expect(gameService.player().name).toBe('Matt');
      expect(component.currentScreen()).toBe('game');
      expect(component.showSettingsButton()).toBe(false);
    });

    it('creating character goes to game page', () => {
      component.playerName.set('Matt');
      component.createCharacter();
      expect(component.currentScreen()).toBe('game');

      expect(component.showSettingsButton()).toBe(false);
    });

    it('Continue Adventure button goes to save load page', () => {
      const continueBtn = fixture.nativeElement.querySelector('.continue-adventure-button');
      expect(continueBtn).not.toBeNull();

      continueBtn.click();
      fixture.detectChanges();

      expect(component.currentScreen()).toBe('load');
    });

    it('continueGame goes to save load page', () => {
      component.continueGame();
      expect(component.currentScreen()).toBe('load');
    });

    it('Load button goes to the game page ', () => {
      gameService.saveSlots.set([
        { id: 1, name: 'testSave1', timestamp: 1, playerName: 'Matt', scenePreview: '', data: { player: {
          name: 'Matt', level: 1, xp: 0, xpToNextLevel: 100,
          maxHealth: 100, currentHealth: 100, maxMagic: 100, currentMagic: 100,
          defense: 0, magicDefense: 0, attackMin: 1, attackMax: 5, stamina: 100,
          equipment: { mainHand: null, offHand: null, shoes: null, armor: null },
          inventory: [], activeModifiers: [], choiceHistory: [],
        },
        conversationHistory: [],
        history: [],
        characterRegistry: {},
        currentCardIndex: 0,
        currentChoices: []}
      }]);
      component.continueGame();
      fixture.detectChanges();
      const loadBtn = fixture.nativeElement.querySelector('.load-button');
      expect(loadBtn).not.toBeNull();

      loadBtn.click();
      fixture.detectChanges()
      expect(component.currentScreen()).toBe('game');
      expect(component.showSettingsButton()).toBe(false);
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

    it('delete save slot confirm', () => {
      gameService.saveSlots.set([
        { id: 1, name: 'testSave1', timestamp: 1, playerName: 'Matt', scenePreview: '', data: {} as any },
      ]);
      const deleteBtn = vi.spyOn(gameService, 'deleteSave');
      component.continueGame();
      component.confirmDeleteId.set(1);
      fixture.detectChanges();

      const confirmButton = fixture.nativeElement.querySelector('.confirm-yes');

      confirmButton.click();

      expect(deleteBtn).toHaveBeenCalledWith(1);
      expect(component.confirmDeleteId()).toBeNull();
      expect(gameService.saveSlots().find(s => s.id === 1)).toBeUndefined();
    });

    it('delete save slot deny', () => {
      gameService.saveSlots.set([
        { id: 1, name: 'testSave1', timestamp: 1, playerName: 'Matt', scenePreview: '', data: {} as any },
      ]);
      const deleteBtn = vi.spyOn(gameService, 'deleteSave');
      component.continueGame();
      component.confirmDeleteId.set(1);
      fixture.detectChanges();

      const denyButton = fixture.nativeElement.querySelector('.confirm-no');
      denyButton.click();

      expect(deleteBtn).not.toHaveBeenCalled();
      expect(component.confirmDeleteId()).toBeNull();
      expect(gameService.saveSlots().find(s => s.id === 1)).not.toBeUndefined();
    });

  });

  describe('API key handling', () => {
    it('Save button for claude key', () => {
      component.showSettings.set(true);
      fixture.detectChanges();
      const saveBtn = vi.spyOn(component, 'saveAnthropicKey');

      const buttons = fixture.nativeElement.querySelectorAll('.key-save-button');
      buttons[0].click();
      fixture.detectChanges();

      expect(saveBtn).toHaveBeenCalled();
    });

    it('saveAnthropicKey is connected to service and pop up triggered', () => {
      component.anthropicKey.set('sk-ant-1');
      component.saveAnthropicKey();
      expect(apiKeyService.anthropicKey()).toBe('sk-ant-1');
      expect(window.alert).toHaveBeenCalled();
    });

    it('Save button for openai key', () => {
      component.showSettings.set(true);
      fixture.detectChanges();
      const saveBtn = vi.spyOn(component, 'saveOpenAiKey');

      const buttons = fixture.nativeElement.querySelectorAll('.key-save-button');
      buttons[1].click();
      fixture.detectChanges();

      expect(saveBtn).toHaveBeenCalled();
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

  describe('format date', () => {
    it('format date', () => {
      const unixTimestamp = 1785013200000;
      const formattedTime = component.formatDate(unixTimestamp);

      expect(formattedTime).toBe('Jul 25, 05:00 PM');
    });
  });
});
