import { describe, expect, it, vi } from 'vitest';
import { FallingCat } from '../src/ui/falling-cat';
import { createGame, grantBonus } from '../src/game/engine';

describe('FallingCat', () => {
  it('spawns only after 60–120 seconds of eligible workshop time and pauses while ineligible', () => {
    const cat = new FallingCat(null, vi.fn(), () => 0);
    cat.update(0, true, false);
    cat.update(59.9, true, false);
    expect(cat.visible).toBe(false);
    cat.update(600, false, false);
    expect(cat.visible).toBe(false);
    cat.update(0.1, true, false);
    expect(cat.visible).toBe(true);
  });

  it('grants exactly one fixed +5 reward immediately, then waits for the exit before rescheduling', () => {
    const claim = vi.fn();
    const cat = new FallingCat(null, claim, () => 0);
    cat.update(60, true, false);
    cat.claim(); cat.claim();
    expect(claim).toHaveBeenCalledTimes(1);
    expect(claim).toHaveBeenCalledWith(5);
    expect(cat.visible).toBe(false);
    cat.update(59.9, true, false);
    expect(cat.visible).toBe(false);
    cat.update(0.6, true, false);
    cat.update(60, true, false);
    expect(cat.visible).toBe(true);
  });

  it('fades out from its current entrance opacity when caught immediately', () => {
    const cat = new FallingCat(null, vi.fn(), () => 0);
    cat.update(60, true, false);
    cat.update(0.14, true, false);
    cat.claim();
    expect((cat as unknown as { exitStartOpacity: number }).exitStartOpacity).toBeCloseTo(0.5);
  });

  it('keeps an expiring cat in its short visual exit, then schedules the next one', () => {
    const cat = new FallingCat(null, vi.fn(), () => 0);
    cat.update(60, true, false);
    cat.update(8, true, false);
    expect(cat.visible).toBe(false);
    cat.update(0.49, true, false);
    cat.update(60, true, false);
    expect(cat.visible).toBe(false);
    cat.update(0.02, true, false);
    cat.update(60, true, false);
    expect(cat.visible).toBe(true);
  });

  it('expires after eight seconds and respects reduced motion', () => {
    const cat = new FallingCat(null, vi.fn(), () => 0);
    cat.update(60, true, true);
    expect(cat.visible).toBe(true);
    expect(cat.reducedMotion).toBe(true);
    cat.update(7.99, true, true); expect(cat.visible).toBe(true);
    cat.update(0.01, true, true); expect(cat.visible).toBe(false);
  });
});


describe('fixed active-event rewards', () => {
  it('adds exactly five earned yarn without incrementing manual taps', () => {
    const game = createGame(0);
    expect(grantBonus(game).toNumber()).toBe(5);
    expect(game.yarn.toNumber()).toBe(5);
    expect(game.lifetime.toNumber()).toBe(5);
    expect(game.runEarned.toNumber()).toBe(5);
    expect(game.stats.taps).toBe(0);
  });
});
