import { COMPANION_LINES, type CompanionId } from './companion-lines';
import './companion-chat.css';

export type ChatLanguage = 'en' | 'es';
export type VisibleCompanionLine = { id: CompanionId; name: string; text: string; portrait: string };

const names: Record<CompanionId, string> = { kira: 'Kira', mario: 'Mario', roman: 'Roman', luigi: 'Luigi', lola: 'Lola', biscocho: 'Biscuit' };
const interval = (random: () => number) => 45 + random() * 45;

/** A passive, loop-driven companion thought bubble. */
export class CompanionChat {
  private elapsed = 0;
  private due: number;
  private activeId: CompanionId | null = null;
  private activeLanguage: ChatLanguage | null = null;
  private readonly history = new Map<CompanionId, number[]>();
  private readonly bubble: HTMLElement | null;
  currentLine: VisibleCompanionLine | null = null;

  constructor(host: HTMLElement | null, private readonly random: () => number = Math.random) {
    this.due = interval(random);
    this.bubble = host ? this.createBubble(host) : null;
  }

  update(deltaSeconds: number, companionId: CompanionId | null, language: ChatLanguage, eligible: boolean): void {
    const changed = companionId !== this.activeId || language !== this.activeLanguage;
    if (changed) {
      this.activeId = companionId;
      this.activeLanguage = language;
      this.elapsed = 0;
      this.due = interval(this.random);
      this.hide();
      return;
    }
    if (!eligible || !companionId) {
      this.hide();
      return;
    }
    this.elapsed += Math.max(0, deltaSeconds);
    if (this.elapsed < this.due) return;
    this.elapsed = 0;
    this.due = interval(this.random);
    this.show(companionId, language);
  }

  dispose(): void { this.bubble?.remove(); }

  private show(id: CompanionId, language: ChatLanguage): void {
    const lines = COMPANION_LINES[id];
    const previous = this.history.get(id) ?? [];
    const candidates = lines.map((_, index) => index).filter(index => !previous.includes(index));
    const index = candidates[Math.min(candidates.length - 1, Math.floor(this.random() * candidates.length))];
    this.history.set(id, [...previous, index].slice(-5));
    this.currentLine = { id, name: names[id], text: lines[index][language], portrait: `${import.meta.env.BASE_URL}art/companions/${id}.webp` };
    if (!this.bubble) return;
    this.bubble.querySelector<HTMLImageElement>('.companion-chat__portrait')!.src = this.currentLine.portrait;
    this.bubble.querySelector<HTMLImageElement>('.companion-chat__portrait')!.alt = '';
    this.bubble.querySelector<HTMLElement>('.companion-chat__name')!.textContent = this.currentLine.name;
    this.bubble.querySelector<HTMLElement>('.companion-chat__text')!.textContent = this.currentLine.text;
    this.bubble.hidden = false;
  }

  private hide(): void { this.currentLine = null; if (this.bubble) this.bubble.hidden = true; }
  private createBubble(host: HTMLElement): HTMLElement {
    const bubble = document.createElement('aside');
    bubble.className = 'companion-chat'; bubble.hidden = true; bubble.setAttribute('aria-live', 'polite'); bubble.setAttribute('aria-atomic', 'true');
    const image = document.createElement('img'); image.className = 'companion-chat__portrait'; image.width = 42; image.height = 42;
    const content = document.createElement('div'); content.className = 'companion-chat__content';
    const name = document.createElement('strong'); name.className = 'companion-chat__name';
    const text = document.createElement('p'); text.className = 'companion-chat__text';
    content.append(name, text); bubble.append(image, content); host.append(bubble); return bubble;
  }
}
