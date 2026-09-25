import { describe, expect, it, vi } from 'vitest';
import { Box3 } from 'three';
import { OLYMPIAN_IDS, createOlympianStatues, disposeOlympusAssets, olympusRendererFactory, OlympusWorld, setOlympianOwned } from '../src/scene/olympus';

describe('Olympian statue factory', () => {
  it('constructs twelve bounded 3D cat gods with distinct named accessories', () => {
    const assets = createOlympianStatues(new Set(['welcome', 'zeus']));
    expect(OLYMPIAN_IDS).toEqual(['welcome', 'helping', 'knitters', 'zeus', 'poseidon', 'demeter', 'apollo', 'artemis', 'ares', 'aphrodite', 'hephaestus', 'dionysus']);
    expect(assets.statues).toHaveLength(12);
    expect(new Set(assets.statues.map(statue => statue.accessory))).toEqual(new Set(['crown', 'winged-feet', 'owl-shield', 'lightning', 'trident', 'wheat', 'lyre', 'bow', 'spear', 'heart', 'hammer', 'grapes']));
    for (const statue of assets.statues) {
      const accessory = statue.root.getObjectByName(`accessory-${statue.accessory}`);
      expect(accessory?.children.length).toBeGreaterThan(0);
      const box = new Box3().setFromObject(statue.root);
      expect(box.min.toArray().every(Number.isFinite)).toBe(true);
      expect(box.max.toArray().every(Number.isFinite)).toBe(true);
      expect(box.max.y - box.min.y).toBeGreaterThan(1);
    }
    disposeOlympusAssets(assets);
  });

  it('creates its shared meshes without Three.js warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const assets = createOlympianStatues(new Set());
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      disposeOlympusAssets(assets);
    } finally { warn.mockRestore(); error.mockRestore(); }
  });

  it('uses warm emissive gold only for owned statues', () => {
    const assets = createOlympianStatues(new Set(['welcome']));
    const owned = assets.statues.find(statue => statue.id === 'welcome')!;
    const locked = assets.statues.find(statue => statue.id === 'zeus')!;
    expect(owned.glowMaterial.emissiveIntensity).toBeGreaterThan(0);
    expect(locked.glowMaterial.emissiveIntensity).toBe(0);
    disposeOlympusAssets(assets);
  });

  it('disposes all shared geometry and material resources', () => {
    const assets = createOlympianStatues(new Set());
    const geometryDispose = vi.spyOn(assets.resources.geometries[0], 'dispose');
    const materialDispose = vi.spyOn(assets.resources.materials[0], 'dispose');
    disposeOlympusAssets(assets);
    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
  });
});


describe('OlympusWorld lifecycle', () => {
  it('releases a partially initialized renderer when attaching the canvas fails', () => {
    const renderer = { domElement: { style:{}, setAttribute:vi.fn(), remove:vi.fn() }, forceContextLoss:vi.fn(), dispose:vi.fn() };
    const restoreWindow = globalThis.window;
    Object.assign(globalThis, { window:{ addEventListener:vi.fn(), removeEventListener:vi.fn() } });
    const factory = vi.spyOn(olympusRendererFactory, 'create').mockReturnValue(renderer as never);
    const host = { append:() => { throw new Error('Canvas attachment failed.'); }, addEventListener:vi.fn(), removeEventListener:vi.fn() } as unknown as HTMLElement;
    try {
      const world = new OlympusWorld(host);
      expect(world.supported).toBe(false);
      world.dispose();
      expect(renderer.domElement.remove).toHaveBeenCalledOnce();
      expect(renderer.forceContextLoss).toHaveBeenCalledOnce();
      expect(renderer.dispose).toHaveBeenCalledOnce();
    } finally { factory.mockRestore(); Object.assign(globalThis,{window:restoreWindow}); }
  });

  it('sizes its renderer on the first render and forcibly releases the WebGL context', () => {
    const renderer = {
      domElement: { style: {}, setAttribute: vi.fn(), remove: vi.fn() }, autoClear: true,
      setClearColor: vi.fn(), setPixelRatio: vi.fn(), setSize: vi.fn(), setScissorTest: vi.fn(), clear: vi.fn(),
      setViewport: vi.fn(), setScissor: vi.fn(), render: vi.fn(), dispose: vi.fn(), forceContextLoss: vi.fn(),
    };
    const restoreWindow = globalThis.window;
    const restoreRect = globalThis.DOMRect;
    const restoreObserver = globalThis.ResizeObserver;
    Object.assign(globalThis, {
      window: { devicePixelRatio: 1, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      DOMRect: class { constructor(public x: number, public y: number, public width: number, public height: number) {} },
      ResizeObserver: class { observe() {} disconnect() {} },
    });
    const host = {
      append: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180, right: 320, bottom: 180 }),
      querySelectorAll: () => [],
    } as unknown as HTMLElement;
    const factory = vi.spyOn(olympusRendererFactory, 'create').mockReturnValue(renderer as never);
    try {
      const world = new OlympusWorld(host);
      world.render(0, true);
      expect(renderer.setSize).toHaveBeenCalledWith(320, 180, false);
      world.dispose();
      expect(renderer.dispose).toHaveBeenCalledOnce();
      expect(renderer.forceContextLoss).toHaveBeenCalledOnce();
    } finally {
      factory.mockRestore();
      Object.assign(globalThis, { window: restoreWindow, DOMRect: restoreRect, ResizeObserver: restoreObserver });
    }
  });
});

describe('Olympian ownership state', () => {
  it('restores ivory meshes and removes the halo when an owned statue is revoked', () => {
    const assets = createOlympianStatues(new Set(['welcome']));
    const statue = assets.statues[0];
    expect((statue.root.getObjectByName('cat-body') as import('three').Mesh).material).toBe(assets.resources.gold);
    setOlympianOwned(statue, false, assets.resources);
    expect(statue.owned).toBe(false);
    expect(statue.glowMaterial.opacity).toBe(0);
    expect(statue.glowMaterial.emissiveIntensity).toBe(0);
    expect((statue.root.getObjectByName('cat-body') as import('three').Mesh).material).toBe(assets.resources.ivory);
    disposeOlympusAssets(assets);
  });
});
