import {
  AmbientLight,
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  SphereGeometry,
  TorusGeometry,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
} from 'three';

export const OLYMPIAN_IDS = ['welcome', 'helping', 'knitters', 'zeus', 'poseidon', 'demeter', 'apollo', 'artemis', 'ares', 'aphrodite', 'hephaestus', 'dionysus'] as const;
export type OlympianId = typeof OLYMPIAN_IDS[number];
type Quality = 'auto' | 'low' | 'high';

export interface OlympianStatue {
  id: OlympianId;
  accessory: string;
  root: Group;
  glowMaterial: MeshStandardMaterial;
  halo: Mesh;
  owned: boolean;
}

interface OlympusResources {
  geometries: BufferGeometry[];
  materials: Material[];
  ivory: MeshStandardMaterial;
  gold: MeshStandardMaterial;
  accent: MeshStandardMaterial;
  dark: MeshStandardMaterial;
  pink: MeshStandardMaterial;
  leaf: MeshStandardMaterial;
}

export interface OlympianAssets {
  statues: OlympianStatue[];
  resources: OlympusResources;
}

/** Small seam for deterministic lifecycle tests; production always creates a real WebGL renderer. */
export const olympusRendererFactory = {
  create: () => new WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false }),
};

const GODS: ReadonlyArray<{ id: OlympianId; accessory: string }> = [
  { id: 'welcome', accessory: 'crown' }, { id: 'helping', accessory: 'winged-feet' },
  { id: 'knitters', accessory: 'owl-shield' }, { id: 'zeus', accessory: 'lightning' },
  { id: 'poseidon', accessory: 'trident' }, { id: 'demeter', accessory: 'wheat' },
  { id: 'apollo', accessory: 'lyre' }, { id: 'artemis', accessory: 'bow' },
  { id: 'ares', accessory: 'spear' }, { id: 'aphrodite', accessory: 'heart' },
  { id: 'hephaestus', accessory: 'hammer' }, { id: 'dionysus', accessory: 'grapes' },
];

function resources(): OlympusResources {
  const geometries = [
    new SphereGeometry(1, 16, 12), new SphereGeometry(1, 12, 8), new CylinderGeometry(1, 1, 1, 12),
    new ConeGeometry(1, 1, 12), new BoxGeometry(1, 1, 1), new TorusGeometry(1, .13, 8, 16),
    new RingGeometry(.55, .75, 16), new CircleGeometry(1, 16), new CapsuleGeometry(.35, .8, 4, 10),
  ];
  const ivory = new MeshStandardMaterial({ color: 0xe7dac4, roughness: .72, metalness: .02 });
  const gold = new MeshStandardMaterial({ color: 0xf0b93e, emissive: 0x5d3206, emissiveIntensity: .14, roughness: .38, metalness: .55 });
  const accent = new MeshStandardMaterial({ color: 0xd7902b, roughness: .46, metalness: .38 });
  const dark = new MeshStandardMaterial({ color: 0x463525, roughness: .65 });
  const pink = new MeshStandardMaterial({ color: 0xb65e6a, roughness: .55 });
  const leaf = new MeshStandardMaterial({ color: 0x546539, roughness: .65 });
  const materials = [ivory, gold, accent, dark, pink, leaf];
  return { geometries, materials, ivory, gold, accent, dark, pink, leaf };
}

function mesh(geometry: BufferGeometry, material: Material, x: number, y: number, z: number, scale: [number, number, number] = [1, 1, 1]): Mesh {
  const item = new Mesh(geometry, material);
  item.position.set(x, y, z); item.scale.set(...scale); item.castShadow = false; item.receiveShadow = false;
  return item;
}

