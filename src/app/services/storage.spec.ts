// @vitest-environment jsdom
import { initStorage, StorageService, clearCache } from './storage';

const { prefsGet, prefsSet, prefsRemove, secGet, secSet, secRemove } = vi.hoisted(() => ({
    prefsGet: vi.fn(),
    prefsSet: vi.fn(),
    prefsRemove: vi.fn(),
    secGet: vi.fn(),
    secSet: vi.fn(),
    secRemove: vi.fn()
}));

vi.mock('@capacitor/preferences', () => ({
    Preferences: { get: prefsGet, set: prefsSet, remove: prefsRemove }
}));

vi.mock('capacitor-secure-storage-plugin', () => ({
    SecureStoragePlugin: { get: secGet, set: secSet, remove: secRemove }
}));

describe('Storage', () => {
    let storage: StorageService;

    beforeEach(() => {
        clearCache();
        vi.clearAllMocks();
        prefsGet.mockResolvedValue({ value: null });
        secGet.mockRejectedValue(new Error('not found'));
        prefsSet.mockResolvedValue(undefined);
        prefsRemove.mockResolvedValue(undefined);
        secSet.mockResolvedValue(undefined);
        secRemove.mockResolvedValue(undefined);
        storage = new StorageService();
    });

    describe('Storage', () => {
        it('get from secure storage', async () => {
            secGet.mockResolvedValue({ value: 'sk-ant...' });
            await initStorage(['anthropic_key']);

            expect(secGet).toHaveBeenCalledWith({ key: 'anthropic_key' });
            expect(storage.getItem('anthropic_key')).toBe('sk-ant...');
        });

        it('get from preferences', async () => {
            prefsGet.mockResolvedValue({ value: '[]' });

            await initStorage(['quest_engine_saves']);

            expect(secGet).not.toHaveBeenCalled();
            expect(storage.getItem('quest_engine_saves')).toBe('[]');
        });

        it('get null when nothing', async () => {
            await initStorage(['anthropic_key']);
            expect(storage.getItem('anthropic_key')).toBeNull();
        });


        it('set secure storage', async () => {
            storage.setItem('anthropic_key', 'sk-ant...');

            expect(secSet).toHaveBeenCalledWith({ key: 'anthropic_key', value: 'sk-ant...' });
            expect(storage.getItem('anthropic_key')).toBe('sk-ant...');
        });


        it('set preference', async () => {
            storage.setItem('quest_engine_saves', '');

            expect(prefsSet).toHaveBeenCalledWith({ key: 'quest_engine_saves', value: ''});
        });

        it('remove from secure storage', async () => {
            storage.setItem('anthropic_key', 'sk-ant...');
            storage.removeItem('anthropic_key');

            expect(secRemove).toHaveBeenCalledWith({ key: 'anthropic_key'});
            expect(storage.getItem('anthropic_key')).toBeNull();
        });


        it('remove from preference', async () => {
            storage.removeItem('quest_engine_saves');

            expect(prefsRemove).toHaveBeenCalledWith({ key: 'quest_engine_saves' });
        });
    });
});