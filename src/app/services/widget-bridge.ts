import { registerPlugin, Capacitor } from '@capacitor/core';

interface WidgetBridgePlugin {
    sync(options: { payload: string }): Promise<void>;
}

const native = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export const WidgetBridge = {
    async sync(data: { playerName: string; sceneText: string }) {
    if (Capacitor.getPlatform() !== 'ios') return;
    return native.sync({ payload: JSON.stringify(data) });
    }
};