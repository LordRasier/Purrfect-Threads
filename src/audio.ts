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
      notes.forEach((frequency, index) => this.playTone(context, frequency, context.currentTime + index * 0.055, 0.20, 0.11 * volume));
    } catch { /* Audio is optional; browser/device policy must not stop play. */ }
  }

  /** A two-syllable, synthesized me-ow used only for catching the parachute cat. */
  playMeow(volume: number): void {
    if (!volume) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
      const context = this.context;
      const start = context.currentTime;
      this.playMeowSyllable(context, 520, start, 0.16, 0.09 * volume, 720, 980, 1_400);
      this.playMeowSyllable(context, 480, start + 0.13, 0.30, 0.10 * volume, 260, 1_150, 560);
    } catch { /* Audio is optional; browser/device policy must not stop play. */ }
  }

  private playMeowSyllable(context: AudioContext, frequency: number, start: number, duration: number, level: number, endFrequency: number, formantStart: number, formantEnd: number): void {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration * 0.82);
    filter.type = 'bandpass'; filter.Q.setValueAtTime(5, start);
    filter.frequency.setValueAtTime(formantStart, start);
    filter.frequency.exponentialRampToValueAtTime(formantEnd, start + duration * 0.82);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter); filter.connect(gain); gain.connect(context.destination);
    oscillator.start(start); oscillator.stop(start + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  private playTone(context: AudioContext, frequency: number, start: number, duration: number, level: number, endFrequency = frequency * 0.96): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration * 0.82);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(start); oscillator.stop(start + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}
