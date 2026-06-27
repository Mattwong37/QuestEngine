import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { GameService } from '../../services/game';
import { FormsModule } from '@angular/forms';

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
  darkMode = signal(false);

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
  }
}