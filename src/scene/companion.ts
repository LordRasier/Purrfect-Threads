import { Group, Sprite, SpriteMaterial, SRGBColorSpace, Texture, Vector3 } from 'three';
export const COMPANION_IDS = ['kira', 'mario', 'roman', 'luigi', 'lola', 'biscocho'] as const;
export type CompanionId = typeof COMPANION_IDS[number];

export interface CompanionImageLoader {
  load(url: string, loaded: (image: HTMLImageElement) => void, failed: () => void): void;
}

export class CompanionPortrait {
  readonly sprite: Sprite;
  private readonly depthOffset = new Vector3();
  get baseY(): number { return 0.37 + this.depthOffset.y; }
  private readonly material: SpriteMaterial;
  private texture: Texture | null = null;
  private selected: CompanionId | null = null;
  private revision = 0;
  private disposed = false;

  constructor(private readonly host: HTMLElement, private readonly parent: Group, private readonly loader: CompanionImageLoader, private readonly towardCamera: Vector3) {
    this.material = new SpriteMaterial({ transparent: true, depthWrite: false, toneMapped: false });
    this.sprite = new Sprite(this.material);
    this.sprite.name = 'selected-companion';
    this.sprite.center.set(0.5, 0);
    this.sprite.position.set(1.55, this.baseY, 0.42);
    this.sprite.scale.set(1.62, 1.62, 1);
    this.sprite.visible = false;
    parent.add(this.sprite);
    this.setDebug(null, 'true');
  }

  sync(id: CompanionId | null): void {
    if (this.disposed || id === this.selected) return;
    this.selected = id;
    // Reclining portraits rest on their belly/paws, not their transparent canvas edge.
    this.sprite.center.y = id === 'mario' ? 0.43 : id === 'roman' ? 0.20 : 0;
    // Move along the view ray: preserve screen placement while letting hanging paws
    // render in front of the cushion, without disabling scene occlusion.
    this.depthOffset.copy(this.towardCamera).normalize().multiplyScalar(id === 'mario' ? 0.85 : 0);
    this.sprite.position.set(1.55, 0.37, 0.42).add(this.depthOffset);
    const revision = ++this.revision;
    this.releaseTexture();
    this.sprite.visible = false;
    this.sprite.position.y = this.baseY;
    if (!id) {
      this.setDebug(null, 'true');
      return;
    }
    this.setDebug(id, 'loading');
    this.loader.load(`${import.meta.env.BASE_URL}art/companions/${id}.webp`, image => {
      if (this.disposed || revision !== this.revision || id !== this.selected) return;
      const texture = new Texture(image);
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
      this.texture = texture;
      this.material.map = texture;
      this.material.needsUpdate = true;
      this.sprite.visible = true;
      this.setDebug(id, 'true');
    }, () => {
      if (this.disposed || revision !== this.revision || id !== this.selected) return;
      this.sprite.visible = false;
      this.setDebug(id, 'error');
    });
  }

  animate(now: number, reducedMotion: boolean): void {
    this.sprite.position.y = (reducedMotion || this.selected === 'mario' || this.selected === 'roman') ? this.baseY : this.baseY + Math.sin(now * 0.0012) * 0.018;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.revision++;
    this.releaseTexture();
    this.sprite.visible = false;
    this.parent.remove(this.sprite);
    this.material.dispose();
  }

  private releaseTexture(): void {
    if (!this.texture) return;
    this.material.map = null;
    this.material.needsUpdate = true;
    this.texture.dispose();
    this.texture = null;
  }

  private setDebug(id: CompanionId | null, ready: 'true' | 'loading' | 'error'): void {
    this.host.dataset.companion = id ?? 'none';
    this.host.dataset.companionReady = ready;
  }
}
