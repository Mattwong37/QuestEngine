import { Injectable, signal, inject } from '@angular/core';
import { Player } from '../models/story.model';
import { StoryService } from './story';

export interface SaveSlot {
    id: number;
    name: string;
    timestamp: number;
    playerName: string;
    scenePreview: string;
    data: {
        player: Player;
        conversationHistory: any[];
        history: any[];
        characterRegistry: Record<string, string>;
        currentCardIndex: number;
        currentChoices: any[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private storyService = inject(StoryService);
    playerName = signal('');
    isLoadedFromSave = signal(false);

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

    saveSlots = signal<SaveSlot[]>(this.loadSavesFromStorage());

    initPlayer(name: string) {
        this.player.update(p => ({ ...p, name }));
        this.playerName.set(name);
    }

    saveGame(slotId: number, saveName: string) {
        const saves = [...this.saveSlots()];
        const existingIdx = saves.findIndex(s => s.id === slotId);

        const history = this.storyService.history();
        const scenePreview = history.length > 0 ? history[history.length - 1].sceneText.substring(0, 80) + '...' : 'No scenes yet';

        const newSave: SaveSlot = {
            id: slotId,
            name: saveName,
            timestamp: Date.now(),
            playerName: this.player().name,
            scenePreview,
            data: {
                player: this.player(),
                conversationHistory: this.storyService.conversationHistory,
                history: this.storyService.history(),
                characterRegistry: this.storyService.characterRegistry,
                currentCardIndex: this.storyService.currentCardIndex(),
                currentChoices: this.storyService.currentChoices(),
            }
        };

        if (existingIdx >= 0) {
            saves[existingIdx] = newSave;
        } else {
            saves.push(newSave);
        }

        this.saveSlots.set(saves);
            localStorage.setItem('quest_engine_saves', JSON.stringify(saves));
    }

    loadGame(slotId: number) {
        const slot = this.saveSlots().find(s => s.id === slotId);
        if (!slot) return;

        this.player.set(slot.data.player);
        this.playerName.set(slot.data.player.name);
        this.storyService.conversationHistory = slot.data.conversationHistory;
        this.storyService.history.set(slot.data.history);
        this.storyService.characterRegistry = slot.data.characterRegistry;
        this.storyService.currentCardIndex.set(slot.data.currentCardIndex);
        this.storyService.currentChoices.set(slot.data.currentChoices);
        this.isLoadedFromSave.set(true);
    }

    deleteSave(slotId: number) {
        const saves = this.saveSlots().filter(s => s.id !== slotId);
        this.saveSlots.set(saves);
        localStorage.setItem('quest_engine_saves', JSON.stringify(saves));
    }

    private loadSavesFromStorage(): SaveSlot[] {
        try {
            const raw = localStorage.getItem('quest_engine_saves');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
}