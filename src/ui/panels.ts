import { PRODUCERS, UPGRADES, TALENTS } from '../game/catalog';
import { ACHIEVEMENTS } from '../game/achievements';
import type { GameState } from '../game/engine';
import { text } from './copy';
import { translate as tr } from './localization';
import { format } from './format';
import { icon } from './icons';
import { crewScenery } from './crew-art';

export function crewPanel(game: GameState): string {
  return `<div class="panel-intro compact-intro"><span class="eyebrow">${text.shopEyebrow}</span><h2>${text.shopTitle}</h2><p>${text.crewTypes}</p></div>
    <div class="section-heading"><h3>${icon('paw')}${text.team}</h3><div class="quantity" aria-label="${text.quantityLabel}"><button data-quantity="1">×1</button><button data-quantity="10">×10</button><button data-quantity="max">${text.max}</button></div></div>
    <div class="producer-list">${PRODUCERS.map((item, i) => `<article class="producer" id="card-${item.id}" title="${tr(item.detail)}">${crewScenery(item, game.owned[item.id], game.settings.quality === 'low')}<div class="crew-pattern" aria-hidden="true">${Array.from({length: Math.min(18, game.owned[item.id])}, (_, n) => `<span class="crew-motif" style="left:${6 + (n * 19) % 90}%;top:${7 + (n * 29) % 60}%;transform:rotate(${(n * 37) % 50 - 25}deg)">${icon(item.icon)}</span>`).join('')}</div><div class="producer-icon ${item.color}">${icon('cat')}<span class="role-badge">${icon(item.icon)}</span></div><div class="producer-info"><div class="producer-title"><h4>${tr(item.name)}</h4><span class="owned" id="owned-${item.id}">0</span></div><span class="yield" id="yield-${item.id}"></span></div><button class="buy-button" id="buy-${item.id}" data-action="buy" data-id="${item.id}" aria-label="${text.adopt(tr(item.name))}">${icon('yarn')}<span id="cost-${item.id}"></span>${icon('plus', 'buy-plus')}</button></article>`).join('')}</div><p class="panel-note">${icon('heart')}${text.breakHint}</p>`;
}

export function upgradePanel(game: GameState): string {
  return `<div class="panel-intro"><span class="eyebrow">${text.boardEyebrow}</span><h2>${text.boardTitle}</h2><p>${text.upgradeHint}</p></div>
    <div class="upgrade-board"><div class="board-heading">${icon('cat')}<span>${text.upgrades}</span>${icon('paw')}</div>
    <div class="board-notes">${[...UPGRADES].sort((a,b) => a.cost - b.cost).map((item, index) => `<button class="upgrade sticky-note note-${index % 4}" id="upgrade-${item.id}" data-action="upgrade-info" data-id="${item.id}" aria-label="${text.inspect} ${tr(item.name)}"><span class="note-pin" aria-hidden="true"></span><span class="note-cat" aria-hidden="true">${icon(item.icon)}</span><strong>${tr(item.name)}</strong>${item.id === 'master' && !game.talents.includes('knitters') ? `<span class="note-lock" aria-hidden="true">${icon('lock')}</span>` : ''}<span class="upgrade-price" id="upgrade-price-${item.id}">${format(item.cost)}</span></button>`).join('')}</div>
    <p class="chalk-note">${text.boardNote}</p><div class="board-ledge" aria-hidden="true"><i></i><i></i></div></div><p class="panel-note">${text.boardReset}</p>`;
}

export function chapterPanel(): string {
  return `<header class="realm-toolbar"><button class="icon-button realm-back" data-screen="workshop" aria-label="${text.backWorkshop}" title="${text.backWorkshop}">${icon('arrow')}</button><div class="realm-title"><span class="eyebrow">${text.olympusEyebrow}</span><h2>${text.olympusTitle}</h2><span class="realm-balance">${icon('paw')}<strong id="points-label"></strong></span></div><button class="icon-button" data-action="settings" aria-label="${text.settings}">${icon('settings')}</button></header>
    <div class="olympus"><div class="talent-list">${TALENTS.map(item => `<button class="talent statue-card" id="talent-${item.id}" data-action="talent-info" data-id="${item.id}" aria-label="${text.inspect} ${tr(item.god)} · ${tr(item.name)}"><span class="statue-viewport" data-statue-id="${item.id}" aria-hidden="true"><span class="statue-fallback">${icon(item.icon)}</span></span><span class="statue-label"><strong>${tr(item.god)}</strong><span class="blessing-name">${tr(item.name)}</span><span class="talent-price" id="talent-price-${item.id}">${text.spendPoints(item.cost)}</span></span></button>`).join('')}</div></div>
    <section class="chapter-card"><div class="chapter-summary"><span class="tiny-label">${text.resetRewardLabel}</span><strong id="prestige-reward"></strong><p>${text.fixedRewardHint}</p></div><div class="chapter-action"><p id="prestige-remaining"></p><div class="chapter-progress" role="progressbar" aria-label="${text.chapterGoal}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><button class="primary-button" data-action="prestige" id="prestige-button">${text.prestigeButton}${icon('arrow')}</button></div></section>`;
}
export { collectionPanel } from './companions';
export function achievementsPanel(game: GameState, category: string): string {
  const categories = [...new Set(ACHIEVEMENTS.map(item => item.category))];
  return `<div class="panel-intro"><span class="eyebrow">${text.achievementsTab}</span><h2>${text.achievementsTitle}</h2><p>${text.patchHint}</p></div><div class="achievement-toolbar"><strong id="achievement-count">${text.achievementsCount(game.achievements.length, ACHIEVEMENTS.length)}</strong><label class="sr-only" for="achievement-filter">${text.achievementCategory}</label><select id="achievement-filter"><option value="all">${text.allCategories}</option>${categories.map(name => `<option value="${name}" ${name === category ? 'selected' : ''}>${tr(name)}</option>`).join('')}</select></div><div class="achievement-grid patch-blanket">${ACHIEVEMENTS.filter(item => category === 'all' || item.category === category).map((item, index) => `<button class="achievement-card achievement-patch patch-${index % 5}" id="achievement-${item.id}" data-action="achievement-info" data-id="${item.id}" aria-label="${tr(item.name)}" style="--tilt:${[-7,5,-3,8,-5,2][index % 6]}deg;--offset:${[0,7,2,8,0,5][index % 6]}px"><span class="badge-art" aria-hidden="true">${icon(item.icon)}</span><strong>${tr(item.name)}</strong><span class="badge-progress"><i id="badge-bar-${item.id}"></i></span><small id="badge-status-${item.id}"></small></button>`).join('')}</div>`;
}
