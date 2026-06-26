import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  playerName = signal('');
}