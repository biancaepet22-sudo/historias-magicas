/**
 * Procedural Web Audio Engine for Multiverse Adventure
 * Zero external audio assets needed - completely reliable and offline capable.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private ambientVolume: number = 0.4;
  private sfxVolume: number = 0.6;
  private currentGenre: 'mystery' | 'scifi' | 'fantasy' | null = null;
  private activeAmbientNodes: { stop: () => void }[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(muted ? 0 : this.ambientVolume, this.ctx.currentTime, 0.1);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(muted ? 0 : this.sfxVolume, this.ctx.currentTime, 0.1);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx && !this.isMuted) {
      this.ambientGain.gain.setTargetAtTime(this.ambientVolume, this.ctx.currentTime, 0.1);
    }
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public stopAmbient() {
    this.activeAmbientNodes.forEach(n => {
      try {
        n.stop();
      } catch {
        // ignore
      }
    });
    this.activeAmbientNodes = [];
    this.currentGenre = null;
  }

  public playGenreAmbient(genre: 'mystery' | 'scifi' | 'fantasy') {
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;
    if (this.currentGenre === genre && this.activeAmbientNodes.length > 0) return;

    this.stopAmbient();
    this.currentGenre = genre;

    if (genre === 'mystery') {
      this.startNoirMysteryAmbient();
    } else if (genre === 'scifi') {
      this.startCyberpunkAmbient();
    } else {
      this.startDarkFantasyAmbient();
    }
  }

  // --- GENRE 1: Noir Mystery (Rain + Warm Low Drone + Vinyl Crackle) ---
  private startNoirMysteryAmbient() {
    if (!this.ctx || !this.ambientGain) return;
    const ctx = this.ctx;

    // 1. Rain noise generator
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Pink noise approximation
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(800, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.2, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.ambientGain);
    rainSource.start();

    // 2. Slow warm drone (Dm / F moody low frequency)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(73.42, ctx.currentTime); // D2

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(250, ctx.currentTime);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.12, ctx.currentTime);

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.ambientGain);
    osc1.start();
    osc2.start();

    this.activeAmbientNodes.push({
      stop: () => {
        rainSource.stop();
        osc1.stop();
        osc2.stop();
      },
    });
  }

  // --- GENRE 2: Sci-Fi / Cyberpunk (Sub-bass + resonant filter sweep + electronic pulse) ---
  private startCyberpunkAmbient() {
    if (!this.ctx || !this.ambientGain) return;
    const ctx = this.ctx;

    const subOsc = ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(55, ctx.currentTime); // A1

    const subOsc2 = ctx.createOscillator();
    subOsc2.type = 'sine';
    subOsc2.frequency.setValueAtTime(82.41, ctx.currentTime); // E2

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, ctx.currentTime);
    filter.Q.setValueAtTime(4, ctx.currentTime);

    // LFO for filter pulsing
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // slow pulse
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(120, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const sciGain = ctx.createGain();
    sciGain.gain.setValueAtTime(0.14, ctx.currentTime);

    subOsc.connect(filter);
    subOsc2.connect(filter);
    filter.connect(sciGain);
    sciGain.connect(this.ambientGain);

    subOsc.start();
    subOsc2.start();
    lfo.start();

    this.activeAmbientNodes.push({
      stop: () => {
        subOsc.stop();
        subOsc2.stop();
        lfo.stop();
      },
    });
  }

  // --- GENRE 3: High / Dark Fantasy (Mystic wind + ethereal fifths) ---
  private startDarkFantasyAmbient() {
    if (!this.ctx || !this.ambientGain) return;
    const ctx = this.ctx;

    const pad1 = ctx.createOscillator();
    pad1.type = 'sine';
    pad1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3

    const pad2 = ctx.createOscillator();
    pad2.type = 'sine';
    pad2.frequency.setValueAtTime(196.0, ctx.currentTime); // G3 (perfect fifth)

    const pad3 = ctx.createOscillator();
    pad3.type = 'triangle';
    pad3.frequency.setValueAtTime(329.63, ctx.currentTime); // E4 (mystical minor feel)

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const fantasyGain = ctx.createGain();
    fantasyGain.gain.setValueAtTime(0.1, ctx.currentTime);

    pad1.connect(filter);
    pad2.connect(filter);
    pad3.connect(filter);
    filter.connect(fantasyGain);
    fantasyGain.connect(this.ambientGain);

    pad1.start();
    pad2.start();
    pad3.start();

    this.activeAmbientNodes.push({
      stop: () => {
        pad1.stop();
        pad2.stop();
        pad3.stop();
      },
    });
  }

  // --- SOUND EFFECTS (SFX) ---
  public playSelectSound() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  public playChapterAdvance() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const ctx = this.ctx;

    const chords = [261.63, 329.63, 392.0, 523.25]; // C major chord chime
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + 0.95);
    });
  }

  public playDiceRoll() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const ctx = this.ctx;

    const count = 5;
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 200, ctx.currentTime + i * 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.05);
    }
  }

  public playStinger(type: 'success' | 'danger') {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type === 'success' ? 'sine' : 'sawtooth';

    if (type === 'success') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    } else {
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }
}

export const audioEngine = new AudioEngine();
