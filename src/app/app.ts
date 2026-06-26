import { Component, signal } from '@angular/core';
import { TitleScreen } from './components/title-screen/title-screen';

@Component({
  selector: 'app-root',
  imports: [TitleScreen],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {}

