import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleScreen } from './title-screen';
import { GameService } from '../../services/game';


describe('TitleScreen', () => {
  let component: TitleScreen;
  let fixture: ComponentFixture<TitleScreen>;
  let gameService: GameService;

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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('title screen navigation', () => {
    it('startGame goes to character creation', () => {
      component.startGame();
      expect(component.currentScreen()).toBe('character-creation');
    });
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

  it('close in settinsg closes the pip', () => {
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
