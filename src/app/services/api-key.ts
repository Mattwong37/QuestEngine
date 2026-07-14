import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
    anthropicKey = signal<string>(localStorage.getItem('anthropic_key') ?? '');
    openAiKey = signal<string>(localStorage.getItem('openai_key') ?? '');

    setAnthropicKey(key: string) {
        localStorage.setItem('anthropic_key', key);
        this.anthropicKey.set(key);
    }

    setOpenAiKey(key: string) {
        localStorage.setItem('openai_key', key);
        this.openAiKey.set(key);
    }
}