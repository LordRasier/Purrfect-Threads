import { COATS, PRODUCERS, UPGRADES, TALENTS } from '../game/catalog';
import { ACHIEVEMENTS } from '../game/achievements';
import type { GameState } from '../game/engine';
import { text } from './copy';
import { translate as tr } from './localization';
import { format } from './format';
import { icon } from './icons';

export function crewPanel(game: GameState): string {
  return `<div class="panel-intro compact-intro"><span class="eyebrow">${text.shopEyebrow}</span><h2>${text.shopTitle}</h2><p>${text.crewTypes}</p></div>
    <div class="section-heading"><h3>${icon('paw')}${text.team}</h3><div class="quantity" aria-label="${text.quantityLabel}"><button data-quantity="1">×1</button><button data-quantity="10">×10</button><button data-quantity="max">${text.max}</button></div></div>
    <div class="producer-list">${PRODUCERS.map((item, i) => `<article class="producer" id="card-${item.id}" title="${tr(item.detail)}"><div class="crew-pattern" aria-hidden="true">${Array.from({length: Math.min(18, game.owned[item.id])}, (_, n) => `<span class="crew-motif" style="left:${6 + (n * 19) % 90}%;top:${7 + (n * 29) % 60}%;transform:rotate(${(n * 37) % 50 - 25}deg)">${icon(item.icon)}</span>`).join('')}</div><div class="producer-icon ${item.color}">${icon('cat')}<span class="role-badge">${icon(item.icon)}</span></div><div class="producer-info"><div class="producer-title"><h4>${tr(item.name)}</h4><span class="owned" id="owned-${item.id}">0</span></div><span class="yield" id="yield-${item.id}"></span></div><button class="buy-button" id="buy-${item.id}" data-action="buy" data-id="${item.id}" aria-label="${text.adopt(tr(item.name))}">${icon('yarn')}<span id="cost-${item.id}"></span>${icon('plus', 'buy-plus')}</button></article>`).join('')}</div><p class="panel-note">${icon('heart')}${text.breakHint}</p>`;
}

export function upgradePanel(game: GameState): string {
  return `<div class="panel-intro"><span class="eyebrow">${text.boardEyebrow}</span><h2>${text.boardTitle}</h2><p>${text.upgradeHint}</p></div>
    <div class="upgrade-board"><div class="board-heading">${icon('cat')}<span>${text.upgrades}</span>${icon('paw')}</div>
    <div class="board-notes">${[...UPGRADES].sort((a,b) => a.cost - b.cost).map((item, index) => `<button class="upgrade sticky-note note-${index % 4}" id="upgrade-${item.id}" data-action="upgrade-info" data-id="${item.id}" aria-label="${text.inspect} ${tr(item.name)}"><span class="note-pin" aria-hidden="true"></span><span class="note-cat" aria-hidden="true">${icon(item.icon)}</span><strong>${tr(item.name)}</strong>${item.id === 'master' && !game.talents.includes('knitters') ? `<span class="note-lock" aria-hidden="true">${icon('lock')}</span>` : ''}<span class="upgrade-price" id="upgrade-price-${item.id}">${format(item.cost)}</span></button>`).join('')}</div>
    <p class="chalk-note">${text.boardNote}</p><div class="board-ledge" aria-hidden="true"><i></i><i></i></div></div><p class="panel-note">${text.boardReset}</p>`;
}

