import { UPGRADES, PRODUCERS, PRODUCER_UPGRADES, UPGRADE_PARENT, type UpgradeId } from '../game/catalog';
import { missingUpgradeRequirements, upgradeCost, type GameState } from '../game/engine';
import { text } from './copy';
import { translate as tr } from './localization';
import { format } from './format';
import { icon } from './icons';

export const TREE_SIZE = { width: 1800, height: 1400 };
export const NOTE_SIZE = 48;
// Shared pin coordinates keep the SVG anchored while the entire canvas pans.
export const TREE_PINS = {
  hold: [900, 650], paws: [760, 480], mittens: [640, 370], silky: [520, 250],
  bell: [900, 440], clover: [900, 290], whiskers: [900, 140],
  happy: [1080, 520], tea: [1240, 410], purring: [1380, 300], moonlit: [1520, 190],
  tools: [1280, 585], master: [1480, 585],
  ...Object.fromEntries(PRODUCER_UPGRADES.map(item => {
    const branch = PRODUCERS.findIndex(producer => producer.id === item.producer);
    const angle = (10 + branch * 160 / 9) * Math.PI / 180;
    const radius = 260 + (item.tier - 1) * 90;
    return [item.id, [Math.round(900 + Math.cos(angle) * radius), Math.round(650 + Math.sin(angle) * radius)]];
  })),
} as Record<UpgradeId, [number, number]>;

export function upgradeRequirement(game: GameState, id: UpgradeId): string {
  const missing = missingUpgradeRequirements(game, id);
  return missing.length ? `${tr('Requires:')} ${missing.map(tr).join(' + ')}` : '';
}

export function upgradeTooltip(game: GameState, id: UpgradeId): string {
  const item = UPGRADES.find(item => item.id === id)!;
  const status = game.upgrades.includes(id) ? text.bought : upgradeRequirement(game, id) || tr('Ready to learn');
  return `<strong>${tr(item.name)}</strong><p>${tr(item.detail)}</p><p class="tree-tooltip-cost">${text.cost(format(upgradeCost(game, item)))}</p><p>${status}</p><small>${text.boardReset}</small>`;
}

export function upgradeTree(game: GameState): string {
  const strings = UPGRADES.flatMap(item => {
    const parent = UPGRADE_PARENT[item.id]; if (!parent) return [];
    const [x1, y1] = TREE_PINS[parent], [x2, y2] = TREE_PINS[item.id];
    return [`<path data-from="${parent}" data-to="${item.id}" d="M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + 10} ${x2} ${y2}"/>`];
  }).join('');
  return `<div class="tree-toolbar"><p class="tree-guide" id="tree-guide">${tr('Drag the board. Hover or focus a note; tap for details.')}</p>
    <div class="tree-controls" role="group" aria-label="${tr('Move the upgrade board')}">${(['left', 'up', 'home', 'down', 'right'] as const).map(direction => `<button type="button" data-pan="${direction}" aria-label="${tr({left:'Pan left',up:'Pan up',home:'Center on Helping Thread',down:'Pan down',right:'Pan right'}[direction])}">${icon(direction === 'home' ? 'yarn' : 'arrow')}</button>`).join('')}</div></div>
    <div class="tree-scroll" tabindex="0" role="region" aria-label="${tr('Upgrade tree')}" aria-describedby="tree-guide">
    <div class="upgrade-tree" style="width:${TREE_SIZE.width}px;height:${TREE_SIZE.height}px"><svg class="tree-strings" width="${TREE_SIZE.width}" height="${TREE_SIZE.height}" viewBox="0 0 ${TREE_SIZE.width} ${TREE_SIZE.height}" aria-hidden="true">${strings}</svg>
    ${UPGRADES.map((item, index) => {
      const [x, y] = TREE_PINS[item.id];
      return `<button class="upgrade sticky-note note-${index % 4}${item.id === 'hold' ? ' tree-root' : ''}" style="left:${x - NOTE_SIZE / 2}px;top:${y}px" id="upgrade-${item.id}" data-action="upgrade-info" data-id="${item.id}" aria-label="${text.inspect} ${tr(item.name)}" aria-describedby="upgrade-state-${item.id}">
        <span class="note-pin" aria-hidden="true"></span><span class="note-cat" aria-hidden="true">${icon(item.icon)}</span><span class="tree-lock" aria-hidden="true">${icon('lock')}</span>
        <span class="sr-only" id="upgrade-price-${item.id}">${format(upgradeCost(game, item))}</span>
        <span class="sr-only" id="upgrade-state-${item.id}">${upgradeRequirement(game, item.id) || tr('Ready to learn')}</span></button>`;
    }).join('')}</div></div>`;
}
