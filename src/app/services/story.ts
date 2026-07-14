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
    imagePrompt?: string; 
    characterSummary?: string;
    newCharacters?: Record<string, string>;
    itemGain?: {
        id: string;
        name: string;
        description: string;
        slot: 'mainHand' | 'offHand' | 'shoes' | 'armor';
        bonus: {
            attackMinBonus?: number;
            attackMaxBonus?: number;
            defenseBonus?: number;
            magicDefenseBonus?: number;
            staminaDrainReduction?: number;
            staminaRecoveryBonus?: number;
        };
    };
}

export interface HistoryEntry {
    sceneText: string;
    imageUrl: string;
    choiceMade: string;
    imagePrompt: string;
    statsUpdate?: {
        healthChange?: number;
        magicChange?: number;
        xpGain?: number;
        defenseChange?: number;
        magicDefenseChange?: number;
        attackMinChange?: number;
        attackMaxChange?: number;
        staminaChange?: number;
        levelUp?: boolean;
    };
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
    characterRegistry: Record<string, string> = {};
    pendingStatsUpdate = signal<any>(null);

    pendingItemGain = signal<StoryResponse['itemGain'] | null>(null);

    // This prompt was written to be optimized for cost. May come back to make this shorter, but will have to test variations and not effects on the game quality
    private systemPrompt = `You are the Game Master of a persistent isekai fantasy RPG. The player is the protagonist, and every choice permanently affects the world, characters, and future events.
        Style:
        - Epic fantasy with progression, mystery, exploration, action, and occasional romance.
        - Choices have real consequences.
        - Characters remember past interactions.
        - The world continues evolving.
        - Keep sceneText concise. max 4 sentences. Be vivid, but leave room for imagination.

        statsUpdate rules:
        - Never give XP on the first scene.
        - Award XP only for: defeating enemies and solving challenges.
        - Award 5-15 XP for minor accomplishments, 20-50 for major ones.
        - staminaChange: decrease during combat, running, or intense physical activity (-5 to -15).
        - staminaChange: increase during rest, sleeping, eating, or passive scenes (+5 to +10).
        - Stamina affects combat effectiveness. Low stamina = weaker attacks.
        - healthChange: negative for damage taken, positive for healing.
        - Never let stamina go below 0 or above 100.

        itemGain rules:
        - Omit "itemGain" entirely unless an item is actually found in this scene's narrative.
        - Only when narratively justified: found loot, a gift, defeating a notable enemy, completing a task.
        - slot must be exactly one of: "mainHand", "offHand", "shoes", "armor".
        - mainHand items: weapons, boost attack by maximum of 50% of their base at the time of receiving.
        - offHand items: shields (defenseBonus), tomes (magicDefenseBonus), charms (attack bonus).
        - shoes: use staminaDrainReduction and/or staminaRecoveryBonus.
        - armor: boost defense; may include a small negative staminaDrainReduction to represent weight.
        - Keep bonuses small and proportional to player level (roughly 1-4 per stat early on).

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
        "imagePrompt": "<short scene description for image generation>",
        "characterSummary": "<only on first scene: compressed one-line protagonist appearance>",
        "newCharacters": {
            "<character_name>": "<compressed one-line appearance description>"
        },
        "statsUpdate": {
            "healthChange": 0,
            "magicChange": 0,
            "xpGain": 0,
            "defenseChange": 0,
            "magicDefenseChange": 0,
            "attackMinChange": 0,
            "attackMaxChange": 0,
            "staminaChange": 0
        },
        "itemGain": {
            "id": "<unique_id>",
            "name": "<item name>",
            "slot": "mainHand",
            "bonus": { "attackMinBonus": 0, "attackMaxBonus": 0 }
        }
        }
        Only include "newCharacters" when new named characters are introduced. Only include "characterSummary" on the very first scene.`;

