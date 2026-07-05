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

    equippedWeapon: Weapon | null;
    inventory: Item[];
    activeModifiers: StatModifier[];
    choiceHistory: string[];
}

export interface StatModifier {
    stat: string;
    value: number;
    turnsRemaining: number;
}

export interface Weapon {
    name: string;
    attackMin: number;
    attackMax: number;
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