function statue(index: number): string {
  const extras = [
    '<path d="M43 91 65 73 86 91v24H43Z" fill="#d8ac62"/><path d="M61 115V99h10v16" fill="#8d765b"/>',
    '<path d="M43 91Q6 73 14 44Q40 50 48 72M86 91Q123 73 115 44Q89 50 81 72" fill="#e4d8f2" stroke="#b2a0c5" stroke-width="2"/>',
    '<circle cx="66" cy="99" r="22" fill="#dfbe72"/><path d="M47 89 85 107M50 80 86 98M47 100 74 118M58 78 87 90" stroke="#a47b36" stroke-width="3"/>',
  ];
  return `<svg class="talent-statue" viewBox="0 0 132 158" aria-hidden="true"><defs><linearGradient id="stone-${index}" x2="1" y2="1"><stop stop-color="#fff5df"/><stop offset="1" stop-color="#c3af8d"/></linearGradient></defs><ellipse cx="66" cy="145" rx="53" ry="7" fill="#9685a4" opacity=".17"/><path d="M26 129h80v12H26z" fill="#bcabce"/><path d="M35 117h62v12H35z" fill="#ded4e8"/><ellipse cx="66" cy="95" rx="29" ry="33" fill="url(#stone-${index})"/>${index === 1 ? extras[index] : ''}<path d="M35 51 38 15 56 34Q66 29 77 34L97 15l1 36Q110 77 67 82 24 79 35 51Z" fill="url(#stone-${index})" stroke="#b4a17e" stroke-width="1.5"/><path d="m42 27 10 11-12 7m49-18-10 11 13 7" fill="#dbbcb0"/><path d="M48 55v5m35-5v5m-23 8 6 3 6-3" fill="none" stroke="#6f6254" stroke-width="3" stroke-linecap="round"/><path d="M40 40q27-24 52 0" fill="none" stroke="#b9984c" stroke-width="4"/><path d="m42 38-7-7m15 4-5-9m15 6-2-10m13 10 2-10m8 13 5-9m2 12 8-7" stroke="#b9984c" stroke-width="3"/>${index !== 1 ? extras[index] : '<ellipse cx="65" cy="100" rx="12" ry="10" fill="#c8b4dd"/>'}</svg>`;
}
export function chapterPanel(): string {
  return `<div class="realm-toolbar"><button class="soft-button" data-screen="workshop">${icon('arrow')}${text.backWorkshop}</button><button class="icon-button" data-action="settings" aria-label="${text.settings}">${icon('settings')}</button></div><div class="panel-intro"><span class="eyebrow">${text.olympusEyebrow}</span><h2>${text.olympusTitle}</h2><p>${text.olympusSubtitle}</p></div>
    <div class="olympus"><div class="olympus-sky" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div><div class="olympus-heading"><span>${text.divineBlessings}</span><strong id="points-label"></strong></div><div class="talent-list">${TALENTS.map((item, i) => `<button class="talent statue-card" id="talent-${item.id}" data-action="talent" data-id="${item.id}">${statue(i)}<span class="statue-caption">${text.statueTitles[i]}</span><strong>${tr(item.name)}</strong><small>${tr(item.detail)}</small><span class="talent-price" id="talent-price-${item.id}">${text.spendPoints(item.cost)}</span></button>`).join('')}</div><div class="mountain-base" aria-hidden="true"></div></div>
    <div class="chapter-card"><span class="tiny-label">${text.chapterBrings}</span><strong id="prestige-reward"></strong><p id="prestige-remaining"></p><button class="primary-button" data-action="prestige" id="prestige-button">${text.prestigeButton}${icon('arrow')}</button></div>`;
}
export function collectionPanel(game: GameState): string {
  return `<div class="panel-intro"><span class="eyebrow">${text.collectionEyebrow}</span><h2>${text.collectionTitle}</h2><p>${text.collectionSubtitle}</p></div><p class="collection-goal" id="goal-title"></p><div class="collection-grid">${COATS.map((coat,i) => {
    const unlocked = game.collection.includes(i);
    return `<article class="coat-card ${unlocked ? '' : 'locked-coat'}"><div class="coat-avatar" style="--coat:${coat.color};--accent:${coat.accent}">${icon('cat')}</div><h3>${coat.name}</h3><p>${tr(coat.personality)}</p><button class="soft-button" data-action="coat" data-id="${i}" ${!unlocked ? 'disabled' : ''}>${unlocked ? (game.coat === i ? text.selected : text.select) : icon('lock') + text.unlockCats(coat.milestone)}</button></article>`;
  }).join('')}</div>`;
}
export function achievementsPanel(game: GameState, category: string): string {
  const categories = [...new Set(ACHIEVEMENTS.map(item => item.category))];
  return `<div class="panel-intro"><span class="eyebrow">${text.achievementsTab}</span><h2>${text.achievementsTitle}</h2><p>${text.patchHint}</p></div><div class="achievement-toolbar"><strong id="achievement-count">${text.achievementsCount(game.achievements.length, ACHIEVEMENTS.length)}</strong><label class="sr-only" for="achievement-filter">${text.achievementCategory}</label><select id="achievement-filter"><option value="all">${text.allCategories}</option>${categories.map(name => `<option value="${name}" ${name === category ? 'selected' : ''}>${tr(name)}</option>`).join('')}</select></div><div class="achievement-grid patch-blanket">${ACHIEVEMENTS.filter(item => category === 'all' || item.category === category).map((item, index) => `<button class="achievement-card achievement-patch patch-${index % 5}" id="achievement-${item.id}" data-action="achievement-info" data-id="${item.id}" aria-label="${tr(item.name)}" style="--tilt:${[-7,5,-3,8,-5,2][index % 6]}deg;--offset:${[0,7,2,8,0,5][index % 6]}px"><span class="badge-art" aria-hidden="true">${icon(item.icon)}</span><strong>${tr(item.name)}</strong><span class="badge-progress"><i id="badge-bar-${item.id}"></i></span><small id="badge-status-${item.id}"></small></button>`).join('')}</div>`;
}