    async startStory(playerName: string, anthropicKey: string): Promise<void> {
        this.isLoading.set(true);
        this.conversationHistory = [];
        this.characterRegistry = {};

        const firstMessage = `The player's name is ${playerName}. Begin the isekai story. Transport them from the modern world into a dangerous fantasy realm. Describe their appearance and surroundings in detail. Then present their first choices.
        Since this is the first scene, include a "characterSummary" field — a single compressed line describing the protagonist's appearance for image consistency. Example: "young male, messy black hair, brown eyes, modern clothes, no weapons yet"`;

        await this.sendMessage(firstMessage, anthropicKey);
    }

    async makeChoice(choiceText: string, anthropicKey: string): Promise<void> {
        this.isLoading.set(true);
        this.history.update(h => h.map((entry, i) =>
            i === this.currentCardIndex() ? { ...entry, choiceMade: choiceText } : entry
        ));
        await this.sendMessage(`Player chose: ${choiceText}`, anthropicKey);
    }

    async generateImage(imagePrompt: string, openAiKey: string): Promise<string> {
        const characterDescriptions = Object.entries(this.characterRegistry).map(([name, desc]) => `${name}: ${desc}`).join(', ');

        const fullPrompt = `Create a premium-quality fantasy anime promotional illustration that looks like official key art for a AAA JRPG. The image should appear professionally illustrated rather than AI-generated. Prioritize clean linework, carefully designed facial features, elegant composition, refined lighting, and a cohesive color palette. Every element should feel intentional and polished. Avoid amateur-looking rendering, muddy shading, generic AI textures, inconsistent anatomy, or semi-realistic faces. Characters: ${characterDescriptions}. Scene: ${imagePrompt}.`;

        try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-image-1.5',
                prompt: fullPrompt,
                n: 1,
                size: '1536x1024',
                quality: 'low',
            })
            });

            const data = await response.json();
            const b64 = data.data[0].b64_json;
            
            return `data:image/png;base64,${b64}`;

        } catch (error) {
            console.error('Image generation error:', error);
            return '';
        }
    }

    private async sendMessage(message: string, anthropicKey: string): Promise<void> {
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
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
            const parsed: StoryResponse = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

            if (parsed.characterSummary && !this.characterRegistry['protagonist']) {
                this.characterRegistry['protagonist'] = parsed.characterSummary;
            }

            if (parsed.newCharacters) {
                this.characterRegistry = { ...this.characterRegistry, ...parsed.newCharacters };
            }

            if (parsed.statsUpdate) {
                this.pendingStatsUpdate.set(parsed.statsUpdate);
            }

            if (parsed.itemGain) {
                console.log('itemGain from Claude:', parsed.itemGain);
                this.pendingItemGain.set(parsed.itemGain);
            }

            this.currentScene.set(parsed.sceneText);
            this.currentChoices.set(parsed.choices);
            this.history.update(h => [...h, {
                sceneText: parsed.sceneText,
                imageUrl: '',
                choiceMade: '',
                imagePrompt: parsed.imagePrompt ?? '',
                statsUpdate: parsed.statsUpdate ?? null
            }]);
            this.currentCardIndex.set(this.history().length - 1);

            this.conversationHistory.push({ role: 'assistant', content: text });

            const openAiKey = localStorage.getItem('openai_key') ?? '';
            if (parsed.imagePrompt && openAiKey) {
                const imageUrl = await this.generateImage(parsed.imagePrompt, openAiKey);

                this.history.update(h => h.map((entry, i) =>
                    i === h.length - 1 ? { ...entry, imageUrl } : entry
                ));
            }

            console.log('Image prompt from Claude:', parsed.imagePrompt);

        } catch (error) {
            console.error('Story error:', error);
            this.currentScene.set('Something\'s not right. Check your API key in Settings.');
            this.currentChoices.set([]);
        } finally {
            this.isLoading.set(false);
        }
    }

    async regenerateImages(openAiKey: string): Promise<void> {
        const history = this.history();
        for (let i = 0; i < history.length; i++) {
            if (history[i].imagePrompt && !history[i].imageUrl) {
                const imageUrl = await this.generateImage(history[i].imagePrompt, openAiKey);
                this.history.update(h => h.map((entry, idx) =>
                    idx === i ? { ...entry, imageUrl } : entry
                ));
            }
        }
    }
}