import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleScreen } from './title-screen';
import { ɵdevModeEqual } from '@angular/core';

describe('TitleScreen', () => {
  let component: TitleScreen;
  let fixture: ComponentFixture<TitleScreen>;

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

  it('continueGame goes to game load', () => {
    component.continueGame();
    expect(component.currentScreen()).toBe('load');
  });

  //  TODO:
  //  - Make sure all buttons work
  //  - Make sure settings button hides when game starts
  //  - test load save page
  //  - test if text is right when no saves avaialble
  //  - test character creation
  //  - make sure settings works
  //  - test dark mode toggle in title page setting
});
