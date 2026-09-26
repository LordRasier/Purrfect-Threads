import { describe, expect, it } from 'vitest';
import { Box3, Mesh, Vector3 } from 'three';
import { makeSleepingCloud } from '../src/scene/models';

describe('sleeping cloud decoration', () => {
  it('places a curled sleeping cat on a soft cloud with bounded draw calls', () => {
    const cloud = makeSleepingCloud();
    const cat = cloud.getObjectByName('sleeping-cat');
    expect(cat).toBeDefined();
    const size = new Box3().setFromObject(cat!).getSize(new Vector3());
    expect(size.x).toBeGreaterThan(size.y);
    expect(new Box3().setFromObject(cat!).min.y).toBeGreaterThan(0);
    let meshes = 0;
    cloud.traverse(node => { if (node instanceof Mesh) meshes++; });
    expect(meshes).toBeLessThanOrEqual(12);
  });
});
