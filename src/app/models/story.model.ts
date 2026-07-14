export interface Player {
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;

    maxHealth: number;
    currentHealth: number;

    maxMagic: number;
    currentMagic: number;

    defense: number;
    magicDefense: number;

    attackMin: number;
    attackMax: number;

    stamina: number;

    equipment: {
        mainHand: EquipmentItem | null;
        offHand: EquipmentItem | null;
        shoes: EquipmentItem | null;
        armor: EquipmentItem | null;
    };

    inventory: Item[];
    activeModifiers: StatModifier[];
    choiceHistory: string[];
}

export interface StatModifier {
    stat: string;
    value: number;
    turnsRemaining: number;
}

export type EquipmentSlot = 'mainHand' | 'offHand' | 'shoes' | 'armor';

export interface EquipmentBonus {
    attackMinBonus?: number;
    attackMaxBonus?: number;
    defenseBonus?: number;
    magicDefenseBonus?: number;
    staminaDrainReduction?: number;
    staminaRecoveryBonus?: number;
}

export interface EquipmentItem {
    id: string;
    name: string;
    description: string;
    slot: EquipmentSlot;
    bonus: EquipmentBonus;
}

export interface StatModifier {
    stat: string;
    value: number;
    turnsRemaining: number;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    effect?: StatModifier;
    permanent?: boolean;
}

export interface Choice {
    id: string;
    text: string;
    nextNodeId: string;
}

export interface StoryNode {
    id: string;
    sceneText: string;
    imagePrompt: string;
    choices: Choice[];
    isDialogue?: boolean;
}