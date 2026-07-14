import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { Game } from '../game/game';

@Component({
  selector: 'app-title-screen',
  imports: [CommonModule, FormsModule, Game],
  templateUrl: './title-screen.html',
  styleUrl: './title-screen.css',
})

export class TitleScreen {
  currentScreen = signal('title');

  showSettings = signal(false);

  playerName = signal('');
  gameService = inject(GameService);

  confirmDeleteId = signal<number | null>(null);

  anthropicKey = signal('');
  openAiKey = signal('');
  darkMode = signal(false);

  startGame() {
    this.currentScreen.set('character-creation');
  } 

  hasSaves() {
    return this.gameService.saveSlots().length > 0;
  }

  continueGame() {
    this.currentScreen.set('load');
  }

  loadGame(slotId: number) {
    this.gameService.loadGame(slotId);
    this.currentScreen.set('game');
  }

  formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  createCharacter() {
    this.gameService.initPlayer(this.playerName().trim());
    this.currentScreen.set('game');
    console.log('Player name:', this.playerName().trim());
    console.log('Saved to service:', this.gameService.playerName());
  }

    saveAnthropicKey() {
    localStorage.setItem('anthropic_key', this.anthropicKey());
    alert('Claude key saved!');
  }

  saveOpenAiKey() {
    localStorage.setItem('openai_key', this.openAiKey());
    alert('OpenAI key saved!');
  }

  darkModeToggle() {
    this.darkMode.set(!this.darkMode());
    if (this.darkMode()) {
      document.body.classList.remove('light-bg');
      document.body.classList.add('dark-bg');
    } else {
      document.body.classList.remove('dark-bg');
      document.body.classList.add('light-bg');
    }
  }

  loadFakeSaves() {
  const fakeSaves = [
    {
      id: 1,
      name: 'FakeSave1',
      timestamp: Date.now(),
      playerName: 'Name1',
      scenePreview: 'This is a fake save test description. The text that will fill this position will range in size. I should have used lorem ipsum for this one like I did for the other',
      data: {
        player: this.gameService.player(),
        conversationHistory: [],
        history: [
          {
            sceneText: 'Test story piece 1',
            imageUrl: '',
            choiceMade: 'Choice1',
            imagePrompt: ''
          },
          {
            sceneText: 'Test story piece 2',
            imageUrl: '',
            choiceMade: '',
            imagePrompt: ''
          }
        ],
        characterRegistry: {},
        currentCardIndex: 1,
        currentChoices: [  
          { id: '1', text: 'Choice1' },
          { id: '2', text: 'Choice2' },
          { id: '3', text: 'Choice3' }
        ]
      }
    },
    {
      id: 2,
      name: 'FakeSave2',
      timestamp: Date.now(),
      playerName: 'Name2',
      scenePreview: 'This is a fake save test description. The text that will fill this position will range in size. I should have used lorem ipsum for this one like I did for the other',
      data: {
        player: this.gameService.player(),
        conversationHistory: [],
        history: [
          {
            sceneText: 'Test story piece 1',
            imageUrl: '',
            choiceMade: 'Choice1',
            imagePrompt: ''
          }
        ],
        characterRegistry: {},
        currentCardIndex: 1,
        currentChoices: []
      }
    }
  ];
  this.gameService.saveSlots.set(fakeSaves as any);
}
}
