import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-title-screen',
  imports: [CommonModule, FormsModule],
  templateUrl: './title-screen.html',
  styleUrl: './title-screen.css',
})

export class TitleScreen {
  currentScreen = signal('title');

  playerName = signal('');
  startGame() {
    this.currentScreen.set('character-creation');
  } 

  createCharacter() {
    console.log('Player name:', this.playerName());
  }
}
