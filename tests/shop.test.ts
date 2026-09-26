import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { advance, createGame, grantBonus, tapValue } from '../src/game/engine';
import { applyOffline, prestige } from '../src/game/progression';
import { decode, encode } from '../src/game/storage';
import { CREW_DURATION_MS, CREW_PRODUCT_ID, crewActive, productionSeconds, type CrewEntitlement } from '../src/game/shop';
import { billing } from '../src/platform/billing';

const hour = 3600000;
const entitlement: CrewEntitlement = { productId: CREW_PRODUCT_ID, confirmedAt: hour, expiresAt: 13 * hour };

describe('Meowtastic Crew entitlement calculation', () => {
  it('lasts exactly twelve real hours, with no multiplier stacking', () => {
    expect(CREW_DURATION_MS).toBe(12 * hour);
    expect(crewActive(entitlement, hour - 1)).toBe(false);
    expect(crewActive(entitlement, hour)).toBe(true);
    expect(crewActive(entitlement, 13 * hour)).toBe(false);
    expect(productionSeconds(0, 14 * hour, entitlement)).toBe(26 * 3600);
    expect(productionSeconds(0, 14 * hour, null)).toBe(14 * 3600);
  });
  it('rejects malformed windows and reversed clocks', () => {
    expect(productionSeconds(13 * hour, 12 * hour, entitlement)).toBe(0);
    expect(productionSeconds(0, hour, { ...entitlement, expiresAt: Infinity })).toBe(3600);
    expect(crewActive({ ...entitlement, expiresAt: 20 * hour }, 2 * hour)).toBe(false);
  });
  it('doubles automatic production only, including the exact expiry boundary', () => {
    const game = createGame(); game.owned.kitten = 1; game.talents = ['helping'];
    const tapBefore = tapValue(game).toString();
    advance(game, 2, entitlement, 13 * hour + 1000);
    expect(game.yarn.toNumber()).toBe(3);
    expect(tapValue(game).toString()).toBe(tapBefore);
    expect(grantBonus(game).toNumber()).toBe(5);
  });
  it('integrates offline earnings only up to expiry, preserving the existing cap and efficiency', () => {
    const game = createGame(12 * hour); game.owned.kitten = 1;
    expect(applyOffline(game, 22 * hour, entitlement).toNumber()).toBe(9 * 3600 * 0.5);
    expect(applyOffline(game, 22 * hour, entitlement).toNumber()).toBe(0);
  });
  it('does not pause expiry during prestige or offline time', () => {
    const game = createGame(hour); game.runEarned = new Decimal(100000); game.lifetime = game.runEarned;
    expect(prestige(game)).toBe(true);
    game.owned.kitten = 1;
    advance(game, 1, entitlement, 2 * hour);
    expect(game.yarn.toNumber()).toBe(2);
    advance(game, 1, entitlement, 14 * hour);
    expect(game.yarn.toNumber()).toBe(3);
  });
  it('never restores paid entitlement from an imported game save', () => {
    const raw = JSON.stringify({ ...JSON.parse(encode(createGame())), entitlement, crewEntitlement: entitlement });
    const imported = decode(raw);
    expect(imported).not.toHaveProperty('entitlement');
    expect(imported).not.toHaveProperty('crewEntitlement');
    imported.owned.kitten = 1; advance(imported, 1);
    expect(imported.yarn.toNumber()).toBe(1);
  });
});

describe('unconfigured billing fails closed', () => {
  it('does not sell, restore or grant entitlement on any platform', async () => {
    expect(billing.entitlement()).toBeNull();
    expect(await billing.purchase()).toEqual({ status: 'unavailable' });
    expect(await billing.restore()).toEqual({ status: 'unavailable' });
    expect(billing.entitlement()).toBeNull();
  });
});
