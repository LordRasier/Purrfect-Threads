import './falling-cat.css';

const spawnInterval = (random: () => number) => 60 + random() * 60;
const lifetimeSeconds = 8;

/** A short-lived active-time reward; it never advances outside the workshop. */
export class FallingCat {
  private elapsed = 0;
  private remaining = 0;
  private due: number;
  private claimed = false;
  private language: 'en' | 'es' | null = null;
  private lane = 0.5;
  private readonly button: HTMLButtonElement | null;
  visible = false;
  reducedMotion = false;

  constructor(host: HTMLElement | null, private readonly onClaim: (amount: number) => void, private readonly random: () => number = Math.random) {
    this.due = spawnInterval(random);
    this.button = host ? this.createButton(host) : null;
  }

  update(deltaSeconds: number, eligible: boolean, reducedMotion: boolean, language: 'en' | 'es' = 'en'): void {
    this.reducedMotion = reducedMotion;
    if (this.button && language !== this.language) {
      this.language = language;
      this.button.setAttribute('aria-label', language === 'es' ? 'Atrapa al gato lápiz para ganar 5 de lana' : 'Catch the pencil cat to earn 5 yarn');
    }
    if (this.button) this.button.classList.toggle('falling-cat--still', reducedMotion);
    if (!eligible) { if (this.visible) this.hideAndReschedule(); return; }
    const delta = Math.max(0, deltaSeconds);
    if (this.visible) {
      this.remaining = Math.max(0, this.remaining - delta);
      this.position();
      if (!this.remaining) this.hideAndReschedule();
      return;
    }
    this.elapsed += delta;
    if (this.elapsed >= this.due) this.show();
  }

  claim(): void {
    if (!this.visible || this.claimed) return;
    this.claimed = true;
    this.onClaim(5);
    this.hideAndReschedule();
  }

  dispose(): void { this.button?.remove(); }

  private show(): void {
    this.visible = true;
    this.claimed = false;
    this.remaining = lifetimeSeconds;
    this.elapsed = 0;
    if (this.button) { this.lane = this.random(); this.button.hidden = false; this.position(); }
  }

  private position(): void {
    if (!this.button) return;
    const host = this.button.parentElement;
    const hostHeight = host?.clientHeight ?? 0;
    const hostWidth = host?.clientWidth ?? 0;
    const size = Math.min(88, Math.max(44, Math.floor(hostHeight * 0.4)));
    const inset = 4;
    const rangeY = Math.max(0, hostHeight - size - inset * 2);
    const rangeX = Math.max(0, hostWidth - size - inset * 2);
    this.button.style.width = `${size}px`;
    this.button.style.height = `${size}px`;
    this.button.style.left = `${inset + this.lane * rangeX}px`;
    this.button.style.top = `${inset + (this.reducedMotion ? rangeY / 2 : (1 - this.remaining / lifetimeSeconds) * rangeY)}px`;
  }

  private hideAndReschedule(): void {
    this.visible = false;
    this.remaining = 0;
    this.elapsed = 0;
    this.due = spawnInterval(this.random);
    if (this.button) this.button.hidden = true;
  }

  private createButton(host: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'falling-cat';
    button.hidden = true;
    button.dataset.reward = '5';
    button.setAttribute('aria-label', 'Catch the pencil cat to earn 5 yarn');
    const image = document.createElement('img');
    image.src = `${import.meta.env.BASE_URL}art/falling-cat.png`;
    image.alt = '';
    image.width = 88;
    image.height = 88;
    button.append(image);
    button.addEventListener('pointerdown', event => { event.stopPropagation(); });
    button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); this.claim(); });
    host.append(button);
    return button;
  }
}

