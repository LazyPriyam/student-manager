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
        const ctx = this.getContext();
        const now = ctx.currentTime;

        switch (pack) {
            case 'sound-8bit':
                this.playTone(440, 'square', 0.1);
                this.playTone(880, 'square', 0.2, 0.1);
                break;
            case 'sound-nature':
                // Bird chirp
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(now + 0.1);
                break;
            case 'sound-click':
                this.playTone(800, 'sine', 0.05);
                break;
            case 'sound-water':
                // Droplet sound (sine sweep down)
                const wOsc = ctx.createOscillator();
                const wGain = ctx.createGain();
                wOsc.frequency.setValueAtTime(1200, now);
                wOsc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                wGain.gain.setValueAtTime(0.1, now);
                wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                wOsc.connect(wGain);
                wGain.connect(ctx.destination);
                wOsc.start();
                wOsc.stop(now + 0.15);
                break;
            case 'sound-type':
                // Typewriter clack (short noise burst)
                const bufferSize = ctx.sampleRate * 0.05; // 50ms
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const nGain = ctx.createGain();
                nGain.gain.setValueAtTime(0.1, now);
                nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                noise.connect(nGain);
                nGain.connect(ctx.destination);
                noise.start();
                break;
            case 'sound-scifi':
                // Pew pew
                const sOsc = ctx.createOscillator();
                const sGain = ctx.createGain();
                sOsc.type = 'sawtooth';
                sOsc.frequency.setValueAtTime(800, now);
                sOsc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
                sGain.gain.setValueAtTime(0.05, now);
                sGain.gain.linearRampToValueAtTime(0, now + 0.2);
                sOsc.connect(sGain);
                sGain.connect(ctx.destination);
                sOsc.start();
                sOsc.stop(now + 0.2);
                break;
            case 'sound-zen':
                // Gong/Bell
                this.playTone(300, 'triangle', 1.5); // Long sustain
                break;
            case 'sound-piano':
                // Piano C4
                this.playTone(261.63, 'sine', 0.5);
                break;
            case 'sound-orch':
                // Orchestral Swell
                this.playTone(200, 'sawtooth', 0.5);
                this.playTone(300, 'sine', 0.5);
                break;
            case 'sound-robot':
                // Robot glitch
                this.playTone(200, 'square', 0.05);
                this.playTone(400, 'square', 0.05, 0.05);
                this.playTone(100, 'square', 0.05, 0.1);
                break;
            case 'sound-meow':
                // Meow (triangle sweep up then down)
                const mOsc = ctx.createOscillator();
                const mGain = ctx.createGain();
                mOsc.type = 'triangle';
                mOsc.frequency.setValueAtTime(400, now);
                mOsc.frequency.linearRampToValueAtTime(800, now + 0.1);
                mOsc.frequency.linearRampToValueAtTime(600, now + 0.3);
                mGain.gain.setValueAtTime(0.1, now);
                mGain.gain.linearRampToValueAtTime(0, now + 0.3);
                mOsc.connect(mGain);
                mGain.connect(ctx.destination);
                mOsc.start();
                mOsc.stop(now + 0.3);
                break;
            case 'sound-drum':
                // Drum hit
                this.playTone(100, 'square', 0.1);
                break;
            case 'sound-epic':
                // Choir-ish
                this.playTone(400, 'sine', 1);
                this.playTone(600, 'sine', 1);
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
            case 'sound-water':
                this.playTone(300, 'sine', 0.2);
                break;
            case 'sound-type':
                this.playTone(100, 'square', 0.05);
                break;
            case 'sound-scifi':
                this.playTone(200, 'sawtooth', 0.3);
                break;
            case 'sound-zen':
                this.playTone(200, 'triangle', 0.5);
                break;
            case 'sound-piano':
                this.playTone(220, 'sine', 0.3);
                break;
            case 'sound-orch':
                this.playTone(150, 'sawtooth', 0.4);
                break;
            case 'sound-robot':
                this.playTone(100, 'square', 0.1);
                this.playTone(50, 'square', 0.1, 0.1);
                break;
            case 'sound-meow':
                this.playTone(300, 'triangle', 0.2);
                break;
            case 'sound-drum':
                this.playTone(80, 'square', 0.1);
                break;
            case 'sound-epic':
                this.playTone(200, 'sine', 0.5);
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
            case 'sound-water':
                [800, 1000, 1200, 800].forEach((freq, i) => {
                    this.playTone(freq, 'sine', 0.1, i * 0.1);
                });
                break;
            case 'sound-type':
                [400, 500, 600, 800].forEach((freq, i) => {
                    this.playTone(freq, 'square', 0.05, i * 0.05);
                });
                break;
            case 'sound-scifi':
                [800, 1200, 1500, 2000].forEach((freq, i) => {
                    this.playTone(freq, 'sawtooth', 0.1, i * 0.1);
                });
                break;
            case 'sound-zen':
                this.playTone(440, 'triangle', 2.0);
                this.playTone(554, 'triangle', 2.0, 0.2);
                this.playTone(659, 'triangle', 2.0, 0.4);
                break;
            case 'sound-piano':
                [261, 329, 392, 523].forEach((freq, i) => {
                    this.playTone(freq, 'sine', 0.4, i * 0.2);
                });
                break;
            case 'sound-orch':
                this.playTone(261, 'sawtooth', 1.0);
                this.playTone(329, 'sawtooth', 1.0);
                this.playTone(392, 'sawtooth', 1.0);
                break;
            case 'sound-robot':
                [200, 400, 300, 500, 800].forEach((freq, i) => {
                    this.playTone(freq, 'square', 0.05, i * 0.05);
                });
                break;
            case 'sound-meow':
                this.playTone(600, 'triangle', 0.2);
                this.playTone(800, 'triangle', 0.2, 0.1);
                this.playTone(1000, 'triangle', 0.3, 0.2);
                break;
            case 'sound-drum':
                [100, 100, 100, 200].forEach((freq, i) => {
                    this.playTone(freq, 'square', 0.1, i * 0.1);
                });
                break;
            case 'sound-epic':
                this.playTone(261, 'sine', 2.0);
                this.playTone(392, 'sine', 2.0);
                this.playTone(523, 'sine', 2.0);
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
            case 'sound-water':
                this.playTone(600, 'sine', 0.05);
                break;
            case 'sound-type':
                this.playTone(800, 'square', 0.02);
                break;
            case 'sound-scifi':
                this.playTone(1200, 'sawtooth', 0.05);
                break;
            case 'sound-zen':
                this.playTone(400, 'triangle', 0.1);
                break;
            case 'sound-piano':
                this.playTone(523, 'sine', 0.1);
                break;
            case 'sound-orch':
                this.playTone(300, 'sawtooth', 0.05);
                break;
            case 'sound-robot':
                this.playTone(100, 'square', 0.02);
                break;
            case 'sound-meow':
                this.playTone(800, 'triangle', 0.05);
                break;
            case 'sound-drum':
                this.playTone(200, 'square', 0.05);
                break;
            case 'sound-epic':
                this.playTone(300, 'sine', 0.1);
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
            case 'sound-water':
                this.playTone(1000, 'sine', 0.01);
                break;
            case 'sound-type':
                this.playTone(1500, 'square', 0.005);
                break;
            case 'sound-scifi':
                this.playTone(2000, 'sawtooth', 0.01);
                break;
            case 'sound-zen':
                this.playTone(800, 'triangle', 0.02);
                break;
            case 'sound-piano':
                this.playTone(1046, 'sine', 0.02);
                break;
            case 'sound-orch':
                this.playTone(800, 'sawtooth', 0.01);
                break;
            case 'sound-robot':
                this.playTone(2000, 'square', 0.005);
                break;
            case 'sound-meow':
                this.playTone(1200, 'triangle', 0.01);
                break;
            case 'sound-drum':
                this.playTone(400, 'square', 0.01);
                break;
            case 'sound-epic':
                this.playTone(600, 'sine', 0.02);
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
                case 'sound-water':
                    this.playTone(400, 'sine', 0.1);
                    this.playTone(600, 'sine', 0.1, 0.1);
                    break;
                case 'sound-type':
                    this.playTone(600, 'square', 0.05);
                    this.playTone(800, 'square', 0.05, 0.05);
                    break;
                case 'sound-scifi':
                    this.playTone(800, 'sawtooth', 0.1);
                    this.playTone(1200, 'sawtooth', 0.1, 0.1);
                    break;
                case 'sound-zen':
                    this.playTone(300, 'triangle', 0.2);
                    this.playTone(400, 'triangle', 0.2, 0.2);
                    break;
                case 'sound-piano':
                    this.playTone(261, 'sine', 0.15);
                    this.playTone(329, 'sine', 0.15, 0.15);
                    break;
                case 'sound-orch':
                    this.playTone(200, 'sawtooth', 0.2);
                    this.playTone(300, 'sawtooth', 0.2, 0.2);
                    break;
                case 'sound-robot':
                    this.playTone(200, 'square', 0.05);
                    this.playTone(400, 'square', 0.05, 0.05);
                    break;
                case 'sound-meow':
                    this.playTone(400, 'triangle', 0.1);
                    this.playTone(600, 'triangle', 0.1, 0.1);
                    break;
                case 'sound-drum':
                    this.playTone(100, 'square', 0.1);
                    this.playTone(200, 'square', 0.1, 0.1);
                    break;
                case 'sound-epic':
                    this.playTone(300, 'sine', 0.2);
                    this.playTone(400, 'sine', 0.2, 0.2);
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
                case 'sound-water':
                    this.playTone(600, 'sine', 0.1);
                    this.playTone(400, 'sine', 0.1, 0.1);
                    break;
                case 'sound-type':
                    this.playTone(800, 'square', 0.05);
                    this.playTone(600, 'square', 0.05, 0.05);
                    break;
                case 'sound-scifi':
                    this.playTone(1200, 'sawtooth', 0.1);
                    this.playTone(800, 'sawtooth', 0.1, 0.1);
                    break;
                case 'sound-zen':
                    this.playTone(400, 'triangle', 0.2);
                    this.playTone(300, 'triangle', 0.2, 0.2);
                    break;
                case 'sound-piano':
                    this.playTone(329, 'sine', 0.15);
                    this.playTone(261, 'sine', 0.15, 0.15);
                    break;
                case 'sound-orch':
                    this.playTone(300, 'sawtooth', 0.2);
                    this.playTone(200, 'sawtooth', 0.2, 0.2);
                    break;
                case 'sound-robot':
                    this.playTone(400, 'square', 0.05);
                    this.playTone(200, 'square', 0.05, 0.05);
                    break;
                case 'sound-meow':
                    this.playTone(600, 'triangle', 0.1);
                    this.playTone(400, 'triangle', 0.1, 0.1);
                    break;
                case 'sound-drum':
                    this.playTone(200, 'square', 0.1);
                    this.playTone(100, 'square', 0.1, 0.1);
                    break;
                case 'sound-epic':
                    this.playTone(400, 'sine', 0.2);
                    this.playTone(300, 'sine', 0.2, 0.2);
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
