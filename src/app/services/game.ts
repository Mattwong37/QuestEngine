import { Injectable, signal, inject, computed } from '@angular/core';
import { Player, EquipmentItem, EquipmentSlot } from '../models/story.model';
import { StoryService } from './story';
import { StorageService } from './storage';
import { WidgetBridge } from './widget-bridge';
import { TestBed } from '@angular/core/testing';

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
    equipmentSlots: EquipmentSlot[] = ['mainHand', 'offHand', 'shoes', 'armor'];

    private storage = inject(StorageService);

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

        attackMin: 1,
        attackMax: 5,

        stamina: 100,

        equipment: { mainHand: null, offHand: null, shoes: null, armor: null },

        inventory: [],
        activeModifiers: [],
        choiceHistory: [],
    });

    effectiveStats = computed(() => this.computeEffectiveStats(this.player()));
    
    saveSlots = signal<SaveSlot[]>(this.loadSavesFromStorage());

    initPlayer(name: string) {
        this.player.update(p => ({ ...p, name }));
        this.playerName.set(name);
    }

    saveGame(slotId: number, saveName: string) {
        const saves = [...this.saveSlots()];
        const existingIdx = saves.findIndex(s => s.id === slotId);

        const history = this.storyService.history().map(entry => ({
            ...entry,
            imageUrl: ''
        }));
        
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
                history: history,
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
        this.storage.setItem('quest_engine_saves', JSON.stringify(saves));
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
        this.storage.setItem('quest_engine_saves', JSON.stringify(saves));
    }

    computeEffectiveStats(p: Player) {
        const items = Object.values(p.equipment).filter((i): i is EquipmentItem => i !== null);
        const totals = items.reduce((acc, item) => ({
            attackMin: acc.attackMin + (item.bonus.attackMinBonus ?? 0),
            attackMax: acc.attackMax + (item.bonus.attackMaxBonus ?? 0),
            defense: acc.defense + (item.bonus.defenseBonus ?? 0),
            magicDefense: acc.magicDefense + (item.bonus.magicDefenseBonus ?? 0),
            staminaDrainReduction: acc.staminaDrainReduction + (item.bonus.staminaDrainReduction ?? 0),
            staminaRecoveryBonus: acc.staminaRecoveryBonus + (item.bonus.staminaRecoveryBonus ?? 0),
        }), { attackMin: 0, attackMax: 0, defense: 0, magicDefense: 0, staminaDrainReduction: 0, staminaRecoveryBonus: 0 });

        return {
            attackMin: p.attackMin + totals.attackMin,
            attackMax: p.attackMax + totals.attackMax,
            defense: p.defense + totals.defense,
            magicDefense: p.magicDefense + totals.magicDefense,
            staminaDrainReduction: totals.staminaDrainReduction,
            staminaRecoveryBonus: totals.staminaRecoveryBonus,
        };
    }

    equipItem(item: EquipmentItem) {
        this.player.update(p => ({
            ...p,
            equipment: { ...p.equipment, [item.slot]: item },
        }));
    }

    applyStatsUpdate(update: any) {
        if (!update) return;

        this.player.update(p => {
            const equipBonus = this.computeEffectiveStats(p);
            const rawStaminaChange = update.staminaChange ?? 0;
            let staminaChange = rawStaminaChange;
            if (rawStaminaChange < 0) {
                staminaChange = Math.min(0, rawStaminaChange + equipBonus.staminaDrainReduction);
            } else if (rawStaminaChange > 0) {
                staminaChange = rawStaminaChange + equipBonus.staminaRecoveryBonus;
            }
            const newStamina = Math.max(0, Math.min(100, p.stamina + staminaChange));
            let newXp = p.xp + (update.xpGain ?? 0);
            let newLevel = p.level;
            let newXpToNext = p.xpToNextLevel;
            let newMaxHealth = p.maxHealth;
            let newMaxMagic = p.maxMagic;
            let newDefense = p.defense + (update.defenseChange ?? 0);
            let newMagicDefense = p.magicDefense + (update.magicDefenseChange ?? 0);
            let newAttackMin = p.attackMin + (update.attackMinChange ?? 0);
            let newAttackMax = p.attackMax + (update.attackMaxChange ?? 0);
            let newHealth = Math.max(0, Math.min(p.maxHealth, p.currentHealth + (update.healthChange ?? 0)));
            let newMagic = Math.max(0, Math.min(p.maxMagic, p.currentMagic + (update.magicChange ?? 0)));

            if (newXp >= newXpToNext) {
                newLevel += 1;
                newXp = newXp - newXpToNext;
                newXpToNext = Math.floor(newXpToNext * 1.25);
                newMaxHealth += 5;
                newMaxMagic += 5;
                newDefense += 2;
                newMagicDefense += 2;
                newAttackMin += Math.random() >= 0.5 ? 1 : 2;
                newAttackMax += 2;
                update.levelUp = true;
                newHealth = Math.min(newMaxHealth, newHealth + 5);
                newMagic = Math.min(newMaxMagic, newMagic + 5);
            }

            return {
                ...p,
                currentHealth: newHealth,
                currentMagic: newMagic,
                stamina: newStamina,
                xp: newXp,
                xpToNextLevel: newXpToNext,
                level: newLevel,
                maxHealth: newMaxHealth,
                maxMagic: newMaxMagic,
                defense: newDefense,
                magicDefense: newMagicDefense,
                attackMin: newAttackMin,
                attackMax: newAttackMax,
            };
        });

        const p = this.player(); 
        const bonuses = this.effectiveStats();
        WidgetBridge.sync({
            playerName: p.name,
            sceneText: this.storyService.currentScene(),
            curHealth: p.currentHealth,
            maxHealth: p.maxHealth,
            curMana: p.currentMagic,
            maxMana: p.maxMagic,
            curLevel: p.level,
            xp: p.xp,
            xpToNextLevel: p.xpToNextLevel,
            stamina: p.stamina,
            defense: bonuses.defense,
            magicDefense: bonuses.magicDefense,
            attackMin: bonuses.attackMin,
            attackMax: bonuses.attackMax
            
        });
    }

    private loadSavesFromStorage(): SaveSlot[] {
        try {
            const raw = this.storage.getItem('quest_engine_saves');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
}