function makeCat(res: OlympusResources, id: OlympianId): Group {
  const [round, lowRound, cylinder, cone, , torus] = res.geometries;
  const cat = new Group(); cat.name = `cat-${id}`;
  const body = mesh(round, res.ivory, 0, 1.02, 0, [.68, .76, .55]); body.name = 'cat-body'; cat.add(body);
  cat.add(mesh(round, res.ivory, 0, 2.05, .05, [.88, .72, .7]));
  cat.add(mesh(cone, res.ivory, -.43, 2.66, .03, [.3, .42, .24]));
  cat.add(mesh(cone, res.ivory, .43, 2.66, .03, [.3, .42, .24]));
  cat.add(mesh(cone, res.pink, -.43, 2.67, .22, [.17, .27, .08]));
  cat.add(mesh(cone, res.pink, .43, 2.67, .22, [.17, .27, .08]));
  cat.add(mesh(lowRound, res.dark, -.28, 2.13, .68, [.105, .14, .055]));
  cat.add(mesh(lowRound, res.dark, .28, 2.13, .68, [.105, .14, .055]));
  cat.add(mesh(lowRound, res.pink, 0, 1.91, .73, [.105, .07, .045]));
  const mouthLeft = mesh(lowRound, res.dark, -.065, 1.82, .72, [.055, .025, .02]); mouthLeft.rotation.z = -.3; cat.add(mouthLeft);
  const mouthRight = mesh(lowRound, res.dark, .065, 1.82, .72, [.055, .025, .02]); mouthRight.rotation.z = .3; cat.add(mouthRight);
  // Forward paws make the silhouette read as a seated cat rather than a rounded figurine.
  cat.add(mesh(cylinder, res.ivory, -.36, .58, .39, [.18, .34, .18]));
  cat.add(mesh(cylinder, res.ivory, .36, .58, .39, [.18, .34, .18]));
  const tail = mesh(torus, res.ivory, .76, 1.12, -.12, [.54, .66, .54]); tail.rotation.x = Math.PI / 2; tail.rotation.z = -.72; cat.add(tail);
  cat.add(mesh(cylinder, res.ivory, 0, -.04, 0, [1.05, .2, 1.05]));
  cat.add(mesh(cylinder, res.accent, 0, -.24, 0, [1.18, .12, 1.18]));
  return cat;
}

