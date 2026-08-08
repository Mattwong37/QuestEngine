import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initStorage } from './app/services/storage';
console.log('APP BOOT');
initStorage(['anthropic_key', 'openai_key', 'quest_engine_saves'])
  .then(() => bootstrapApplication(App, appConfig))
  .catch(err => console.error(err));