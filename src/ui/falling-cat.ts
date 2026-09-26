import './falling-cat.css';

const spawnInterval = (random: () => number) => 60 + random() * 60;
const lifetimeSeconds = 8;
const entranceSeconds = 0.28;
const exitSeconds = 0.5;

type Phase = 'hidden' | 'entering' | 'active' | 'exiting';

/** A short-lived active-time reward; it never advances outside the workshop. */
export class FallingCat {
  private elapsed = 0;
  private remaining = 0;
  private due: number;
  private claimed = false;
  private language: 'en' | 'es' | null = null;
  private lane = 0.5;
  private phase: Phase = 'hidden';
  private phaseElapsed = 0;
  private exitStartOpacity = 1;
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
      this.button.setAttribute('aria-label', language === 'es' ? 'Atrapa al gato paracaidista para ganar 5 de lana' : 'Catch the parachute cat to earn 5 yarn');
    }
    if (this.button) this.button.classList.toggle('falling-cat--still', reducedMotion);
    if (!eligible) { this.hideImmediately(); return; }
    const delta = Math.max(0, deltaSeconds);
    if (this.phase === 'exiting') {
      this.phaseElapsed += delta;
      this.position();
      this.applyVisuals();
      if (this.phaseElapsed >= exitSeconds) this.finishExit();
      return;
    }
    if (this.visible) {
      this.phaseElapsed += delta;
      this.remaining = Math.max(0, this.remaining - delta);
      if (this.phase === 'entering' && this.phaseElapsed >= entranceSeconds) { this.phase = 'active'; this.phaseElapsed = 0; }
      this.position();
      this.applyVisuals();
      if (!this.remaining) this.beginExit();
      return;
    }
    this.elapsed += delta;
    if (this.elapsed >= this.due) this.show();
  }

  claim(): void {
    if (!this.visible || this.claimed) return;
    this.claimed = true;
    this.onClaim(5);
    this.beginExit();
  }

  dispose(): void { this.button?.remove(); }

  private show(): void {
    this.visible = true;
    this.claimed = false;
    this.remaining = lifetimeSeconds;
    this.elapsed = 0;
    this.phase = 'entering';
    this.phaseElapsed = 0;
    if (this.button) {
      this.lane = this.random();
      this.button.hidden = false;
      this.button.disabled = false;
      this.position();
      this.applyVisuals();
    }
  }

  private beginExit(): void {
    if (this.phase === 'exiting' || this.phase === 'hidden') return;
    this.visible = false;
    this.exitStartOpacity = this.currentOpacity();
    this.phase = 'exiting';
    this.phaseElapsed = 0;
    if (this.button) {
      this.button.disabled = true;
      this.applyVisuals();
    }
  }

  private finishExit(): void {
    this.phase = 'hidden';
    this.phaseElapsed = 0;
    this.exitStartOpacity = 1;
    this.remaining = 0;
    this.elapsed = 0;
    this.due = spawnInterval(this.random);
    if (this.button) {
      this.button.hidden = true;
      this.button.style.opacity = '';
      this.button.style.transform = '';
    }
  }

  private hideImmediately(): void {
    if (this.phase === 'hidden') return;
    this.phase = 'hidden';
    this.phaseElapsed = 0;
    this.exitStartOpacity = 1;
    this.visible = false;
    this.remaining = 0;
    this.elapsed = 0;
    this.due = spawnInterval(this.random);
    if (this.button) { this.button.hidden = true; this.button.disabled = true; }
  }

  private position(): void {
    if (!this.button) return;
    const host = this.button.parentElement;
    const hostHeight = host?.clientHeight ?? 0;
    const hostWidth = host?.clientWidth ?? 0;
    const height = Math.min(140, Math.max(44, Math.floor(hostHeight * 0.5)));
    const width = Math.max(44, Math.round(height * 5 / 7));
    const inset = 4;
    const rangeY = Math.max(0, hostHeight - height - inset * 2);
    const rangeX = Math.max(0, hostWidth - width - inset * 2);
    this.button.style.width = `${width}px`;
    this.button.style.height = `${height}px`;
    this.button.style.left = `${inset + this.lane * rangeX}px`;
    this.button.style.top = `${inset + (this.reducedMotion ? rangeY / 2 : (1 - this.remaining / lifetimeSeconds) * rangeY)}px`;
  }

  private currentOpacity(): number {
    return this.phase === 'entering' ? Math.min(1, this.phaseElapsed / entranceSeconds) : 1;
  }

  private applyVisuals(): void {
    if (!this.button) return;
    const progress = this.phase === 'entering' ? Math.min(1, this.phaseElapsed / entranceSeconds) : this.phase === 'exiting' ? Math.min(1, this.phaseElapsed / exitSeconds) : 1;
    const opacity = this.phase === 'entering' ? progress : this.phase === 'exiting' ? this.exitStartOpacity * (1 - progress) : 1;
    const scale = this.reducedMotion || this.phase !== 'exiting' ? 1 : 1 - progress * 0.25;
    this.button.dataset.phase = this.phase;
    this.button.style.opacity = `${opacity}`;
    this.button.style.transform = `scale(${scale})`;
  }

  private createButton(host: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'falling-cat';
    button.hidden = true;
    button.disabled = true;
    button.dataset.reward = '5';
    button.setAttribute('aria-label', 'Catch the parachute cat to earn 5 yarn');
    const image = document.createElement('img');
    image.src = `${import.meta.env.BASE_URL}art/parachute-cat.png`;
    image.alt = '';
    image.width = 100;
    image.height = 140;
    button.append(image);
    button.addEventListener('pointerdown', event => { event.stopPropagation(); });
    button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); this.claim(); });
    host.append(button);
    return button;
  }
}
