// A generated two-tone ringtone, with a visual ring supplied by BedroomScene.
// Browsers may suspend audio until the first user gesture; no audio files needed.
export class PhoneRing {
  start() {
    this.active = true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      this.context = new AudioContext();
      this.unlock = () => {
        if (this.active) this.context.resume().catch(() => {});
      };
      window.addEventListener('pointerdown', this.unlock, true);
      window.addEventListener('keydown', this.unlock, true);
      const pulse = () => {
        if (!this.active || this.context.state !== 'running' || document.hidden) return;
        const now = this.context.currentTime;
        for (const offset of [0, 0.22]) {
          const gain = this.context.createGain();
          gain.gain.setValueAtTime(0, now + offset);
          gain.gain.linearRampToValueAtTime(0.035, now + offset + 0.01);
          gain.gain.linearRampToValueAtTime(0, now + offset + 0.17);
          gain.connect(this.context.destination);
          for (const frequency of [660, 880]) {
            const oscillator = this.context.createOscillator();
            oscillator.frequency.value = frequency;
            oscillator.connect(gain);
            oscillator.start(now + offset); oscillator.stop(now + offset + 0.18);
          }
        }
      };
      pulse(); this.timer = window.setInterval(pulse, 1600);
    } catch { /* Visual ringing remains available without Web Audio. */ }
  }
  stop() {
    this.active = false;
    window.clearInterval(this.timer);
    if (this.unlock) {
      window.removeEventListener('pointerdown', this.unlock, true);
      window.removeEventListener('keydown', this.unlock, true);
    }
    if (this.context && this.context.state !== 'closed') this.context.close().catch(() => {});
  }
}
