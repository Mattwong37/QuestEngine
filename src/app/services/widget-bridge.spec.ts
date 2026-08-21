import { TestBed } from '@angular/core/testing';
import { WidgetPayload, WidgetBridge } from './widget-bridge'
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { syncMock, getPlatformMock } = vi.hoisted(() => ({
  syncMock: vi.fn(),
  getPlatformMock: vi.fn()
}));

vi.mock('@capacitor/core', () => ({
  registerPlugin: () => ({ sync: syncMock }),
  Capacitor: { getPlatform: () => getPlatformMock() }
}));

const payload: WidgetPayload = {
  playerName: 'test',
  sceneText: '',
  curHealth: 0,
  maxHealth: 0,
  curMana: 0,
  maxMana: 0,
  curLevel: 0,
  xp: 0,
  xpToNextLevel: 0,
  stamina: 0,
  defense: 0,
  magicDefense: 0,
  attackMin: 0,
  attackMax: 0
};

describe('WidgetBridge', () => {

  beforeEach(() => {
    syncMock.mockClear();
  });

  it('ignore non ios and android', async () => {
    getPlatformMock.mockReturnValue('web');
    await WidgetBridge.sync(payload);
    expect(syncMock).not.toHaveBeenCalled();
  });

    it('ignore non ios and android', async () => {
    getPlatformMock.mockReturnValue('web');
    await WidgetBridge.sync(payload);
    expect(syncMock).not.toHaveBeenCalled();
  });

  it('respond to ios', async () => {
    getPlatformMock.mockReturnValue('ios');
    await WidgetBridge.sync(payload);
    expect(syncMock).toHaveBeenCalledWith({ payload: JSON.stringify(payload) });
  });
  
  it('respond to android', async () => {
    getPlatformMock.mockReturnValue('ios');
    await WidgetBridge.sync(payload);
    expect(syncMock).toHaveBeenCalledWith({ payload: JSON.stringify(payload) });
  });

});
