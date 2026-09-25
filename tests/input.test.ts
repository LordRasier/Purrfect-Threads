import { describe, expect, it } from 'vitest';
import { HoldInput } from '../src/game/input';

describe('frame-independent held input', () => {
  it('produces the same scheduled taps across high and very low frame rates', () => {
    for (const fps of [1, 3, 30, 60, 144]) {
      const times: number[] = [];
      const input = new HoldInput(time => times.push(time));
      input.press('keyboard', 0);
      for (let t = 1000 / fps; t < 3300; t += 1000 / fps) input.flush(t);
      input.release('keyboard', 3300);
      expect(times).toEqual(Array.from({ length: 17 }, (_, i) => i * 200));
    }
  });
  it('combines input sources without exceeding five actions per second', () => {
    const times: number[] = [], input = new HoldInput(time => times.push(time));
    input.press('pointer', 0); input.press('keyboard', 100);
    input.release('pointer', 400); input.flush(600); input.release('keyboard', 700);
    input.flush(5000);
    expect(times).toEqual([0, 200, 400, 600]);
  });
  it('cancels on focus loss without producing background actions', () => {
    const times: number[] = [], input = new HoldInput(time => times.push(time));
    input.press('pointer', 0); input.cancel(); input.flush(10000);
    expect(times).toEqual([0]);
  });
});