function addAccessory(statue: Group, accessory: string, res: OlympusResources): void {
  const root = new Group();
  root.name = `accessory-${accessory}`;
  statue.add(root);
  const [round, lowRound, cylinder, cone, box, torus] = res.geometries;
  const gold = res.accent;
  const stick = (x: number, y: number, rotation = 0, length = 1.2) => { const part = mesh(cylinder, gold, x, y, .14, [.055, length, .055]); part.rotation.z = rotation; root.add(part); return part; };
  if (accessory === 'crown') {
    root.add(mesh(torus, gold, 0, 2.72, .02, [.43, .43, .43]));
    for (const x of [-.29, 0, .29]) root.add(mesh(cone, gold, x, 3.0 - Math.abs(x) * .25, .02, [.13, .28, .13]));
  } else if (accessory === 'winged-feet') {
    for (const x of [-.45, .45]) {
      root.add(mesh(cone, res.ivory, x, .42, .25, [.22, .32, .08]));
      for (const [offset, rise] of [[-.2, .56], [-.28, .66], [-.34, .76]]) {
        const direction = x < 0 ? -1 : 1; const wing = mesh(cone, gold, x + offset * direction, rise, .22, [.12, .3, .05]); wing.rotation.z = direction * .82; root.add(wing);
      }
    }
  } else if (accessory === 'owl-shield') {
    const shield = mesh(round, gold, -.7, 1.35, .45, [.38, .52, .1]); root.add(shield);
    const owl = mesh(lowRound, res.ivory, .6, 1.5, .46, [.25, .32, .12]); root.add(owl);
    for (const x of [.5, .7]) root.add(mesh(lowRound, res.dark, x, 1.58, .57, [.04, .05, .02]));
  } else if (accessory === 'lightning') {
    const bolt = mesh(box, gold, .63, 1.65, .38, [.18, .54, .06]); bolt.rotation.z = .42; root.add(bolt);
    const bolt2 = mesh(box, gold, .52, 1.27, .38, [.18, .42, .06]); bolt2.rotation.z = -.42; root.add(bolt2);
  } else if (accessory === 'trident') {
    stick(.68, 1.32, 0, 1.45);
    root.add(mesh(box, gold, .68, 2.08, .2, [.68, .07, .07]));
    for (const x of [.4, .68, .96]) { root.add(mesh(cylinder, gold, x, 2.31, .2, [.05, .28, .05])); root.add(mesh(cone, gold, x, 2.66, .2, [.105, .28, .06])); }
  } else if (accessory === 'wheat') {
    stick(.58, 1.25, -.35, 1.05); for (let n = 0; n < 5; n++) { const grain = mesh(lowRound, gold, .43 + n * .1, 1.35 + n * .17, .24, [.09, .18, .05]); grain.rotation.z = -.35; root.add(grain); }
  } else if (accessory === 'lyre') {
    const ring = mesh(torus, gold, .58, 1.4, .36, [.34, .52, .08]); root.add(ring); root.add(mesh(box, gold, .58, 1.4, .42, [.15, .78, .04]));
    for (const x of [.48, .58, .68]) root.add(mesh(box, res.dark, x, 1.42, .48, [.014, .36, .01]));
  } else if (accessory === 'bow') {
    const bow = mesh(torus, gold, .65, 1.45, .32, [.35, .68, .06]); root.add(bow); root.add(mesh(box, res.dark, .65, 1.45, .43, [.014, .72, .01]));
  } else if (accessory === 'spear') {
    stick(.65, 1.28, -.08, 1.35); root.add(mesh(cone, gold, .77, 2.35, .18, [.16, .38, .08]));
  } else if (accessory === 'heart') {
    const left = mesh(round, res.pink, .48, 1.56, .42, [.2, .22, .07]); const right = mesh(round, res.pink, .72, 1.56, .42, [.2, .22, .07]); root.add(left, right); const point = mesh(cone, res.pink, .6, 1.34, .42, [.28, .35, .07]); point.rotation.z = Math.PI; root.add(point);
  } else if (accessory === 'hammer') {
    stick(.58, 1.26, -.55, 1.05); const head = mesh(box, gold, .78, 1.88, .23, [.52, .16, .16]); head.rotation.z = -.55; root.add(head);
  } else if (accessory === 'grapes') {
    stick(.53, 1.25, -.4, .9); for (const [x, y] of [[.45, 1.85], [.65, 1.85], [.55, 1.67], [.45, 1.5], [.65, 1.5]]) root.add(mesh(lowRound, res.leaf, x, y, .35, [.13, .13, .08]));
  }
}

export function createOlympianStatues(ownedIds: ReadonlySet<string> = new Set()): OlympianAssets {
  const shared = resources();
  const statues = GODS.map(({ id, accessory }) => {
    const root = makeCat(shared, id); addAccessory(root, accessory, shared);
    const glowMaterial = new MeshStandardMaterial({ color: new Color(0xf7c85b), emissive: 0xd98b20, emissiveIntensity: 0, transparent: true, opacity: 0, depthWrite: false });
    shared.materials.push(glowMaterial);
    const halo = mesh(shared.geometries[6], glowMaterial, 0, -.27, 0, [1.45, 1.45, 1.45]); halo.rotation.x = -Math.PI / 2; root.add(halo);
    const statue: OlympianStatue = { id, accessory, root, glowMaterial, halo, owned: false };
    setOlympianOwned(statue, ownedIds.has(id), shared); return statue;
  });
  return { statues, resources: shared };
}

export function setOlympianOwned(statue: OlympianStatue, owned: boolean, shared: OlympusResources): void {
  statue.owned = owned; statue.glowMaterial.opacity = owned ? .28 : 0; statue.glowMaterial.emissiveIntensity = owned ? 1.1 : 0; statue.glowMaterial.needsUpdate = true;
  statue.root.traverse(item => {
    if (item instanceof Mesh && (item.name === 'cat-body' || item.material === shared.ivory || item.material === shared.gold)) item.material = owned ? shared.gold : shared.ivory;
  });
}

export function disposeOlympusAssets(assets: OlympianAssets): void {
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
    this.camera.position.set(1.65, 1.62, 7); this.camera.lookAt(0, 1.28, 0);
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



