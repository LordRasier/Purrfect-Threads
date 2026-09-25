import type { PRODUCERS } from '../game/catalog';
import { icon } from './icons';

// Original vector sprite: shared silhouette, catalog-specific props and palette.
const worker = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31 35c13 5 15-8 10-9" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><ellipse cx="24" cy="33" rx="11" ry="12" fill="currentColor"/><path d="M10 21 11 5l10 7h6L37 5l1 16c0 10-28 10-28 0Z" fill="currentColor"/><path d="m14 10 5 4-5 3m20-7-5 4 5 3" fill="#f6bdac"/><ellipse cx="24" cy="34" rx="6" ry="8" fill="#fff4dc"/><path d="M17 20v2m14-2v2" stroke="#635648" stroke-width="2.5" stroke-linecap="round"/><path d="m22 24 2 2 2-2" stroke="#635648" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="17" cy="43" rx="5" ry="3" fill="currentColor"/><ellipse cx="31" cy="43" rx="5" ry="3" fill="currentColor"/></svg>`;

export function crewScenery(producer: (typeof PRODUCERS)[number], owned: number, resting: boolean): string {
  if (owned <= 0) return '';
  return `<div class="crew-scene" data-theme="${producer.id}" data-palette="${producer.color}" data-resting="${resting}" aria-hidden="true"><span class="crew-sprite crew-worker">${worker}</span><span class="crew-sprite crew-prop">${icon(producer.icon)}</span><span class="crew-sprite crew-thread">${icon('yarn')}</span></div>`;
}
