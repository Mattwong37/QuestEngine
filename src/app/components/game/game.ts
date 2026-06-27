import { Component, inject } from '@angular/core';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game {
  gameService = inject(GameService);

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
}