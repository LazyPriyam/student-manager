class SoundManager {
    private context: AudioContext | null = null;

    private getContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.context;
    }

    private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }

    playStart(pack: string = 'sound-chime') {
        switch (pack) {
            case 'sound-8bit':
                this.playTone(440, 'square', 0.1);
                this.playTone(880, 'square', 0.2, 0.1);
                break;
            case 'sound-nature':
                // Mimic a bird chirp (slide freq)
                const ctx = this.getContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.frequency.setValueAtTime(1200, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
                break;
            case 'sound-click':
                this.playTone(800, 'sine', 0.05);
                break;
            default: // sound-chime
                this.playTone(660, 'sine', 0.1);
                this.playTone(880, 'sine', 0.3, 0.1);
                break;
        }
    }

    playPause(pack: string = 'sound-chime') {
        switch (pack) {
            case 'sound-8bit':
                this.playTone(440, 'square', 0.2);
                this.playTone(220, 'square', 0.2, 0.2);
                break;
            case 'sound-click':
                this.playTone(400, 'sine', 0.05);
                break;
            default:
                this.playTone(440, 'sine', 0.3);
                break;
        }
    }

    playComplete(pack: string = 'sound-chime') {
        switch (pack) {
            case 'sound-8bit':
                // Victory fanfare
                [523, 659, 784, 1046, 784, 1046].forEach((freq, i) => {
                    this.playTone(freq, 'square', 0.15, i * 0.15);
                });
                break;
            case 'sound-nature':
                // Bird song
                [1500, 1800, 2000, 1500].forEach((freq, i) => {
                    this.playTone(freq, 'triangle', 0.1, i * 0.15);
                });
                break;
            default:
                // Standard fanfare
                this.playTone(523.25, 'sine', 0.2);       // C5
                this.playTone(659.25, 'sine', 0.2, 0.2);  // E5
                this.playTone(783.99, 'sine', 0.2, 0.4);  // G5
                this.playTone(1046.50, 'sine', 0.6, 0.6); // C6
                break;
        }
    }

    playClick(pack: string = 'sound-chime') {
        // Subtle UI click
        switch (pack) {
            case 'sound-8bit':
                this.playTone(200, 'square', 0.05);
                break;
            default:
                this.playTone(800, 'sine', 0.05);
                break;
        }
    }

    playHover(pack: string = 'sound-chime') {
        // Very short, high freq tick
        switch (pack) {
            case 'sound-8bit':
                this.playTone(1200, 'square', 0.01);
                break;
            default:
                this.playTone(2000, 'sine', 0.01);
                break;
        }
    }

    playToggle(isOn: boolean, pack: string = 'sound-chime') {
        // Two-tone: Up for ON, Down for OFF
        if (isOn) {
            switch (pack) {
                case 'sound-8bit':
                    this.playTone(440, 'square', 0.1);
                    this.playTone(880, 'square', 0.1, 0.1);
                    break;
                default:
                    this.playTone(600, 'sine', 0.1);
                    this.playTone(800, 'sine', 0.1, 0.1);
                    break;
            }
        } else {
            switch (pack) {
                case 'sound-8bit':
                    this.playTone(880, 'square', 0.1);
                    this.playTone(440, 'square', 0.1, 0.1);
                    break;
                default:
                    this.playTone(800, 'sine', 0.1);
                    this.playTone(600, 'sine', 0.1, 0.1);
                    break;
            }
        }
    }
}

export const soundManager = new SoundManager();
