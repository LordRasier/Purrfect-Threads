import { describe, it, expect, vi } from 'vitest';
import { Box3, Group } from 'three';
import { makeCat, makeWorkshop, makeYarn, visibleCatCount } from '../src/scene/models';

describe('bounded original scene assets', () => {
  it('builds a recognizable volumetric cat with independently animated limbs', () => {
    const cat = makeCat(0);
    expect(cat.root).toBeInstanceOf(Group);
    expect(cat.paws).toHaveLength(2);
    expect(cat.tail).toBeDefined();
    const bounds = new Box3().setFromObject(cat.root);
    expect(bounds.max.y - bounds.min.y).toBeGreaterThan(1);
  });
  it('builds dimensional yarn with bounded geometry', () => {
    const yarn = makeYarn();
    expect(yarn.children.length).toBeLessThan(12);
    const bounds = new Box3().setFromObject(yarn);
    expect(bounds.max.x - bounds.min.x).toBeGreaterThan(2);
  });
  it('keeps a fresh workshop empty and reserves space for a selected companion', () => {
    expect(visibleCatCount(0)).toBe(0);
    expect(visibleCatCount(10000, false, true)).toBe(23);
    expect(visibleCatCount(10000, true, true)).toBe(11);
  });
  it('merges workshop details without BufferGeometry index warnings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      makeWorkshop();
      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
      warn.mockRestore();
    }
  });
  it('builds a decorated workshop with a bounded merged detail group', () => {
    const workshop = makeWorkshop();
    const details = workshop.getObjectByName('workshop-details');
    expect(details).toBeDefined();
    expect(details!.children.length).toBeLessThanOrEqual(8);
    const bounds = new Box3().setFromObject(workshop);
    expect(bounds.max.y).toBeGreaterThan(2.7);
  });
});
