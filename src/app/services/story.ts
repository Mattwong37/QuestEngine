import { Injectable, signal } from '@angular/core';

export interface StoryMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface StoryChoice {
    id: string;
    text: string;
}

export interface StoryResponse {
    sceneText: string;
    choices: StoryChoice[];
    statsUpdate?: any;
    imagePrompt: string; 
}

export interface HistoryEntry {
    sceneText: string;
    imageUrl: string;
    choiceMade: string;
    imagePrompt: string; 
}

@Injectable({
    providedIn: 'root'
})
export class StoryService {
    isLoading = signal(false);
    currentScene = signal('');
    currentChoices = signal<StoryChoice[]>([]);
    conversationHistory: StoryMessage[] = [];
    currentCardIndex = signal(0);
    history = signal<HistoryEntry[]>([]);
    currentImage = signal('');

    // This prompt was written to be optimized for cost. May come back to make this shorter, but will have to test variations and not effects on the game quality
    private systemPrompt = `You are the Game Master of a persistent isekai fantasy RPG. The player is the protagonist, and every choice permanently affects the world, characters, and future events.
        Style:
        - Epic fantasy with progression, mystery, exploration, action, and occasional romance.
        - Choices have real consequences.
        - Characters remember past interactions.
        - The world continues evolving.

        Choices:
        - Return 2–3 meaningful options.
        - No fake choices.
        - Include a mix of safe, risky, and creative paths when appropriate.

        Respond ONLY with valid JSON:

        {
        "sceneText": "<story narration>",
        "choices": [
            { "id": "1", "text": "<choice>" },
            { "id": "2", "text": "<choice>" },
            { "id": "3", "text": "<choice>" }
        ],
        "imagePrompt": "<anime scene with consistent character appearances, cinematic lighting, dynamic composition>"
        }`;

    async startStory(playerName: string, anthropicKey: string): Promise<void> {
        this.isLoading.set(true);
        this.conversationHistory = [];

        const firstMessage = `The player's name is ${playerName}. Begin the isekai story. Transport them from the modern world into a dangerous fantasy realm. Describe their appearance and surroundings in detail. Then present their first choices.`;

        await this.sendMessage(firstMessage, anthropicKey);
    }

    async makeChoice(choiceText: string, anthropicKey: string): Promise<void> {
        this.isLoading.set(true);
        await this.sendMessage(`Player chose: ${choiceText}`, anthropicKey);
    }

    private async sendMessage(message: string, anthropicKey: string): Promise<void> {
        this.conversationHistory.push({ role: 'user', content: message });

        try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 1000,
            system: this.systemPrompt,
            messages: this.conversationHistory
            })
        });

        const data = await response.json();
        const text = data.content[0].text;
        const parsed: StoryResponse = JSON.parse(text);

        this.currentScene.set(parsed.sceneText);
        this.currentChoices.set(parsed.choices);
        this.history.update(h => [...h, {
        sceneText: parsed.sceneText,
        imageUrl: '',
        choiceMade: '',
        imagePrompt: parsed.imagePrompt ?? ''
        }]);
        this.currentCardIndex.set(this.history().length - 1);


        this.conversationHistory.push({ role: 'assistant', content: text });
        this.currentScene.set(parsed.sceneText);
        this.currentChoices.set(parsed.choices);

        } catch (error) {
        console.error('Story error:', error);
        this.currentScene.set('Something\'s not right. Check your API key in Settings.');
        this.currentChoices.set([]);
        } finally {
        this.isLoading.set(false);
        }
    }
}