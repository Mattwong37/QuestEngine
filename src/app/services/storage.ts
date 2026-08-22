import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const cache = new Map<string, string>();
const SECRET_KEYS = new Set(['anthropic_key', 'openai_key']);

async function readSecret(key: string): Promise<string | null> {
    try {
        const { value } = await SecureStoragePlugin.get({ key });
        return value;
    } catch {
        return null;
    }
}

export async function initStorage(keyLabels: string[]) {
    for (const key of keyLabels) {
        const secret = SECRET_KEYS.has(key);
        let value = secret ? await readSecret(key) : (await Preferences.get({ key: key })).value;

        if (value === null) {
            const webData = (await Preferences.get({ key: key })).value ?? localStorage.getItem(key);
            if (webData) {
                if (secret) {
                    await SecureStoragePlugin.set({ key: key, value: webData });
                    await Preferences.remove({ key: key });
                }
                value = webData;
            }
        }

        if (value) cache.set(key, value);
    }
}

export async function clearCache() {
    cache.clear();
}

@Injectable({ providedIn: 'root' })

export class StorageService {
    getItem(key: string): string | null {
        return cache.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        cache.set(key, value);
        if (SECRET_KEYS.has(key)) {
            void SecureStoragePlugin.set({ key, value });
        } else {
            void Preferences.set({ key, value });
        }
    }

    removeItem(key: string) {
        cache.delete(key);
        if (SECRET_KEYS.has(key)) {
            void SecureStoragePlugin.remove({ key });
        } else {
            void Preferences.remove({ key });
        }
    }
}