import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class DarkMode {
    darkMode = signal<boolean>(false); 

    setDarkMode(status: boolean) {
        this.darkMode.set(status);
    }

    constructor() {
        effect(() => {
            const dark = this.darkMode();
            document.body.classList.toggle('dark-bg', dark);
            document.body.classList.toggle('light-bg', !dark);
        });
    }
}
