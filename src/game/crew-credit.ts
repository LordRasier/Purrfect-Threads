import Decimal from 'break_infinity.js';
import { updateCollection, type GameState } from './engine';
import { updateAchievements } from './achievements';
/** Extra production only. Native has already durably consumed this bounded time interval. */
export function applyCrewCredit(game: GameState, foreground: number, offline: number, rate: Decimal, efficiency: number): void {
  if (![foreground, offline].every(value => Number.isFinite(value) && value >= 0) || foreground > 43200 || offline > 28800) return;
  const off = rate.mul(offline * efficiency), amount = rate.mul(foreground).add(off);
  game.yarn = game.yarn.add(amount); game.lifetime = game.lifetime.add(amount); game.runEarned = game.runEarned.add(amount);
  game.stats.offlineYarn = game.stats.offlineYarn.add(off);
  updateCollection(game); updateAchievements(game);
}

/** Never advance the baseline save clock with a paid reply while the document is hidden. */
export class CrewCreditDelivery {
  private queued: Array<() => void> = [];
  constructor(private hidden: () => boolean) {}
  deliver(credit: () => void): void { if (this.hidden()) this.queued.push(credit); else credit(); }
  flush(): void {
    if (this.hidden()) return;
    const queued = this.queued; this.queued = [];
    queued.forEach(credit => credit());
  }
}
