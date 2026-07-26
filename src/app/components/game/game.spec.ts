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
});
