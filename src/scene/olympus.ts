import {
  AmbientLight, Color, CylinderGeometry, DirectionalLight, Group, ImageLoader,
  Mesh, MeshStandardMaterial, PerspectiveCamera, RingGeometry, Scene,
  Sprite, SpriteMaterial, SRGBColorSpace, Texture, WebGLRenderer,
  type BufferGeometry, type Material,
} from 'three';

export const OLYMPIAN_IDS = ['welcome', 'helping', 'knitters', 'zeus', 'poseidon', 'demeter', 'apollo', 'artemis', 'ares', 'aphrodite', 'hephaestus', 'dionysus'] as const;
export type OlympianId = typeof OLYMPIAN_IDS[number];
type Quality = 'auto' | 'low' | 'high';

export interface OlympianStatue {
  id: OlympianId;
  root: Group;
  portrait: Sprite;
  glowMaterial: MeshStandardMaterial;
  halo: Mesh;
  owned: boolean;
}
interface OlympusResources {
  geometries: BufferGeometry[];
  materials: Material[];
  textures: Texture[];
  ivory: MeshStandardMaterial;
  gold: MeshStandardMaterial;
}
export interface OlympianAssets { statues: OlympianStatue[]; resources: OlympusResources; }

/** A single renderer serves all twelve viewports. */
export const olympusRendererFactory = {
  create: () => new WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false }),
};

export function createOlympianStatues(ownedIds: ReadonlySet<string> = new Set()): OlympianAssets {
  const cylinder = new CylinderGeometry(1, 1, 1, 32);
  const ring = new RingGeometry(.55, .75, 32);
  const ivory = new MeshStandardMaterial({ color: 0xe7dac4, roughness: .72, metalness: .02 });
  const gold = new MeshStandardMaterial({ color: 0xf0b93e, emissive: 0x5d3206, emissiveIntensity: .14, roughness: .38, metalness: .55 });
  const trim = new MeshStandardMaterial({ color: 0xb88337, roughness: .46, metalness: .38 });
  const shared: OlympusResources = { geometries: [cylinder, ring], materials: [ivory, gold, trim], textures: [], ivory, gold };
  const statues = OLYMPIAN_IDS.map(id => {
    const root = new Group(); root.name = `cat-${id}`;
    const top = new Mesh(cylinder, ivory); top.name = 'pedestal-top';
    top.position.y = -.04; top.scale.set(1.05, .2, 1.05);
    const base = new Mesh(cylinder, trim); base.position.y = -.21; base.scale.set(1.18, .14, 1.18);
    // Billboard art stays frontal while the illuminated pedestal remains genuinely three-dimensional.
    const texture = new Texture(); texture.colorSpace = SRGBColorSpace; shared.textures.push(texture);
    const ink = new SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
    shared.materials.push(ink);
    const portrait = new Sprite(ink); portrait.name = `portrait-${id}`;
    portrait.center.set(.5, 0); portrait.position.set(0, -.10, .08); portrait.scale.set(3.25, 3.25, 1); portrait.visible = false;
    const glowMaterial = new MeshStandardMaterial({ color: new Color(0xf7c85b), emissive: 0xd98b20, emissiveIntensity: 0, transparent: true, opacity: 0, depthWrite: false });
    shared.materials.push(glowMaterial);
    const halo = new Mesh(ring, glowMaterial); halo.position.y = -.29; halo.scale.setScalar(1.8); halo.rotation.x = -Math.PI / 2;
    root.add(top, base, portrait, halo);
    const statue = { id, root, portrait, glowMaterial, halo, owned: false };
    setOlympianOwned(statue, ownedIds.has(id), shared);
    return statue;
  });
  return { statues, resources: shared };
}

export function setOlympianOwned(statue: OlympianStatue, owned: boolean, shared: OlympusResources): void {
  statue.owned = owned; statue.glowMaterial.opacity = owned ? .28 : 0; statue.glowMaterial.emissiveIntensity = owned ? 1.1 : 0;
  const top = statue.root.getObjectByName('pedestal-top') as Mesh;
  top.material = owned ? shared.gold : shared.ivory;
}

export function disposeOlympusAssets(assets: OlympianAssets): void {
  for (const texture of assets.resources.textures) texture.dispose();
  for (const material of assets.resources.materials) material.dispose();
  for (const geometry of assets.resources.geometries) geometry.dispose();
  for (const statue of assets.statues) statue.root.clear();
}

export class OlympusWorld {
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(32, 1, .1, 20);
  private readonly renderer: WebGLRenderer | null;
  private readonly assets: OlympianAssets;
  private readonly positions = new Map<OlympianId, { viewport: DOMRect; clip: DOMRect }>();
  private quality: Quality = 'auto';
  private dirty = true;
  private width = 1;
  private height = 1;
  private pixelRatio = 0;
  private disposed = false;
  private observer: ResizeObserver | null = null;
  private readonly onScroll = () => { this.dirty = true; };

