import Decimal from 'break_infinity.js';
import './ui/style.css';
import './ui/responsive.css';
import './ui/expansion.css';
import './ui/experience.css';
import './ui/olympus.css';
import './ui/companions.css';
import './ui/tablet.css';
import { PRODUCERS, UPGRADES, TALENTS, COATS } from './game/catalog';
import { advance, buyProducer, buyUpgrade, createGame, tap, tapValue, criticalChance, type GameState } from './game/engine';
import { applyOffline, buyTalent, prestige, prestigeReward, selectCoat } from './game/progression';
import { BACKUP_KEY, SAVE_KEY, decode, encode, loadGame, saveGame, type StoragePort } from './game/storage';
import { CozyAudio } from './audio';
import { CozyMusic } from './scene/music';
import { setLanguage, translate as tr } from './ui/localization';
import { GameUI } from './ui/view';
import { text } from './ui/copy';
import { icon } from './ui/icons';
import { format } from './ui/format';
import { ACHIEVEMENTS, achievementProgress } from './game/achievements';
import { HoldInput } from './game/input';
import type { WorkshopWorld } from './scene/world';
import type { OlympusWorld } from './scene/olympus';

const root = document.getElementById('app')!;
function download(raw: string, name = 'purrfect-threads-save.json'): void {
  const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface Session { active: boolean; onHide?: () => void }

async function start(session: Session): Promise<void> {
  if (!session.active) return;
  let storage: StoragePort | undefined;
  try {
    const local = window.localStorage;
    storage = {
      getItem: key => local.getItem(key),
      setItem: (key, value) => {
        if (!session.active) throw new Error('This document no longer owns the save.');
        local.setItem(key, value);
      },
    };
  } catch { /* Explicit warning shown below. */ }
  const loaded = storage ? loadGame(storage, Date.now()) : { game: createGame(), status: 'unavailable', offline: new Decimal(0) };
  if (!loaded.game) {
    root.innerHTML = `<main class="boot-message"><h1>${text.corruptTitle}</h1><p>${text.corruptBody}</p><button class="soft-button" id="download-damaged">${text.downloadDamaged}</button><label class="soft-button" for="restore-file">${text.import}</label><input id="restore-file" type="file" accept=".json,application/json" /><button class="soft-button" id="fresh">${text.fresh}</button><p id="restore-error" role="alert"></p></main>`;
    document.getElementById('download-damaged')!.onclick = () => download(JSON.stringify({ primary: storage!.getItem(SAVE_KEY), backup: storage!.getItem(BACKUP_KEY) }), 'purrfect-threads-recovery.json');
    document.getElementById('fresh')!.onclick = () => {
      if (!session.active) return;
      download(JSON.stringify({ primary: storage!.getItem(SAVE_KEY), backup: storage!.getItem(BACKUP_KEY) }), 'purrfect-threads-recovery.json');
      try { saveGame(storage!, createGame(), Date.now()); void start(session); } catch { document.getElementById('restore-error')!.textContent = text.saveError; }
    };
    document.getElementById('restore-file')!.onchange = async event => {
      const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
      try {
        if (file.size > 100000) throw new Error('Oversized save.');
        const restored = decode(await file.text());
        if (!session.active) return;
        saveGame(storage!, restored, restored.savedAt); void start(session);
      } catch { document.getElementById('restore-error')!.textContent = text.invalidImport; }
    };
    return;
  }

  let game = loaded.game;
  setLanguage(game.settings.language);
  let world: WorkshopWorld | undefined;
  let olympus: OlympusWorld | undefined;
  let olympusHost: HTMLElement | null = null;
  let olympusPending = false;
  function syncOlympus(): void {
    const host = (ui.screen === 'chapter' || root.classList.contains('is-traveling')) ? root.querySelector<HTMLElement>('.olympus') : null;
    if (host !== olympusHost) { olympus?.dispose(); olympus = undefined; olympusHost = host; }
    if (ui.screen === 'chapter' && host && !olympus && !olympusPending && !host.dataset.ready) {
      olympusPending = true;
      void import('./scene/olympus').then(({ OlympusWorld }) => {
        if (!session.active || ui.screen !== 'chapter' || host !== root.querySelector('.olympus')) return;
        olympus = new OlympusWorld(host);
        if (!olympus.supported) { olympus.dispose(); olympus = undefined; throw new Error('WebGL unavailable.'); }
        olympus.sync(game.talents, game.settings.quality);
        host.dataset.ready = 'true';
      }).catch(() => { if (host.isConnected) { host.dataset.ready = 'fallback'; ui.notice(text.statuesUnavailable); } }).finally(() => { olympusPending = false; });
    }
    olympus?.sync(game.talents, game.settings.quality);
  }
  window.addEventListener('pagehide', () => { olympus?.dispose(); }, { once: true });
  const audio = new CozyAudio();
  const music = new CozyMusic();
  music.setVolume(game.settings.musicVolume); music.setVisible(!document.hidden);
  const unlockMusic = () => { if (session.active) music.unlock(); };
  root.addEventListener('pointerdown', unlockMusic);
  document.addEventListener('keydown', unlockMusic);
  window.addEventListener('pagehide', () => music.dispose(), { once: true });
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let previous = performance.now(), suspended = document.hidden;
  let lastSave = previous, lastUI = -1000;
  let importPending = false;
  let seenAchievements = new Set(game.achievements);
  let seenCompanions = new Set(game.collection);
  const ui = new GameUI(root, () => game, action);
  const reduced = () => game.settings.reducedMotion || motionPreference.matches;
  const held = new HoldInput(pull);
  const stopHolding = () => held.cancel();
  root.addEventListener('screenchange', stopHolding);
  const persist = () => {
    if (!session.active) return;
    // Also checkpoint in-memory sessions: active time is never offline time.
    const now = Date.now();
    game.savedAt = Math.max(game.savedAt, now);
    if (!storage) { ui.saveStatus(false); return; }
    try { saveGame(storage, game, now); ui.saveStatus(true); }
    catch { ui.saveStatus(false); ui.notice(text.saveError); }
  };
  function settle(): void {
    const now = performance.now();
    if (!suspended) advance(game, Math.max(0, (now - previous) / 1000));
    previous = now;
  }
  function refresh(message?: string): void {
    const fresh = game.achievements.filter(id => !seenAchievements.has(id));
    const achievementMessage = fresh.length === 1 ? text.achievementUnlocked(tr(ACHIEVEMENTS.find(item => item.id === fresh[0])!.name)) : fresh.length > 1 ? text.achievementsUnlocked(fresh.length) : '';
    const newCompanions = game.collection.filter(id => !seenCompanions.has(id));
    const companionMessage = newCompanions.map(id => text.milestone(COATS[id].name)).join(' · ');
    if (message || achievementMessage || companionMessage) ui.toast([message, companionMessage, achievementMessage].filter(Boolean).join(' · '));
    seenCompanions = new Set(game.collection);
    if (newCompanions.length) persist();
    seenAchievements = new Set(game.achievements);
    document.body.classList.toggle('reduced-motion', reduced());
    world?.sync(game); ui.refresh();
    const sound = document.getElementById('sound-button')!;
    const audible = game.settings.volume > 0 || game.settings.musicVolume > 0;
    sound.innerHTML = icon(audible ? 'sound' : 'muted');
    sound.setAttribute('aria-label', audible ? text.mute : text.unmute);
  }
  function pull(scheduledTime = performance.now()): void {
    if (!session.active || ui.screen !== 'workshop' || ui.dialog.open || suspended || importPending) return;
    const now = performance.now();
    const amount = tap(game, scheduledTime);
    if (amount.gt(0)) { world?.pulse(now); ui.floating(`${format(amount)}${amount.gt(tapValue(game)) ? ' · ' + text.critical : ''}`, reduced()); audio.play(game.settings.volume); ui.refresh(); }
  }
  function changed(message?: string): void {
    persist(); ui.renderPanel(); refresh(message);
    if (message) audio.play(game.settings.volume, true);
  }
  function action(kind: string, id?: string): void {
    if (!session.active) return;
    settle();
    if (kind === 'buy') {
      const producer = PRODUCERS.find(item => item.id === id); if (!producer) return;
      const firstTeam = game.owned[producer.id] === 0;
      const count = buyProducer(game, producer.id, ui.quantity);
      if (count) {
        changed(text.crewJoined(format(count * producer.cats)));
        if (firstTeam) ui.activateCrew(producer.id);
      }
    } else if (kind === 'upgrade') {
      const upgrade = UPGRADES.find(item => item.id === id);
      if (upgrade && buyUpgrade(game, upgrade.id)) { ui.dialog.close(); changed(text.upgradeBought); document.getElementById(`upgrade-${id}`)?.focus({preventScroll:true}); }
    } else if (kind === 'upgrade-info') {
      const upgrade = UPGRADES.find(item => item.id === id); if (!upgrade) return;
      stopHolding();
      ui.showDialog(`<span class="detail-art">${icon(upgrade.icon)}</span><span class="eyebrow">${text.thisChapter}</span><h2 id="modal-title">${tr(upgrade.name)}</h2><p>${tr(upgrade.detail)}</p><p>${text.boardReset}</p>${['bell','clover','whiskers'].includes(upgrade.id) ? `<p>${text.criticalOdds(criticalChance(game) * 100)}</p>` : ''}${upgrade.id === 'master' && !game.talents.includes('knitters') ? `<p>${text.lockedTalent}</p>` : ''}<p class="detail-cost">${text.cost(format(upgrade.cost))}</p><button class="primary-button" data-action="upgrade" data-id="${upgrade.id}">${game.upgrades.includes(upgrade.id) ? text.bought : text.buy(tr(upgrade.name))}</button>`);
      ui.refresh();
    } else if (kind === 'achievement-info') {
      const item = ACHIEVEMENTS.find(item => item.id === id); if (!item) return;
      stopHolding(); const progress = achievementProgress(game,item);
      ui.showDialog(`<span class="detail-art embroidered">${icon(item.icon)}</span><span class="eyebrow">${tr(item.category)}</span><h2 id="modal-title">${tr(item.name)}</h2><p>${tr(item.detail)}</p><p>${game.achievements.includes(item.id) ? text.unlocked : `${format(progress.value,0)} / ${format(item.target,0)}`}</p><div class="badge-progress"><i style="width:${progress.ratio * 100}%"></i></div><p>${text.achievementsSubtitle}</p>`);
    } else if (kind === 'talent-info') {
      const talent = TALENTS.find(item => item.id === id); if (!talent) return;
      stopHolding();
      ui.showDialog(`<span class="detail-art">${icon(talent.icon)}</span><span class="eyebrow">${tr(talent.god)} · ${text.divineBlessings}</span><h2 id="modal-title">${tr(talent.name)}</h2><p>${tr(talent.detail)}</p><p>${text.statueHint}</p><p class="detail-cost">${text.spendPoints(talent.cost)}</p><button class="primary-button" data-action="talent" data-id="${talent.id}">${game.talents.includes(talent.id) ? text.bought : text.buy(tr(talent.name))}</button>`);
      ui.refresh();
    } else if (kind === 'talent') {
      const talent = TALENTS.find(item => item.id === id);
      if (talent && buyTalent(game, talent.id)) { ui.dialog.close(); changed(text.talentBought); document.getElementById(`talent-${id}`)?.focus({preventScroll:true}); }
    } else if (kind === 'coat') {
      if (selectCoat(game, Number(id))) changed();
    } else if (kind === 'prestige') {
      stopHolding();
      ui.showDialog(`<span class="eyebrow">${text.chapter}</span><h2 id="modal-title">${text.resetTitle}</h2><p><strong>${text.reward(format(prestigeReward(game), 0))}</strong></p><p>${text.resetLose}</p><p>${text.resetKeep}</p><div class="dialog-actions"><button class="soft-button" data-action="close">${text.cancel}</button><button class="primary-button" data-action="confirm-prestige">${text.confirm}</button></div>`);
    } else if (kind === 'confirm-prestige') {
      if (prestige(game)) { ui.dialog.close(); changed(text.freshStart); }
    } else if (kind === 'settings') {
      stopHolding(); ui.showSettings();
    } else if (kind === 'sound') {
      const audible = game.settings.volume > 0 || game.settings.musicVolume > 0;
      game.settings.volume = audible ? 0 : 0.35; game.settings.musicVolume = audible ? 0 : 0.2;
      music.setVolume(game.settings.musicVolume); music.unlock(); persist(); refresh();
    } else if (kind === 'close') ui.dialog.close();
    else if (kind === 'export') { persist(); download(encode(game)); }
    else if (kind === 'import') document.getElementById('import-file')!.click();
  }

  ui.pull.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault(); ui.pull.focus({ preventScroll: true });
    ui.pull.setPointerCapture(event.pointerId); held.press('pointer', performance.now());
  });
  ui.pull.addEventListener('pointerup', () => held.release('pointer', performance.now()));
  ui.pull.addEventListener('pointercancel', () => held.release('pointer', performance.now()));
  ui.pull.addEventListener('lostpointercapture', () => held.release('pointer', performance.now()));
  ui.pull.addEventListener('click', event => { if (event.detail === 0) pull(); });
  document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.repeat || ui.dialog.open || ui.screen !== 'workshop') return;
    const focused = document.activeElement;
    if (focused !== document.body && focused !== ui.pull) return;
    event.preventDefault(); held.press('keyboard', performance.now());
  });
  document.addEventListener('keyup', event => { if (event.code === 'Space') { held.release('keyboard', performance.now()); } });
  window.addEventListener('blur', stopHolding);
  ui.dialog.addEventListener('input', event => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    if (target.id === 'volume') game.settings.volume = Math.max(0, Math.min(1, Number(target.value)));
    if (target.id === 'music-volume') { game.settings.musicVolume = Math.max(0, Math.min(1, Number(target.value))); music.setVolume(game.settings.musicVolume); }
    if (target.id === 'language' && (target.value === 'en' || target.value === 'es')) {
      game.settings.language = target.value; setLanguage(target.value); ui.localizeShell(); ui.renderPanel(); ui.showSettings(); document.getElementById('language')?.focus();
    }
    if (target.id === 'motion') game.settings.reducedMotion = (target as HTMLInputElement).checked;
    if (target.id === 'quality' && ['auto', 'low', 'high'].includes(target.value)) game.settings.quality = target.value as GameState['settings']['quality'];
    persist(); refresh();
  });
  motionPreference.addEventListener('change', () => refresh());
  document.getElementById('import-file')!.addEventListener('change', async event => {
    const input = event.target as HTMLInputElement, file = input.files?.[0];
    if (!file) return;
    importPending = true; stopHolding();
    try {
      if (file.size > 100000) throw new Error('Oversized save.');
      const incoming = decode(await file.text());
      if (!session.active) return;
      if (!window.confirm(text.importConfirm)) return;
      if (!session.active) return;
      settle(); download(encode(game), 'purrfect-threads-before-import.json');
      applyOffline(incoming, Date.now());
      if (storage) saveGame(storage, incoming, Date.now());
      game = incoming; previous = performance.now();
      seenCompanions = new Set(game.collection); seenAchievements = new Set(game.achievements);
      setLanguage(game.settings.language); ui.localizeShell(); music.setVolume(game.settings.musicVolume);
      ui.dialog.close(); changed(text.imported);
    } catch { ui.toast(text.invalidImport); }
    finally { input.value = ''; importPending = false; }
  });

  function hide(): void {
    music.setVisible(false);
    stopHolding();
    if (suspended || !session.active) return;
    settle(); persist(); suspended = true;
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hide();
    else if (session.active) {
      music.setVisible(true);
      const amount = applyOffline(game, Date.now());
      previous = performance.now(); suspended = false; persist(); refresh(amount.gte(1) ? text.offline(format(amount)) : undefined);
    }
  });
  session.onHide = hide;
  if (loaded.status === 'recovered') ui.notice(text.recovered);
  if (loaded.status === 'unavailable') ui.notice(text.saveError);
  if (loaded.offline.gte(1)) ui.toast(text.offline(format(loaded.offline)));
  try {
    const { WorkshopWorld } = await import('./scene/world');
    if (!session.active) return;
    world = new WorkshopWorld(ui.worldHost);
    world.sync(game); world.render(performance.now(), 0, reduced());
    ui.worldHost.dataset.ready = 'true';
  } catch {
    ui.worldHost.classList.add('webgl-fallback'); ui.notice(text.webgl);
  }
  refresh(); previous = performance.now(); persist();
  function frame(now: number): void {
    const delta = Math.max(0, (now - previous) / 1000);
    previous = now;
    if (!suspended && session.active) {
      advance(game, delta);
      held.flush(now);
      if (now - lastUI >= 160) { refresh(); lastUI = now; }
      syncOlympus();
      olympus?.render(now, reduced());
      if (ui.screen === 'workshop') world?.render(now, delta, reduced());
      if (now - lastSave >= 5000) {
        persist(); lastSave = now;
        if (world) ui.worldHost.dataset.metrics = JSON.stringify(world.stats);
      }
    }
    if (session.active) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// One writer per origin prevents stale tabs overwriting a newer workshop.
if (navigator.locks) {
  void navigator.locks.request('purrfect-threads-owner', { ifAvailable: true }, async lock => {
    if (!lock) { root.innerHTML = `<main class="boot-message"><h1>${text.duplicateTitle}</h1><p>${text.duplicateBody}</p></main>`; return; }
    const session: Session = { active: true };
    const documentLifetime = new Promise<void>(resolve => window.addEventListener('pagehide', () => {
      session.onHide?.();
      session.active = false;
      resolve();
    }, { once: true }));
    // Every entry path, including corrupt-save recovery, must reacquire ownership.
    window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
    // Loading 3D must not extend ownership beyond the document's lifetime.
    void start(session).catch(() => {
      if (session.active) root.innerHTML = `<main class="boot-message"><h1>${text.corruptTitle}</h1><p>${text.startError}</p></main>`;
    });
    await documentLifetime;
  });
} else {
  root.innerHTML = `<main class="boot-message"><h1>${text.browserTitle}</h1><p>${text.browserBody}</p></main>`;
}
