import { COATS } from '../game/catalog';
import { activeCompanion, companionProgress, type GameState } from '../game/engine';
import { text } from './copy';
import { translate as tr } from './localization';
import { format } from './format';
import { icon } from './icons';

const requirementLabels: Record<string, string> = {
  population: 'Cats in this chapter', taps: 'Lifetime touches', upgradePurchases: 'Upgrades purchased',
  offlineYarn: 'Offline yarn earned', chapters: 'Completed restarts',
};

function progressRows(game: GameState, index: number): string {
  return companionProgress(game, index).requirements.map(item =>
    `<span class="companion-requirement"><span>${tr(requirementLabels[item.key])}</span><strong>${format(item.current, 0)} / ${format(item.target, 0)}</strong></span>`,
  ).join('');
}

export function collectionPanel(game: GameState): string {
  const active = activeCompanion(game);
  return `<div class="panel-intro compact-intro"><span class="eyebrow">${text.collectionEyebrow}</span><h2>${text.collectionTitle}</h2><p>${text.collectionSubtitle}</p></div>
    <div class="companion-summary" id="companion-summary"><span class="companion-summary-icon" aria-hidden="true">${icon('heart')}</span><div><strong id="active-companion-name">${active ? active.name : text.emptyCushion}</strong><p id="active-companion-buff">${active ? tr(active.buff) : text.companionWaiting}</p></div></div>
    <p class="companion-rule">${text.companionRule}</p><p class="collection-goal" id="goal-title"></p>
    <div class="collection-grid home-companions">${COATS.map((coat, i) => {
      const unlocked = game.collection.includes(i), selected = unlocked && game.coat === i;
      const ratio = unlocked ? 1 : companionProgress(game, i).ratio;
      const label = selected ? text.selected : unlocked ? text.select : text.locked;
      return `<article class="coat-card companion-card ${unlocked ? '' : 'locked-coat'} ${selected ? 'selected-companion' : ''}" id="companion-${coat.id}">
        <div class="companion-portrait"><img src="${import.meta.env.BASE_URL}art/companions/${coat.id}.webp" width="512" height="512" alt="${coat.name}" decoding="async" /><span class="companion-lock" aria-hidden="true">${icon('lock')}</span></div>
        <h3>${coat.name}</h3><p class="companion-personality">${tr(coat.personality)}</p>
        <div class="companion-buff"><span>${text.companionBonus}</span><strong>${tr(coat.buff)}</strong></div>
        <p class="companion-challenge">${tr(coat.challenge)}</p>
        <div class="companion-progress" data-companion-progress="${i}" role="progressbar" aria-label="${text.companionChallenge} · ${coat.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.floor(ratio * 100)}"><i style="width:${ratio * 100}%"></i></div>
        <div class="companion-requirements" id="companion-requirements-${i}">${unlocked ? `<span>${text.unlockedForever}</span>` : progressRows(game, i)}</div>
        <button id="select-companion-${i}" class="soft-button" data-action="coat" data-id="${i}" aria-pressed="${selected}" aria-label="${label} · ${coat.name}" ${unlocked ? '' : 'disabled'}>${label}</button>
      </article>`;
    }).join('')}</div>`;
}

/** Refresh progress without rebuilding images or stealing keyboard focus. */
export function refreshCompanions(panel: HTMLElement, game: GameState): void {
  const active = activeCompanion(game);
  panel.querySelector('#active-companion-name')!.textContent = active?.name ?? text.emptyCushion;
  panel.querySelector('#active-companion-buff')!.textContent = active ? tr(active.buff) : text.companionWaiting;
  COATS.forEach((coat, i) => {
    const card = panel.querySelector<HTMLElement>(`#companion-${coat.id}`)!;
    const unlocked = game.collection.includes(i), selected = unlocked && game.coat === i;
    card.classList.toggle('locked-coat', !unlocked); card.classList.toggle('selected-companion', selected);
    const button = card.querySelector<HTMLButtonElement>('button')!;
    const label = selected ? text.selected : unlocked ? text.select : text.locked;
    button.disabled = !unlocked; button.textContent = label;
    button.setAttribute('aria-label', `${label} · ${coat.name}`); button.setAttribute('aria-pressed', String(selected));
    const ratio = unlocked ? 1 : companionProgress(game, i).ratio;
    const bar = card.querySelector<HTMLElement>('[data-companion-progress]')!;
    bar.setAttribute('aria-valuenow', String(Math.floor(ratio * 100)));
    bar.querySelector<HTMLElement>('i')!.style.width = `${ratio * 100}%`;
    const requirements = card.querySelector<HTMLElement>('.companion-requirements')!;
    const content = unlocked ? `<span>${text.unlockedForever}</span>` : progressRows(game, i);
    if (requirements.innerHTML !== content) requirements.innerHTML = content;
  });
}
