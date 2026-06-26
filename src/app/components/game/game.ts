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
}
