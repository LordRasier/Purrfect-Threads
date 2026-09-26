import { privacyContent } from './privacy';
import './achievement-notifications.css';
import { showLaunch } from './launch';
import { refreshCompanions } from './companions';
import Decimal from 'break_infinity.js';
import { COATS, PRODUCERS, UPGRADES, TALENTS, type ProducerId } from '../game/catalog';
import { population, production, producerOutput, quote, tapValue, upgradeCost, MAX_OWNED, type GameState, type Quantity } from '../game/engine';
import { prestigeReward, prestigeGoal } from '../game/progression';
import { text } from './copy';
import { getLanguage, setLanguage, translate as tr } from './localization';
import { format } from './format';
import { icon } from './icons';
import { ACHIEVEMENTS, achievementProgress, unreadAchievementCount } from '../game/achievements';
import { crewPanel, upgradePanel, chapterPanel, collectionPanel, achievementsPanel } from './panels';

export type Screen = 'workshop' | 'crew' | 'upgrades' | 'achievements' | 'collection' | 'chapter';
export class GameUI {
  screen: Screen = 'workshop';
  launching = true;
  quantity: Quantity = 1;
  private achievementCategory = 'all';
  readonly dialog: HTMLDialogElement;
  readonly pull: HTMLButtonElement;
  readonly worldHost: HTMLElement;
  private panel: HTMLElement;
  private toastTimer = 0;
  private travelAnimation: Animation | null = null;
  private shellText: { node: Text; source: string }[] = [];
  private shellLabels: { node: Element; attribute: string; source: string }[] = [];

