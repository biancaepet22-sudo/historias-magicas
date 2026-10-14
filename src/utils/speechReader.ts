/**
 * Web Speech API text-to-speech reader for Spanish narration
 */

class SpeechReader {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private onStateChangeCallback: ((speaking: boolean, paused: boolean) => void) | null = null;

  public setCallback(cb: (speaking: boolean, paused: boolean) => void) {
    this.onStateChangeCallback = cb;
  }

  private notify() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.isSpeaking, this.isPaused);
    }
  }

  public speak(text: string) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown headings, bullets, asterisks for natural reading
    const cleanText = text
      .replace(/###/g, '')
      .replace(/####/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/🔹/g, '')
      .replace(/📖/g, '')
      .replace(/🛠️/g, '')
      .replace(/❓/g, '')
      .replace(/---/g, '')
      .trim();

    this.utterance = new SpeechSynthesisUtterance(cleanText);
    this.utterance.lang = 'es-ES';
    this.utterance.rate = 1.0;
    this.utterance.pitch = 0.95;

    // Pick Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
      this.utterance.voice = spanishVoice;
    }

    this.utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify();
    };

    this.utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.notify();
    };

    this.utterance.onerror = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.notify();
    };

    window.speechSynthesis.speak(this.utterance);
  }

  public pause() {
    if (!('speechSynthesis' in window)) return;
    if (this.isSpeaking && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (!('speechSynthesis' in window)) return;
    if (this.isSpeaking && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    this.isSpeaking = false;
    this.isPaused = false;
    this.notify();
  }

  public getState() {
    return { speaking: this.isSpeaking, paused: this.isPaused };
  }
}

export const speechReader = new SpeechReader();
