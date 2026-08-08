import { registerPlugin, Capacitor } from '@capacitor/core';

export interface WidgetPayload {
    playerName: string;
    sceneText: string;
    curHealth: number;
    maxHealth: number;
    curMana: number;
    maxMana: number;
    curLevel: number;
    xp: number;
    xpToNextLevel: number;
    stamina: number;
    defense: number;
    magicDefense: number;
    attackMin: number;
    attackMax: number;
}

interface WidgetBridgePlugin {
    sync(options: { payload: string }): Promise<void>;
}

const native = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export const WidgetBridge = {
    async sync(data: WidgetPayload) {
        const platform = Capacitor.getPlatform();
        if (platform !== 'ios' && platform !== 'android') return;        
        return native.sync({ payload: JSON.stringify(data) });
    }
};