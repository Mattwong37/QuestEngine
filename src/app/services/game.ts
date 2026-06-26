import { Injectable, signal } from '@angular/core';
import { Player } from '../models/story.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  playerName = signal('');

  player = signal<Player>({
    name: '',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,

    maxHealth: 100,
    currentHealth: 100,

    maxMagic: 100,
    currentMagic: 100,

    defense: 0,
    magicDefense: 0,

    attackMin: 5,
    attackMax: 5,

    stamina: 100,

    equippedWeapon: null,
    inventory: [],
    activeModifiers: [],
    choiceHistory: [],
  });

  initPlayer(name: string) {
    this.player.update(p => ({ ...p, name }));
    this.playerName.set(name);
  }
}