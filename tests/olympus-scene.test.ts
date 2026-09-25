import { describe, expect, it, vi } from 'vitest';
import { Box3, ImageLoader, Sprite, Mesh } from 'three';
import { OLYMPIAN_IDS, createOlympianStatues, disposeOlympusAssets, olympusRendererFactory, OlympusWorld, setOlympianOwned } from '../src/scene/olympus';

describe('Olympian statue factory', () => {
  it('constructs twelve illustrated cat sprites on real 3D pedestals', () => {
    const assets = createOlympianStatues(new Set(['welcome', 'zeus']));
    expect(OLYMPIAN_IDS).toEqual(['welcome', 'helping', 'knitters', 'zeus', 'poseidon', 'demeter', 'apollo', 'artemis', 'ares', 'aphrodite', 'hephaestus', 'dionysus']);
    expect(assets.statues).toHaveLength(12);
    for (const statue of assets.statues) {
      const portrait = statue.root.getObjectByName(`portrait-${statue.id}`) as Sprite;
      expect(portrait).toBeInstanceOf(Sprite);
      expect(portrait.material.transparent).toBe(true);
      expect(portrait.material.toneMapped).toBe(false);
      expect(portrait.material.map).toBeTruthy();
      expect(statue.root.getObjectByName('pedestal-top')).toBeInstanceOf(Mesh);
      expect(statue.root.getObjectByName('cat-body')).toBeUndefined();
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
    const disposals = [...assets.resources.geometries, ...assets.resources.materials, ...assets.resources.textures]
      .map(resource => vi.spyOn(resource, 'dispose'));
    disposeOlympusAssets(assets);
    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
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
      querySelector: vi.fn(() => ({dataset:{}})),
    } as unknown as HTMLElement;
    const factory = vi.spyOn(olympusRendererFactory, 'create').mockReturnValue(renderer as never);
    const callbacks: Array<{loaded:(image:HTMLImageElement) => void; failed:(error:unknown) => void}> = [];
    const load = vi.spyOn(ImageLoader.prototype, 'load').mockImplementation((_url, loaded, _progress, failed) => {
      callbacks.push({loaded:loaded!, failed:failed!}); return {} as HTMLImageElement;
    });
    try {
      const world = new OlympusWorld(host);
      expect(load).toHaveBeenCalledTimes(12);
      callbacks[0].loaded({} as HTMLImageElement);
      expect(host.querySelector).toHaveBeenCalledOnce();
      callbacks[1].failed(new Error('Missing image'));
      expect(host.querySelector).toHaveBeenCalledTimes(2);
      world.render(0, true);
      expect(renderer.setSize).toHaveBeenCalledWith(320, 180, false);
      world.dispose();
      expect(renderer.dispose).toHaveBeenCalledOnce();
      expect(renderer.forceContextLoss).toHaveBeenCalledOnce();
      callbacks[2].loaded({} as HTMLImageElement);
      callbacks[3].failed(new Error('Late missing image'));
      expect(host.querySelector).toHaveBeenCalledTimes(2);
    } finally {
      factory.mockRestore(); load.mockRestore();
      Object.assign(globalThis, { window: restoreWindow, DOMRect: restoreRect, ResizeObserver: restoreObserver });
    }
  });
});

describe('Olympian ownership state', () => {
  it('restores ivory meshes and removes the halo when an owned statue is revoked', () => {
    const assets = createOlympianStatues(new Set(['welcome']));
    const statue = assets.statues[0];
    expect((statue.root.getObjectByName('pedestal-top') as import('three').Mesh).material).toBe(assets.resources.gold);
    setOlympianOwned(statue, false, assets.resources);
    expect(statue.owned).toBe(false);
    expect(statue.glowMaterial.opacity).toBe(0);
    expect(statue.glowMaterial.emissiveIntensity).toBe(0);
    expect((statue.root.getObjectByName('pedestal-top') as import('three').Mesh).material).toBe(assets.resources.ivory);
    disposeOlympusAssets(assets);
  });
});
