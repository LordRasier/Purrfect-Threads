export class CozyAudio {
  private context?: AudioContext;
  private note = 0;
  play(volume: number, purchase = false): void {
    if (!volume) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
      const context = this.context;
      const notes = purchase ? [523.25, 659.25, 783.99] : [[392, 440, 523.25, 587.33, 659.25][this.note++ % 5]];
      notes.forEach((frequency, index) => {
        const start = context.currentTime + index * 0.055;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.96, start + 0.14);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.11 * volume, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.20);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(start); oscillator.stop(start + 0.22);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Audio is optional; browser/device policy must not stop play. */ }
  }
}
