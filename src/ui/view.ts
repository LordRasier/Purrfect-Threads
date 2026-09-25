import Decimal from 'break_infinity.js';
import { COATS, PRODUCERS, UPGRADES, TALENTS, type ProducerId } from '../game/catalog';
import { population, production, producerOutput, quote, tapValue, MAX_OWNED, type GameState, type Quantity } from '../game/engine';
import { prestigeReward } from '../game/progression';
import { text } from './copy';
import { format } from './format';
import { icon } from './icons';

export type Screen = 'workshop' | 'collection' | 'chapter';
export class GameUI {
  screen: Screen = 'workshop';
  quantity: Quantity = 1;
  readonly dialog: HTMLDialogElement;
  readonly pull: HTMLButtonElement;
  readonly worldHost: HTMLElement;
  private panel: HTMLElement;
  private toastTimer = 0;

  constructor(private root: HTMLElement, private game: () => GameState, onAction: (action: string, id?: string) => void) {
    root.innerHTML = `
      <header class="topbar">
        <a class="brand" href="#" aria-label="${text.brand}"><span class="brand-mark">${icon('cat')}</span><span>${text.brandFirst}<span class="brand-second">${text.brandSecond}<span class="brand-dot">.</span></span></span></a>
        <nav class="navigation" aria-label="${text.sectionsLabel}">
          <button data-screen="workshop" aria-pressed="true">${icon('house')}<span>${text.workshop}</span></button>
          <button data-screen="collection" aria-label="${text.collection}" aria-pressed="false">${icon('cat')}<span>${text.collection}</span><span class="nav-count" id="collection-count">0/6</span></button>
          <button data-screen="chapter" aria-label="${text.chapter}" aria-pressed="false">${icon('star')}<span>${text.chapter}</span></button>
        </nav>
        <div class="header-actions"><span class="save-status" id="save-status" role="status">${text.saving}</span><button class="icon-button" data-action="sound" aria-label="${text.mute}" id="sound-button">${icon('sound')}</button><button class="icon-button" data-action="settings" aria-label="${text.settings}">${icon('settings')}</button></div>
      </header>
      <main class="layout">
        <section class="play-area" aria-label="${text.playAreaLabel}">
          <div class="intro"><div class="eyebrow">${icon('sun')}${text.eyebrow}</div><h1>${text.titleFirst}<br><em>${text.titleSecond}</em></h1><p>${text.subtitle}</p></div>
          <div class="stash"><span class="stash-label">${text.yarn}</span><div class="stash-value">${icon('yarn')}<span data-testid="yarn" id="yarn-count">0</span></div><div class="stats-line"><span><i class="status-dot"></i><strong data-testid="rate" id="rate">0</strong> ${text.perSecond}</span><span class="stat-divider"></span><span>${icon('paw')}<strong data-testid="population" id="population">0</strong> ${text.workingCats}</span></div></div>
          <div class="world" id="world"><div class="scene-halo"></div><span class="room-label" id="room-label">${text.chapterLabel(0)}</span><button id="pull" class="yarn-target" aria-label="${text.pull}"><span class="sr-only">${text.pull}</span></button><div class="float-layer" id="float-layer" aria-hidden="true"></div><span class="scene-sparkle sparkle-one">✦</span><span class="scene-sparkle sparkle-two">✧</span></div>
          <div class="pull-hint"><span class="hint-icon">${icon('paw')}</span><span><strong>${text.holdHint}</strong><small id="tap-hint">${text.keyboardHint}</small></span><span class="per-tap" id="per-tap">+1</span></div>
          <div class="milestone"><div class="milestone-icon">${icon('heart')}</div><div class="milestone-body"><div class="milestone-heading"><strong id="goal-title">${text.firstGoal}</strong><span id="goal-count">0 / 15</span></div><div class="progress-track"><div id="goal-progress"></div></div><small id="goal-detail">${text.firstGoalDetail}</small></div></div>
        </section>
        <aside class="management" id="management" aria-label="${text.managementLabel}"></aside>
      </main>
      <footer><span>${icon('heart')}${text.footer}</span><span>${text.prototype}</span></footer>
      <div class="notice" id="notice" role="status" hidden></div><div class="toast" id="toast" role="status" hidden></div>
      <dialog id="modal" aria-labelledby="modal-title"></dialog><input id="import-file" type="file" accept=".json,application/json" hidden />`;
    this.panel = root.querySelector('#management')!;
    this.dialog = root.querySelector('#modal')!;
    this.pull = root.querySelector('#pull')!;
    this.worldHost = root.querySelector('#world')!;
    root.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!button || button.disabled) return;
      if (button.dataset.screen) { this.screen = button.dataset.screen as Screen; this.renderPanel(); this.refresh(); return; }
      if (button.dataset.quantity) { this.quantity = button.dataset.quantity === 'max' ? 'max' : Number(button.dataset.quantity) as 1 | 10; this.refresh(); return; }
      if (button.dataset.action) onAction(button.dataset.action, button.dataset.id);
    });
    this.dialog.addEventListener('click', event => { if (event.target === this.dialog) { const rect = this.dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dialog.close(); } });
    this.renderPanel(); this.refresh();
  }

  renderPanel(): void {
    const game = this.game();
    const focused = document.activeElement?.id;
    if (this.screen === 'workshop') {
      this.panel.innerHTML = `<div class="panel-intro"><span class="eyebrow">${text.shopEyebrow}</span><h2>${text.shopTitle}</h2><p>${text.shopSubtitle}</p></div>
        <div class="section-heading"><h3>${icon('paw')}${text.team}</h3><div class="quantity" aria-label="${text.quantityLabel}"><button data-quantity="1">×1</button><button data-quantity="10">×10</button><button data-quantity="max">${text.max}</button></div></div>
        <div class="producer-list">${PRODUCERS.map(item => `<article class="producer" id="card-${item.id}"><div class="producer-icon ${item.color}">${icon(item.icon)}</div><div class="producer-info"><div class="producer-title"><h4>${item.name}</h4><span class="owned" id="owned-${item.id}">0</span></div><p>${item.detail}</p><span class="yield" id="yield-${item.id}"></span></div><button class="buy-button" id="buy-${item.id}" data-action="buy" data-id="${item.id}" aria-label="${text.adopt(item.name)}">${icon('yarn')}<span id="cost-${item.id}"></span>${icon('plus', 'buy-plus')}</button><div class="locked-overlay" id="locked-${item.id}">${icon('lock')}<span>${text.next} · ${text.cost(format(item.cost))}</span></div></article>`).join('')}</div>
        <div class="section-heading upgrades-heading"><h3>${icon('leaf')}${text.upgrades}</h3><span class="tiny-label">${text.thisChapter}</span></div>
        <div class="upgrade-list">${UPGRADES.filter(item => item.id !== 'master' || game.talents.includes('knitters')).map(item => `<button class="upgrade" id="upgrade-${item.id}" data-action="upgrade" data-id="${item.id}" aria-label="${text.buy(item.name)}"><span class="upgrade-icon">${icon(item.icon)}</span><span class="upgrade-info"><strong>${item.name}</strong><small>${item.detail}</small></span><span class="upgrade-price" id="upgrade-price-${item.id}">${format(item.cost)}</span></button>`).join('')}</div><p class="panel-note">${icon('heart')}${text.breakHint}</p>`;
    } else if (this.screen === 'collection') {
      this.panel.innerHTML = `<div class="panel-intro"><span class="eyebrow">${text.collectionEyebrow}</span><h2>${text.collectionTitle}</h2><p>${text.collectionSubtitle}</p></div><div class="collection-grid">${COATS.map((coat, i) => {
        const unlocked = game.collection.includes(i);
        return `<article class="coat-card ${unlocked ? '' : 'locked-coat'}"><div class="coat-avatar" style="--coat:${coat.color};--accent:${coat.accent}">${icon('cat')}</div><h3>${coat.name}</h3><p>${coat.personality}</p><button class="soft-button" data-action="coat" data-id="${i}" ${!unlocked ? 'disabled' : ''}>${unlocked ? (game.coat === i ? text.selected : text.select) : icon('lock') + text.unlockCats(coat.milestone)}</button></article>`;
      }).join('')}</div>`;
    } else {
      this.panel.innerHTML = `<div class="panel-intro"><span class="eyebrow">${text.prestigeEyebrow}</span><h2>${text.prestigeTitle}</h2><p>${text.prestigeSubtitle}</p></div><div class="chapter-card"><span class="golden-icon">${icon('paw')}</span><span class="tiny-label">${text.chapterBrings}</span><strong id="prestige-reward"></strong><p id="prestige-remaining"></p><button class="primary-button" data-action="prestige" id="prestige-button">${text.prestigeButton}${icon('arrow')}</button></div><div class="section-heading"><h3>${text.talents}</h3><span id="points-label"></span></div><div class="talent-list">${TALENTS.map(item => `<button class="talent" id="talent-${item.id}" data-action="talent" data-id="${item.id}"><span class="upgrade-icon">${icon(item.icon)}</span><span class="upgrade-info"><strong>${item.name}</strong><small>${item.detail}</small></span><span class="talent-price" id="talent-price-${item.id}">${item.cost}${icon('paw')}</span></button>`).join('')}</div>`;
    }
    if (focused) document.getElementById(focused)?.focus({ preventScroll: true });
  }

  refresh(): void {
    const game = this.game();
    const set = (id: string, value: string) => { const el = document.getElementById(id); if (el && el.textContent !== value) el.textContent = value; };
    set('yarn-count', format(game.yarn.floor(), 0));
    set('rate', format(production(game)));
    set('population', format(population(game), 0));
    set('per-tap', text.perTap(format(tapValue(game))));
    set('collection-count', `${game.collection.length}/6`);
    set('room-label', text.chapterLabel(game.chapters));
    this.root.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.screen === this.screen)));
    this.root.querySelectorAll<HTMLButtonElement>('[data-quantity]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.quantity === String(this.quantity))));
    const nextCat = COATS.find((_, index) => !game.collection.includes(index));
    const goal = population(game).eq(0) ? { title: text.firstGoal, count: `${format(game.yarn.floor(), 0)} / 15`, progress: Math.min(1, game.yarn.div(15).toNumber()), detail: text.firstGoalDetail } : { title: nextCat ? text.nextGoal(nextCat.name) : text.familyTitle, count: nextCat ? `${format(population(game), 0)} / ${format(nextCat.milestone, 0)}` : text.familyCount, progress: nextCat ? population(game).div(nextCat.milestone).toNumber() : 1, detail: nextCat ? text.unlockCats(nextCat.milestone) : text.familyDetail };
    set('goal-title', goal.title); set('goal-count', goal.count); set('goal-detail', goal.detail);
    (document.getElementById('goal-progress') as HTMLElement).style.width = `${goal.progress * 100}%`;
    if (this.screen === 'workshop') {
      let lastRevealed = 0;
      PRODUCERS.forEach((item, i) => { if (game.runEarned.gte(item.cost) || game.owned[item.id] > 0) lastRevealed = i; });
      PRODUCERS.forEach((item, i) => {
        const q = quote(game, item.id, this.quantity);
        const next = q.count ? q : quote(game, item.id, 1);
        const capped = game.owned[item.id] >= MAX_OWNED;
        const card = document.getElementById(`card-${item.id}`)!;
        card.hidden = i > lastRevealed + 1;
        card.classList.toggle('teaser', i > lastRevealed);
        document.getElementById(`locked-${item.id}`)!.hidden = i <= lastRevealed;
        set(`owned-${item.id}`, text.owned(format(game.owned[item.id], 0)));
        set(`cost-${item.id}`, capped ? text.maxed : format(next.cost, 0));
        set(`yield-${item.id}`, text.productionAdded(format(producerOutput(game, item.id, next.count || 1))));
        const buy = document.getElementById(`buy-${item.id}`) as HTMLButtonElement;
        buy.disabled = !q.affordable || capped;
        buy.title = capped ? text.cap : text.catsAdded(format(item.cats * next.count));
      });
      for (const upgrade of UPGRADES) {
        const button = document.getElementById(`upgrade-${upgrade.id}`) as HTMLButtonElement | null;
        if (!button) continue;
        const bought = game.upgrades.includes(upgrade.id);
        button.disabled = bought || game.yarn.lt(upgrade.cost);
        button.classList.toggle('purchased', bought);
        set(`upgrade-price-${upgrade.id}`, bought ? text.bought : format(upgrade.cost, 0));
      }
    }
    if (this.screen === 'chapter') {
      const reward = prestigeReward(game);
      set('prestige-reward', text.reward(format(reward, 0)));
      const next = game.claimed.add(reward).add(1).pow(2).mul(100000).sub(game.lifetime);
      set('prestige-remaining', text.remaining(format(Decimal.max(0, next), 0)));
      (document.getElementById('prestige-button') as HTMLButtonElement).disabled = reward.lt(1);
      set('points-label', `${format(game.points, 0)} ${text.pointName}`);
      TALENTS.forEach(talent => {
        const bought = game.talents.includes(talent.id);
        const button = document.getElementById(`talent-${talent.id}`) as HTMLButtonElement;
        button.disabled = bought || game.points.lt(talent.cost);
        button.classList.toggle('purchased', bought);
        set(`talent-price-${talent.id}`, bought ? text.bought : text.spendPoints(talent.cost));
      });
    }
  }

  toast(message: string): void {
    const toast = document.getElementById('toast')!;
    toast.textContent = message; toast.hidden = false;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3800);
  }
  notice(message: string): void { const notice = document.getElementById('notice')!; notice.textContent = message; notice.hidden = false; }
  saveStatus(success: boolean): void {
    const status = document.getElementById('save-status')!;
    status.innerHTML = `${icon(success ? 'check' : 'close')}<span>${success ? text.saved : text.notSaved}</span>`;
    status.classList.toggle('save-failed', !success);
  }
  floating(amount: string, reduced: boolean): void {
    if (reduced) return;
    const layer = document.getElementById('float-layer')!;
    if (layer.children.length >= 8) return;
    const number = document.createElement('span'); number.className = 'floating-yarn'; number.textContent = `+${amount}`;
    number.style.left = `${41 + Math.random() * 8}%`;
    layer.append(number); window.setTimeout(() => number.remove(), 850);
  }
  showDialog(content: string): void {
    this.dialog.innerHTML = `<button class="icon-button modal-close" data-action="close" aria-label="${text.close}">${icon('close')}</button>${content}`;
    this.dialog.showModal();
  }
  showSettings(): void {
    const settings = this.game().settings;
    this.showDialog(`<span class="eyebrow">${text.settings}</span><h2 id="modal-title">${text.settingsTitle}</h2><label class="setting-row" for="volume">${text.volume}<input id="volume" type="range" min="0" max="1" step="0.05" value="${settings.volume}" /></label><label class="setting-row" for="motion">${text.reducedMotion}<input id="motion" type="checkbox" ${settings.reducedMotion ? 'checked' : ''} /></label><label class="setting-row" for="quality">${text.quality}<select id="quality"><option value="auto" ${settings.quality === 'auto' ? 'selected' : ''}>${text.auto}</option><option value="low" ${settings.quality === 'low' ? 'selected' : ''}>${text.low}</option><option value="high" ${settings.quality === 'high' ? 'selected' : ''}>${text.high}</option></select></label><div class="save-actions"><button class="soft-button" data-action="export">${icon('download')}${text.export}</button><button class="soft-button" data-action="import">${text.import}</button></div><p class="dialog-note">${text.saveHint}</p><p class="dialog-note">${text.cap}</p>`);
  }
}