  constructor(private readonly host: HTMLElement) {
    this.assets = createOlympianStatues();
    for (const statue of this.assets.statues) { statue.root.visible = false; this.scene.add(statue.root); }
    this.scene.add(new AmbientLight(0xfff6df, 1.1));
    const key = new DirectionalLight(0xffe5ac, 2.1); key.position.set(3, 5, 6); this.scene.add(key);
    this.camera.position.set(0, 2.05, 7); this.camera.lookAt(0, 1.35, 0);
    let renderer: WebGLRenderer | null = null;
    try {
      renderer = olympusRendererFactory.create();
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true');
      Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '1' });
      host.append(canvas); renderer.autoClear = false; renderer.setClearColor(0x000000, 0);
      this.renderer = renderer;
    } catch {
      renderer?.domElement.remove();
      renderer?.forceContextLoss();
      renderer?.dispose();
      this.renderer = null;
    }
    if (this.renderer) this.loadPortraits();
    if (typeof ResizeObserver !== 'undefined') { this.observer = new ResizeObserver(() => { this.dirty = true; }); this.observer.observe(host); }
    window.addEventListener('scroll', this.onScroll, true); host.addEventListener('scroll', this.onScroll, { passive: true });
  }

  get supported(): boolean { return this.renderer !== null; }

  sync(ownedIds: readonly string[], quality: Quality): void {
    if (this.disposed) return;
    const qualityChanged = this.quality !== quality;
    this.quality = quality;
    const owned = new Set(ownedIds);
    for (const statue of this.assets.statues) if (statue.owned !== owned.has(statue.id)) setOlympianOwned(statue, owned.has(statue.id), this.assets.resources);
    if (qualityChanged) this.dirty = true;
  }

  render(now: number, reducedMotion: boolean): void {
    if (this.disposed || !this.renderer) return;
    if (this.dirty) this.measure();
    else this.refreshPixelRatio();
    this.renderer.setScissorTest(false); this.renderer.clear(); this.renderer.setScissorTest(true);
    for (const statue of this.assets.statues) {
      const rects = this.positions.get(statue.id); if (!rects) continue;
      const { viewport, clip } = rects;
      statue.root.visible = true;
      if (!reducedMotion) { statue.root.rotation.y = Math.sin(now * .00055 + OLYMPIAN_IDS.indexOf(statue.id)) * .12; statue.halo.rotation.z = now * .00025; }
      else statue.root.rotation.y = 0;
      this.camera.aspect = viewport.width / viewport.height; this.camera.updateProjectionMatrix();
      this.renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height); this.renderer.setScissor(clip.x, clip.y, clip.width, clip.height);
      this.renderer.render(this.scene, this.camera); statue.root.visible = false;
    }
    this.renderer.setScissorTest(false);
  }

  dispose(): void {
    if (this.disposed) return; this.disposed = true;
    this.observer?.disconnect(); window.removeEventListener('scroll', this.onScroll, true); this.host.removeEventListener('scroll', this.onScroll);
    if (this.renderer) { this.renderer.domElement.remove(); this.renderer.forceContextLoss(); this.renderer.dispose(); }
    disposeOlympusAssets(this.assets); this.positions.clear();
  }

  private loadPortraits(): void {
    const loader = new ImageLoader();
    for (const statue of this.assets.statues) {
      loader.load(`${import.meta.env.BASE_URL}art/olympians/${statue.id}.webp`, image => {
        // Navigation may dispose this world while an image is still decoding.
        if (this.disposed) return;
        const texture = statue.portrait.material.map!;
        texture.image = image; texture.needsUpdate = true; statue.portrait.visible = true;
        const viewport = this.host.querySelector<HTMLElement>(`[data-statue-id="${statue.id}"]`);
        if (viewport) viewport.dataset.artReady = 'true';
      }, undefined, () => {
        if (this.disposed) return;
        const viewport = this.host.querySelector<HTMLElement>(`[data-statue-id="${statue.id}"]`);
        if (viewport) viewport.dataset.artReady = 'error';
      });
    }
  }

  private resize(width: number, height: number): void {
    this.width = Math.max(1, width); this.height = Math.max(1, height);
    this.refreshPixelRatio(); this.renderer!.setSize(this.width, this.height, false);
  }

  private refreshPixelRatio(): void {
    const pixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    const next = this.quality === 'high' ? Math.min(pixelRatio, 2) : this.quality === 'low' ? 1 : Math.min(pixelRatio, 1.5);
    if (next === this.pixelRatio) return;
    this.pixelRatio = next; this.renderer!.setPixelRatio(next); this.renderer!.setSize(this.width, this.height, false);
  }

  private measure(): void {
    this.dirty = false; this.positions.clear();
    const hostRect = this.host.getBoundingClientRect();
    this.resize(hostRect.width, hostRect.height);
    for (const viewport of this.host.querySelectorAll<HTMLElement>('.statue-viewport[data-statue-id]')) {
      const id = viewport.dataset.statueId as OlympianId | undefined; if (!id || !OLYMPIAN_IDS.includes(id)) continue;
      const rect = viewport.getBoundingClientRect();
      const left = Math.max(0, rect.left - hostRect.left), right = Math.min(hostRect.width, rect.right - hostRect.left);
      const top = Math.max(0, rect.top - hostRect.top), bottom = Math.min(hostRect.height, rect.bottom - hostRect.top);
      if (right <= left || bottom <= top) continue;
      const full = new DOMRect(rect.left - hostRect.left, hostRect.height - (rect.bottom - hostRect.top), rect.width, rect.height);
      const clipped = new DOMRect(left, hostRect.height - bottom, right - left, bottom - top);
      this.positions.set(id, { viewport: full, clip: clipped });
    }
  }
}
