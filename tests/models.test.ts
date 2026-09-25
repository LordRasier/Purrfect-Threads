import { describe, it, expect } from 'vitest';
import { Box3, Group } from 'three';
import { makeCat, makeYarn, visibleCatCount } from '../src/scene/models';

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
  it('shows a mascot even at zero production and never more than 24 cats', () => {
    expect(visibleCatCount(0)).toBe(1);
    expect(visibleCatCount(10000)).toBe(24);
    expect(visibleCatCount(10000, true)).toBeLessThanOrEqual(12);
  });
});
