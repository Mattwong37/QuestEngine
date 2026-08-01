import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const cache = new Map<string, string>();

export async function initStorage(keyLabels: string[]) {
    for (const key of keyLabels) {
        let { value } = await Preferences.get({ key: key });

        if (value === null) {
            const webData = localStorage.getItem(key);
            if (webData !== null) {
                await Preferences.set({ key: key, value: webData });
                value = webData;
            }
        }

        if (value !== null) cache.set(key, value);
    }
}

@Injectable({ providedIn: 'root' })

export class StorageService {
    getItem(key: string): string | null {
        return cache.get(key) ?? null;
    }

    setItem(key: string, value: string) {
        cache.set(key, value);
        void Preferences.set({ key, value });
    }

    removeItem(key: string) {
        cache.delete(key);
        void Preferences.remove({ key });
    }
}