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

  playerName = signal('');
  private gameService = inject(GameService);

  startGame() {
    this.currentScreen.set('character-creation');
  } 

  createCharacter() {
    this.gameService.initPlayer(this.playerName());
    this.currentScreen.set('game');
    console.log('Player name:', this.playerName());
    console.log('Saved to service:', this.gameService.playerName());
  }
}
