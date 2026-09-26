import * as THREE from 'three';
import { ball, block, makeCat, makePlant, makeSleepingCloud, makeWorkshop, makeYarn, material, shape, tube, visibleCatCount, type CatModel } from './models';
import { activeCompanion, population, type GameState } from '../game/engine';
import { CompanionPortrait } from './companion';

export class WorkshopWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-6, 6, 4, -4, 0.1, 80);
  private yarn = makeYarn();
  private cats: CatModel[] = [];
  private crew = new THREE.Group();
  private companionLayer = new THREE.Group();
  private companion: CompanionPortrait;
  private growth = new THREE.Group();
  private structures: THREE.Object3D[] = [];
  private resizeObserver: ResizeObserver;
  private pulseTime = -100;
  private count = -1;
  private quality = '';
  private particles: THREE.Points;
  private particlePositions = new Float32Array(40 * 3);
  private particleSeeds = Array.from({ length: 40 }, (_, i) => ({ angle: i * 2.39996, speed: 0.5 + (i % 7) / 8 }));
  private puff = 10;
  private firstFrame = -1;
  readonly stats = { frames: 0, milliseconds: 0, drawCalls: 0, triangles: 0, cats: 1 };

  constructor(private host: HTMLElement) {
    // WebGLRenderer's documented default output is sRGB. No HDR postprocessing
    // is needed for this lightweight matte toy aesthetic.
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.renderer.domElement.className = 'world-canvas';
    host.prepend(this.renderer.domElement);
    this.camera.position.set(8, 7.8, 12);
    this.camera.lookAt(0, 0.6, 0);
    this.scene.add(new THREE.HemisphereLight('#fff9f1', '#b9b6ad', 1.8));
    const key = new THREE.DirectionalLight('#fff4e6', 2.0);
    key.position.set(-3, 8, 5); this.scene.add(key);
    const fill = new THREE.DirectionalLight('#f0ecff', 0.65);
    fill.position.set(5, 3, -4); this.scene.add(fill);
    this.buildDiorama();
    this.companion = new CompanionPortrait(host, this.companionLayer, {
      load: (url, loaded, failed) => { new THREE.ImageLoader().load(url, loaded, undefined, failed); },
    }, this.camera.getWorldDirection(new THREE.Vector3()).negate());
    this.scene.add(this.crew, this.growth, this.companionLayer);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#fff2d7', size: 0.09, transparent: true, opacity: 0, depthWrite: false }));
    this.scene.add(this.particles);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
  }

  private buildDiorama(): void {
    shape(this.scene, new THREE.CylinderGeometry(4.68, 4.50, 0.30, 96), '#dec49c', [0, -0.20, 0]);
    shape(this.scene, new THREE.CylinderGeometry(4.68, 4.68, 0.13, 96), '#f0dfbf', [0, -0.015, 0]);
    const rug = shape(this.scene, new THREE.CircleGeometry(2.68, 80), '#b6cbb9', [-0.05, 0.057, 0.65]);
    rug.rotation.x = -Math.PI / 2; rug.scale.set(1.12, 0.81, 1);
    const rugRing = shape(this.scene, new THREE.TorusGeometry(2.49, 0.021, 4, 80), '#dae3cf', [-0.05, 0.061, 0.65]);
    rugRing.rotation.x = -Math.PI / 2; rugRing.scale.set(1.12, 0.81, 1);
    const workshop = makeWorkshop();
    workshop.position.set(-2.05, 0.05, -2.12); workshop.rotation.y = 0.25;
    this.scene.add(workshop);
    this.scene.add(makePlant(-3.35, 0.14, 1.25), makePlant(3.15, -1.64, 1.0), makePlant(2.9, 1.7, 0.65));
    this.yarn.position.set(-0.5, 1.39, 0.63); this.yarn.rotation.z = -0.2;
    this.scene.add(this.yarn);
    const looseThread = new THREE.Mesh(tube([
      new THREE.Vector3(-0.7, 0.12, 1.32), new THREE.Vector3(-1.2, 0.13, 2.15),
      new THREE.Vector3(-0.25, 0.13, 2.67), new THREE.Vector3(0.30, 0.13, 2.24),
      new THREE.Vector3(-0.08, 0.13, 1.98), new THREE.Vector3(-0.43, 0.13, 2.32),
      new THREE.Vector3(0.7, 0.13, 2.7),
    ], 0.047, 60), material('#e78675'));
    this.scene.add(looseThread);
    // A knitted spool and cushion make the empty workshop feel inhabited.
    const cushion = ball(this.scene, '#c6b6d5', [1.55, 0.19, 0.3], [0.85, 0.20, 0.74]);
    cushion.rotation.y = -0.2;
    shape(this.scene, new THREE.CylinderGeometry(0.26, 0.26, 0.53, 24), '#b7c7d4', [-2.45, 0.32, 1.88]);
    for (const y of [0.09, 0.59]) shape(this.scene, new THREE.CylinderGeometry(0.33, 0.33, 0.08, 24), '#b98b65', [-2.45, y, 1.88]);
    // Small scattered blossoms: fixed geometry, no autonomous particle system.
    for (let i = 0; i < 8; i++) {
      const angle = 0.3 + i * 0.57;
      ball(this.scene, i % 2 ? '#f2d9a6' : '#e7bcb2', [Math.sin(angle) * 3.9, 0.10, Math.cos(angle) * 3.9], [0.10, 0.07, 0.10]);
    }
    const basket = new THREE.Group();
    shape(basket, new THREE.CylinderGeometry(0.62, 0.51, 0.42, 24), '#bf9573', [0, 0.26, 0]);
    shape(basket, new THREE.TorusGeometry(0.6, 0.07, 6, 32), '#dab58e', [0, 0.49, 0]).rotation.x = Math.PI / 2;
    ball(basket, '#f1ddba', [0, 0.40, 0], [0.5, 0.14, 0.5]);
    basket.position.set(2.4, 0.05, -1.2); this.growth.add(basket); this.structures.push(basket);
    const loom = new THREE.Group();
    for (const x of [-0.43, 0.43]) block(loom, '#ba9476', [x, 0.6, 0], [0.11, 1.15, 0.14]);
    for (const y of [0.25, 1.13]) block(loom, '#ba9476', [0, y, 0], [1.0, 0.12, 0.15]);
    for (let i = 0; i < 7; i++) block(loom, i % 2 ? '#b0c7bc' : '#d2b4cf', [-0.32 + i * 0.105, 0.65, 0], [0.07, 0.72, 0.06]);
    loom.position.set(0.4, 0.05, -2.9); loom.rotation.y = 0.18; this.growth.add(loom); this.structures.push(loom);
    const annex = makeWorkshop(); annex.scale.setScalar(0.53); annex.position.set(2.15, 0.05, -2.65);
    this.growth.add(annex); this.structures.push(annex);
    const cloud = makeSleepingCloud();
    cloud.position.set(1.0, 3.25, -2.0); this.growth.add(cloud); this.structures.push(cloud);
  }

  sync(game: GameState): void {
    const low = game.settings.quality === 'low';
    if (this.quality !== game.settings.quality) {
      this.quality = game.settings.quality;
      this.renderer.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio, this.quality === 'high' ? 2 : 1.5));
      this.resize();
    }
    const selected = activeCompanion(game);
    const selectedId = selected?.id ?? null;
    const count = visibleCatCount(population(game).toNumber(), low, selectedId !== null);
    this.companion.sync(selectedId);
    if (count !== this.count) {
      this.count = count;
      this.crew.clear(); this.cats = [];
      for (let i = 0; i < count; i++) {
        const cat = makeCat(i % 6);
        const angle = 0.95 + i * 2.39996;
        const radius = 2.55 + i % 3 * 0.32;
        cat.root.position.set(Math.sin(angle) * radius, 0.10, Math.cos(angle) * radius);
        cat.root.scale.setScalar(i < 5 ? 0.45 : 0.30);
        cat.root.rotation.y = Math.sin(angle) * 0.7;
        this.cats.push(cat); this.crew.add(cat.root);
      }
    }
    this.stats.cats = count + (selectedId ? 1 : 0);
    ['basket', 'corner', 'workshop', 'factory'].forEach((id, index) => {
      this.structures[index].visible = game.owned[id as keyof typeof game.owned] > 0;
    });
  }

  pulse(now: number): void { this.pulseTime = now / 1000; this.puff = 0; }

  resize(): void {
    const width = this.host.clientWidth, height = this.host.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const span = Math.max(7.7, 11.2 / aspect);
    this.camera.left = -span * aspect / 2; this.camera.right = span * aspect / 2;
    this.camera.top = span / 2; this.camera.bottom = -span / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.camera.updateMatrixWorld();
    const point = this.yarn.position.clone().project(this.camera);
    const diameter = Math.max(44, 2.65 / span * height);
    const target = this.host.querySelector<HTMLElement>('#pull');
    if (target) {
      target.style.width = `${diameter}px`; target.style.height = `${diameter}px`;
      target.style.left = `${(point.x + 1) / 2 * width - diameter / 2}px`;
      target.style.top = `${(1 - point.y) / 2 * height - diameter / 2}px`;
    }
  }

  render(now: number, delta: number, reduced: boolean): void {
    const time = now / 1000;
    const age = time - this.pulseTime;
    const bounce = reduced ? 0 : Math.sin(age * 22) * Math.exp(-age * 7) * 0.11;
    this.yarn.scale.set(1 + bounce * 0.5, 1 - bounce, 1 + bounce * 0.5);
    this.yarn.rotation.y = reduced ? 0 : Math.sin(time * 0.35) * 0.018;
    this.companion.animate(now, reduced);
    this.cats.forEach((cat, i) => {
      cat.head.rotation.z = reduced ? 0 : Math.sin(time * 1.15 + i) * 0.025;
      cat.tail.rotation.y = reduced ? 0 : Math.sin(time * 1.7 + i) * 0.12;
      cat.paws.forEach((paw, p) => { paw.rotation.x = reduced ? 0 : Math.sin(time * 3 + i + p * Math.PI) * 0.17; });
    });
    this.puff += delta;
    (this.particles.material as THREE.PointsMaterial).opacity = reduced ? 0 : Math.max(0, 1 - this.puff / 0.7);
    if (this.puff < 0.7 && !reduced) {
      this.particleSeeds.forEach((seed, i) => {
        this.particlePositions[i * 3] = -0.5 + Math.sin(seed.angle) * (0.5 + this.puff * seed.speed * 2);
        this.particlePositions[i * 3 + 1] = 1.7 + this.puff * 2 - this.puff ** 2 * 2 + Math.sin(i) * 0.3;
        this.particlePositions[i * 3 + 2] = 0.63 + Math.cos(seed.angle) * (0.5 + this.puff * seed.speed * 2);
      });
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
    this.renderer.render(this.scene, this.camera);
    if (this.firstFrame < 0) this.firstFrame = now;
    this.stats.frames++; this.stats.milliseconds = now - this.firstFrame;
    this.stats.drawCalls = this.renderer.info.render.calls;
    this.stats.triangles = this.renderer.info.render.triangles;
  }

  dispose(): void {
    this.resizeObserver.disconnect();
    this.companion.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
