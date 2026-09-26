import { describe, expect, it, vi } from 'vitest';
import { CozyAudio } from '../src/audio';

class FakeParam {
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}
class FakeOscillator {
  type = 'sine';
  frequency = new FakeParam();
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}
class FakeFilter {
  type = 'bandpass';
  Q = new FakeParam();
  frequency = new FakeParam();
  connect = vi.fn();
  disconnect = vi.fn();
}
class FakeGain {
  gain = new FakeParam();
  connect = vi.fn();
  disconnect = vi.fn();
}
class FakeAudioContext {
  currentTime = 1;
  state = 'running';
  destination = {} as AudioDestinationNode;
  oscillators: FakeOscillator[] = [];
  createOscillator() { const oscillator = new FakeOscillator(); this.oscillators.push(oscillator); return oscillator as unknown as OscillatorNode; }
  createBiquadFilter() { return new FakeFilter() as unknown as BiquadFilterNode; }
  createGain() { return new FakeGain() as unknown as GainNode; }
  resume = vi.fn().mockResolvedValue(undefined);
}

describe('CozyAudio.playMeow', () => {
  it('does nothing while muted', () => {
    const context = new FakeAudioContext();
    vi.stubGlobal('AudioContext', class { constructor() { return context; } });
    new CozyAudio().playMeow(0);
    expect(context.oscillators).toHaveLength(0);
    vi.unstubAllGlobals();
  });

  it('synthesizes a two-syllable meow without using the purchase chime', () => {
    const context = new FakeAudioContext();
    vi.stubGlobal('AudioContext', class { constructor() { return context; } });
    new CozyAudio().playMeow(0.5);
    expect(context.oscillators).toHaveLength(2);
    expect(context.oscillators.every(oscillator => oscillator.start.mock.calls.length === 1 && oscillator.stop.mock.calls.length === 1)).toBe(true);
    expect(context.oscillators[0].frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(720, expect.any(Number));
    expect(context.oscillators[1].frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(260, expect.any(Number));
    vi.unstubAllGlobals();
  });
});