  constructor(private root: HTMLElement, private game: () => GameState, onAction: (action: string, id?: string) => void) {
    const language = getLanguage();
    setLanguage('en');
    root.classList.add('tablet-app');
    root.dataset.travel = 'idle';
    root.innerHTML = `
      <div class="journey-track"><section class="sky-realm" inert aria-hidden="true"><div class="management realm-management" id="realm-management" role="region" tabindex="0" aria-label="${text.managementLabel}"></div></section>
      <div class="tablet-stage"><div class="tablet-device"><div class="tablet-camera" aria-hidden="true"></div>
      <header class="topbar">
        <a class="brand" href="#" aria-label="${text.brand}"><span class="brand-mark">${icon('cat')}</span><span>${text.brandFirst}<span class="brand-second">${text.brandSecond}<span class="brand-dot">.</span></span></span></a>
        <nav class="navigation" aria-label="${text.sectionsLabel}">
          <button data-screen="workshop" aria-label="${text.workshop}" aria-pressed="true">${icon('house')}<span class="nav-long">${text.workshop}</span><span class="nav-short">${tr('Play')}</span></button>
          <button data-screen="crew" aria-label="${text.team}" aria-pressed="false">${icon('paw')}<span class="nav-long">${text.team}</span><span class="nav-short">${tr('Crew')}</span></button>
          <button data-screen="upgrades" aria-label="${text.upgradesTab}" aria-pressed="false">${icon('knit')}<span>${text.upgradesTab}</span></button>
          <button data-screen="achievements" aria-label="${text.achievementsTab}" aria-pressed="false">${icon('heart')}<span class="nav-long">${text.achievementsTab}</span><span class="nav-short">${tr('Badges')}</span><span class="nav-count" id="achievement-unread-count" aria-live="polite" hidden></span></button>
          <button data-screen="collection" aria-label="${text.collection}" aria-pressed="false">${icon('cat')}<span>${text.collectionShort}</span><span class="nav-count" id="collection-count">0/6</span></button>
          <button data-screen="chapter" aria-label="${text.chapter}" aria-pressed="false">${icon('star')}<span>${text.olympusShort}</span></button>
        </nav>
        <div class="header-actions"><span class="save-status" id="save-status" role="status">${text.saving}</span><button class="icon-button" data-action="sound" aria-label="${text.mute}" id="sound-button">${icon('sound')}</button><button class="icon-button" data-action="settings" aria-label="${text.settings}">${icon('settings')}</button></div>
        <div class="tablet-wallet">${icon('yarn')}<strong id="tablet-yarn">0</strong></div>
      </header>
      <main class="layout">
        <section class="play-area" aria-label="${text.playAreaLabel}">
          <div class="intro"><div class="eyebrow">${icon('sun')}${text.eyebrow}</div><h1>${text.titleFirst}<br><em>${text.titleSecond}</em></h1><p>${text.subtitle}</p></div>
          <div class="stash"><span class="stash-label">${text.yarn}</span><div class="stash-value">${icon('yarn')}<span data-testid="yarn" id="yarn-count">0</span></div><div class="stats-line"><span><i class="status-dot"></i><strong data-testid="rate" id="rate">0</strong> ${text.perSecond}</span><span class="stat-divider"></span><span>${icon('paw')}<strong data-testid="population" id="population">0</strong> ${text.workingCats}</span></div></div>
          <div class="world" id="world"><div class="scene-halo"></div><span class="room-label" id="room-label">${text.chapterLabel(0)}</span><button id="pull" class="yarn-target" aria-label="${text.pull}"><span class="sr-only">${text.pull}</span></button><div class="float-layer" id="float-layer" aria-hidden="true"></div><span class="scene-sparkle sparkle-one">✦</span><span class="scene-sparkle sparkle-two">✧</span></div>
          <div class="pull-hint"><span class="hint-icon">${icon('paw')}</span><span><strong>${text.holdHint}</strong><small id="tap-hint">${text.keyboardHint}</small></span><span class="per-tap" id="per-tap">+1</span></div>
          <div class="home-actions"><button class="soft-button" data-screen="crew">${icon('paw')}${text.team}${icon('arrow')}</button></div>
        </section>
        <aside class="tablet-panel-shell" hidden><div class="management" id="management" role="region" tabindex="0" aria-label="${text.managementLabel}"></div></aside>
      </main>
      <span class="tablet-home" aria-hidden="true"></span></div></div></div>
      <footer><span>${icon('heart')}${text.footer}</span><span>${text.prototype}</span></footer>
      <div class="notice" id="notice" role="status" hidden></div><div class="toast" id="toast" role="status" hidden></div>
      <dialog id="modal" aria-labelledby="modal-title"></dialog><input id="import-file" type="file" accept=".json,application/json" hidden />`;
    this.panel = root.querySelector('#management')!;
    this.dialog = root.querySelector('#modal')!;
    this.pull = root.querySelector('#pull')!;
    this.worldHost = root.querySelector('#world')!;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) if (node.textContent?.trim()) this.shellText.push({ node: node as Text, source: node.textContent });
    root.querySelectorAll('[aria-label]').forEach(node => this.shellLabels.push({ node, attribute: 'aria-label', source: node.getAttribute('aria-label')! }));
    setLanguage(language); this.localizeShell();
    root.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!button || button.disabled) return;
      if (button.dataset.screen) { this.navigate(button.dataset.screen as Screen); return; }
      if (button.dataset.quantity) { this.quantity = button.dataset.quantity === 'max' ? 'max' : Number(button.dataset.quantity) as 1 | 10; this.refresh(); return; }
      if (button.dataset.action) onAction(button.dataset.action, button.dataset.id);
    });
    root.addEventListener('change', event => { const target = event.target as HTMLSelectElement; if (target.id === 'achievement-filter') { this.achievementCategory = target.value; this.renderPanel(); this.refresh(); document.getElementById('achievement-filter')?.focus(); } });
    this.dialog.addEventListener('click', event => { if (event.target === this.dialog) { const rect = this.dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dialog.close(); } });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.screen === 'chapter' && !this.dialog.open) { event.preventDefault(); this.navigate('workshop'); }
    });
    this.renderPanel(); this.refresh();
    showLaunch(root, () => this.game().settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches, () => { this.launching = false; this.pull.focus({preventScroll:true}); });
  }

  private navigate(screen: Screen): void {
    const previous = this.screen;
    if (previous === screen) return;
    const activator = document.activeElement;
    const crossingRealms = (screen === 'chapter') !== (previous === 'chapter');
    const track = this.root.querySelector<HTMLElement>('.journey-track')!;
    // Sample before cancelling so a reversal starts at the current visual position.
    const origin = crossingRealms ? getComputedStyle(track).transform : '';
    if (crossingRealms) { this.travelAnimation?.cancel(); this.travelAnimation = null; }
    this.root.dispatchEvent(new Event('screenchange'));
    this.screen = screen; this.renderPanel(); this.refresh(); this.panel.scrollTop = 0;
    const reduced = this.game().settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (crossingRealms) {
      this.root.dataset.travel = reduced ? 'idle' : screen === 'chapter' ? 'ascending' : 'descending';
      this.root.classList.toggle('is-traveling', !reduced);
      if (!reduced) {
        const animation = track.animate([{transform:origin}, {transform:screen === 'chapter' ? 'translateY(100%)' : 'translateY(0)'}], {duration:900,easing:'cubic-bezier(.65,0,.25,1)'});
        this.travelAnimation = animation;
        animation.onfinish = () => {
          if (this.travelAnimation !== animation) return;
          this.travelAnimation = null;
          this.root.dataset.travel = 'idle'; this.root.classList.remove('is-traveling');
        };
      }
    } else if (!reduced) {
      const target = screen === 'workshop' ? this.root.querySelector<HTMLElement>('.play-area')! : this.panel;
      target.getAnimations().forEach(animation => animation.cancel());
      target.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], {duration:260,easing:'ease-out'});
    }
    if (screen === 'chapter') this.panel.querySelector<HTMLButtonElement>('[data-screen="workshop"]')?.focus({preventScroll:true});
    else if (previous === 'chapter') this.root.querySelector<HTMLButtonElement>('.navigation [data-screen="workshop"]')?.focus({preventScroll:true});
    else if (activator instanceof HTMLElement && (!activator.isConnected || activator.closest('[hidden],[inert]'))) {
      (screen === 'workshop' ? this.pull : this.panel).focus({preventScroll:true});
    }
  }

  activateCrew(id: ProducerId): void {
    this.panel.querySelector(`#card-${id}`)?.classList.add('crew-awakening');
  }

  localizeShell(): void {
    document.documentElement.lang = getLanguage();
    for (const { node, source } of this.shellText) if (node.isConnected) node.textContent = source.replace(source.trim(), tr(source.trim()));
    for (const { node, attribute, source } of this.shellLabels) node.setAttribute(attribute, tr(source));
  }

  renderPanel(): void {
    const game = this.game();
    const focused = document.activeElement?.id;
    const sky = this.screen === 'chapter';
    const home = this.screen === 'workshop';
    this.panel = this.root.querySelector(sky ? '#realm-management' : '#management')!;
    // Keep the departing tablet screen intact while the camera rises into the sky.
    if (!sky) {
      this.root.querySelector<HTMLElement>('.play-area')!.hidden = !home;
      this.root.querySelector<HTMLElement>('.tablet-panel-shell')!.hidden = home;
    }
    this.root.querySelector<HTMLElement>('.tablet-stage')!.inert = sky;
    this.root.querySelector<HTMLElement>('.sky-realm')!.inert = !sky;
    this.root.querySelector('.sky-realm')!.setAttribute('aria-hidden', String(!sky));
    this.root.querySelector('.tablet-stage')!.setAttribute('aria-hidden', String(sky));
    this.panel.dataset.screen = this.screen;
    this.root.classList.toggle('olympus-open', this.screen === 'chapter');
    const panels = { workshop: () => '', crew: () => crewPanel(game), upgrades: () => upgradePanel(game), achievements: () => achievementsPanel(game, this.achievementCategory), collection: () => collectionPanel(game), chapter: () => chapterPanel() };
    this.panel.innerHTML = panels[this.screen]();
    if (focused) document.getElementById(focused)?.focus({ preventScroll: true });
  }

  refresh(): void {
    const game = this.game();
    if (game.settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) this.travelAnimation?.finish();
    const set = (id: string, value: string) => { const el = document.getElementById(id); if (el && el.textContent !== value) el.textContent = value; };
    set('yarn-count', format(game.yarn.floor(), 0));
    set('tablet-yarn', format(game.yarn.floor(), 0));
    set('rate', format(production(game)));
    set('population', format(population(game), 0));
    set('per-tap', text.perTap(format(tapValue(game))));
    set('collection-count', `${game.collection.length}/6`);
    const unread = unreadAchievementCount(game);
    const unreadBadge = document.getElementById('achievement-unread-count');
    if (unreadBadge) {
      unreadBadge.textContent = String(unread);
      unreadBadge.hidden = unread === 0;
      const achievementsButton = unreadBadge.closest<HTMLButtonElement>('button')!;
      if (unread) achievementsButton.setAttribute('aria-describedby', unreadBadge.id);
      else achievementsButton.removeAttribute('aria-describedby');
    }
    set('room-label', text.chapterLabel(game.chapters));
    this.root.querySelectorAll<HTMLButtonElement>('.navigation button[data-screen]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.screen === this.screen)));
    this.root.querySelectorAll<HTMLButtonElement>('[data-quantity]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.quantity === String(this.quantity))));
    const nextCat = COATS.find((_, index) => !game.collection.includes(index));
    set('goal-title', nextCat ? text.nextGoal(nextCat.name) : text.familyTitle);
    set('tap-hint', population(game).eq(0) ? text.firstGoalDetail : text.keyboardHint);
    if (this.screen === 'crew') {
      const resting = String(game.settings.quality === 'low');
      this.panel.querySelectorAll<HTMLElement>('.crew-scene').forEach(scene => {
        if (scene.dataset.resting !== resting) scene.dataset.resting = resting;
      });
      PRODUCERS.forEach((item, i) => {
        const q = quote(game, item.id, this.quantity);
        const next = q.count ? q : quote(game, item.id, 1);
        const capped = game.owned[item.id] >= MAX_OWNED;
        const card = document.getElementById(`card-${item.id}`)!;
        card.classList.toggle('unaffordable', !q.affordable);
        set(`owned-${item.id}`, text.owned(format(game.owned[item.id], 0)));
        set(`cost-${item.id}`, capped ? text.maxed : format(next.cost, 0));
        set(`yield-${item.id}`, text.productionAdded(format(producerOutput(game, item.id, next.count || 1))));
        const buy = document.getElementById(`buy-${item.id}`) as HTMLButtonElement;
        buy.disabled = !q.affordable || capped;
        buy.title = capped ? text.cap : text.catsAdded(format(item.cats * next.count));
      });
    }
    if (this.screen === 'collection') refreshCompanions(this.panel, game);
    if (this.screen === 'upgrades') {
      for (const upgrade of UPGRADES) {
        const button = document.getElementById(`upgrade-${upgrade.id}`) as HTMLButtonElement | null;
        if (!button) continue;
        const bought = game.upgrades.includes(upgrade.id);
        // Notes remain inspectable even when unaffordable or already purchased.
        button.disabled = false;
        button.classList.toggle('purchased', bought);
        set(`upgrade-price-${upgrade.id}`, bought ? text.bought : format(upgradeCost(game, upgrade), 0));
      }
    }
    const confirm = this.dialog.querySelector<HTMLButtonElement>('[data-action="upgrade"]');
    if (confirm) {
      const item = UPGRADES.find(item => item.id === confirm.dataset.id);
      confirm.disabled = !item || game.upgrades.includes(item.id) || game.yarn.lt(upgradeCost(game, item)) || (item.id === 'master' && !game.talents.includes('knitters'));
    }
    const talentConfirm = this.dialog.querySelector<HTMLButtonElement>('[data-action="talent"]');
    if (talentConfirm) {
      const talent = TALENTS.find(item => item.id === talentConfirm.dataset.id);
      talentConfirm.disabled = !talent || game.talents.includes(talent.id) || game.points.lt(talent.cost);
    }
    if (this.screen === 'achievements') {
      set('achievement-count', text.achievementsCount(game.achievements.length, ACHIEVEMENTS.length));
      for (const item of ACHIEVEMENTS) {
        const card = document.getElementById(`achievement-${item.id}`); if (!card) continue;
        const earned = game.achievements.includes(item.id), progress = achievementProgress(game, item);
        card.classList.toggle('earned', earned);
        set(`badge-status-${item.id}`, earned ? text.unlocked : `${format(progress.value, 0)} / ${format(item.target, 0)}`);
        (document.getElementById(`badge-bar-${item.id}`) as HTMLElement).style.width = `${progress.ratio * 100}%`;
      }
    }
    if (this.screen === 'chapter') {
      const reward = prestigeReward(game);
      set('prestige-reward', text.reward('1'));
      const next = Decimal.max(0, prestigeGoal(game).sub(game.runEarned));
      set('prestige-remaining', reward.gte(1) ? text.restartReady : text.remaining(format(next, 0)));
      const progress = Math.min(100, game.runEarned.div(prestigeGoal(game)).mul(100).toNumber());
      const bar = this.panel.querySelector<HTMLElement>('.chapter-progress')!;
      bar.setAttribute('aria-valuenow', String(Math.floor(progress)));
      bar.querySelector<HTMLElement>('i')!.style.width = `${progress}%`;
      (document.getElementById('prestige-button') as HTMLButtonElement).disabled = reward.lt(1);
      set('points-label', text.spendPoints(format(game.points, 0)));
      TALENTS.forEach(talent => {
        const bought = game.talents.includes(talent.id);
        const button = document.getElementById(`talent-${talent.id}`) as HTMLButtonElement;
        button.disabled = false;
        button.setAttribute('aria-label', `${text.inspect} ${tr(talent.god)} · ${tr(talent.name)}${bought ? ' · ' + text.bought : ''}`);
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
  showPrivacy(): void { this.showDialog(privacyContent(getLanguage())); }
  showSettings(): void {
    const settings = this.game().settings;
    this.showDialog(`<span class="eyebrow">${text.settings}</span><h2 id="modal-title">${text.settingsTitle}</h2><label class="setting-row" for="language">${text.language}<select id="language"><option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option><option value="es" ${settings.language === 'es' ? 'selected' : ''}>Español</option></select></label><label class="setting-row" for="music-volume">${text.musicVolume}<input id="music-volume" type="range" min="0" max="1" step="0.05" value="${settings.musicVolume}" /></label><label class="setting-row" for="volume">${text.volume}<input id="volume" type="range" min="0" max="1" step="0.05" value="${settings.volume}" /></label><label class="setting-row" for="motion">${text.reducedMotion}<input id="motion" type="checkbox" ${settings.reducedMotion ? 'checked' : ''} /></label><label class="setting-row" for="quality">${text.quality}<select id="quality"><option value="auto" ${settings.quality === 'auto' ? 'selected' : ''}>${text.auto}</option><option value="low" ${settings.quality === 'low' ? 'selected' : ''}>${text.low}</option><option value="high" ${settings.quality === 'high' ? 'selected' : ''}>${text.high}</option></select></label><div class="save-actions"><button class="soft-button" data-action="export">${icon('download')}${text.export}</button><button class="soft-button" data-action="import">${text.import}</button></div><p class="dialog-note">${text.saveHint}</p><p class="dialog-note">${text.cap}</p><button class="soft-button" data-action="privacy">${tr('Privacy policy')}</button><p class="music-credit">♫ Apple Cider · Zane Little Music · CC0</p>`);
  }
}
