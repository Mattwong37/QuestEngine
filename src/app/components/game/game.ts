import { Component, inject, signal, OnInit, effect, HostListener, computed } from '@angular/core';
import { GameService } from '../../services/game';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../../services/story';

@Component({
  selector: 'app-game',
  imports: [FormsModule],
  templateUrl: './game.html',
  styleUrl: './game.css',
})


export class Game implements OnInit {
  gameService = inject(GameService);
  activePanel = signal('equipment');
  openAiKey = signal('');
  anthropicKey = signal('');
  darkMode = signal(false);
  storyService = inject(StoryService);

  thresholdAmount: number = 20;

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    const storyArea = document.querySelector('.story-area');
    if (storyArea && storyArea.contains(event.target as Node)) {
      event.preventDefault();
      if (event.deltaY > 0) {
        this.nextCard();
      } else {
        this.prevCard();
      }
    }
  }

  healthPercent() {
    const p = this.gameService.player();
    return (p.currentHealth / p.maxHealth) * 100;
  }

  magicPercent() {
    const p = this.gameService.player();
    return (p.currentMagic / p.maxMagic) * 100;
  }

  xpPercent() {
    const p = this.gameService.player();
    return (p.xp / p.xpToNextLevel) * 100;
  }

  saveApiKey() {
    localStorage.setItem('openai_key', this.openAiKey());
    alert('API key saved!');
  }

  saveAnthropicKey() {
    localStorage.setItem('anthropic_key', this.anthropicKey());
    alert('API key saved!');
  }

  currentCard() {
    const history = this.storyService.history();
    const index = this.storyService.currentCardIndex();
    return history[index];
  }

  isCurrentCard = computed(() => 
    this.storyService.currentCardIndex() === this.storyService.history().length - 1
  );

  prevCard() {
    const current = this.storyService.currentCardIndex();
    if (current > 0) this.storyService.currentCardIndex.set(current - 1);
  }

  nextCard() {
    const current = this.storyService.currentCardIndex();
    if (current < this.storyService.history().length - 1) {
      this.storyService.currentCardIndex.set(current + 1);
    }
  }

  onScroll(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY > 0) {
      this.nextCard();
    } else {
      this.prevCard();
    }
  }

  darkModeToggle() {
    this.darkMode.set(!this.darkMode());
    document.body.style.backgroundImage = this.darkMode() 
      ? 'url(/darkMode.png)' 
      : 'url(/lightMode.png)';
      const url = this.darkMode() ? 'url(/darkMode.png)' : 'url(/lightMode.png)';
      console.log('Setting:', url);
    document.body.style.backgroundImage = url;
    console.log('Body background after set:', document.body.style.backgroundImage);
  }

  async makeChoice(choice: any) {
    const key = localStorage.getItem('anthropic_key') ?? '';
    await this.storyService.makeChoice(choice.text, key);
  }

  constructor() {
    effect(() => {
      if (this.darkMode()) {
        document.body.classList.remove('light-bg');
        document.body.classList.add('dark-bg');
      } else {
        document.body.classList.remove('dark-bg');
        document.body.classList.add('light-bg');
      }
    });
  }

  ngOnInit() {
    document.body.classList.add('light-bg');

    const savedOpenAi = localStorage.getItem('openai_key');
    const savedAnthropic = localStorage.getItem('anthropic_key');
    
    if (savedOpenAi) this.openAiKey.set(savedOpenAi);
    if (savedAnthropic) this.anthropicKey.set(savedAnthropic);

    const key = localStorage.getItem('anthropic_key') ?? '';
    this.storyService.startStory(this.gameService.player().name, key);
  }

  // Dummy Data loading method for testing UI
  loadDummyData() {
    this.storyService.history.set([
      {
        sceneText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        imageUrl: '',
        choiceMade: 'This is a summy option1',
        imagePrompt: ''
      },
      {
        sceneText: 'second card Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        imageUrl: '',
        choiceMade: '',
        imagePrompt: ''
      }
    ]);

    this.storyService.currentChoices.set([
      { id: '1', text: 'This is dummy option1' },
      { id: '2', text: 'This is dummy option2' },
      { id: '3', text: 'This is dummy option3' }
    ]);

    this.storyService.currentCardIndex.set(1);
  }
}