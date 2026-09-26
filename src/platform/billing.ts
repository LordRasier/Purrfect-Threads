import type { CrewEntitlement } from '../game/shop';

export interface BillingPort {
  entitlement(): CrewEntitlement | null;
  purchase(): Promise<{ status: 'unavailable' }>;
  restore(): Promise<{ status: 'unavailable' }>;
}

/** Deliberately unavailable on web AND Android until native billing and secure verification exist.
 * No purchase callback, local storage, debug flag or imported save can grant a paid boost.
 */
export const billing: BillingPort = Object.freeze({
  entitlement: () => null,
  purchase: async () => ({ status: 'unavailable' as const }),
  restore: async () => ({ status: 'unavailable' as const }),
});
