import { Injectable, signal, inject } from '@angular/core';
import { StorageService } from './storage';

@Injectable({ providedIn: 'root' })
export class ApiKeyService {

    private storage = inject(StorageService);

    anthropicKey = signal<string>(this.storage.getItem('anthropic_key') ?? '');
    openAiKey = signal<string>(this.storage.getItem('openai_key') ?? '');

    setAnthropicKey(key: string) {
        this.storage.setItem('anthropic_key', key);
        this.anthropicKey.set(key);
    }

    setOpenAiKey(key: string) {
        this.storage.setItem('openai_key', key);
        this.openAiKey.set(key);
    }
}