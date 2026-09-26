export const CREW_PRODUCT_ID = 'meowtastic_crew_12h';
export const CREW_DURATION_MS = 12 * 60 * 60 * 1000;

/** Calculation input only, NOT proof of payment. Never construct from saves or client callbacks.
 * A future billing adapter must authenticate a server-issued entitlement before exposing it.
 */
export interface CrewEntitlement {
  readonly productId: typeof CREW_PRODUCT_ID;
  readonly confirmedAt: number;
  readonly expiresAt: number;
}

function validWindow(entitlement: CrewEntitlement | null): entitlement is CrewEntitlement {
  return !!entitlement && entitlement.productId === CREW_PRODUCT_ID
    && Number.isSafeInteger(entitlement.confirmedAt) && entitlement.confirmedAt >= 0
    && Number.isSafeInteger(entitlement.expiresAt)
    && entitlement.expiresAt - entitlement.confirmedAt === CREW_DURATION_MS;
}

export function crewActive(entitlement: CrewEntitlement | null, now: number): boolean {
  return validWindow(entitlement) && now >= entitlement.confirmedAt && now < entitlement.expiresAt;
}

/** Base seconds plus the overlap at x2. One entitlement, never additive multipliers. */
export function productionSeconds(from: number, to: number, entitlement: CrewEntitlement | null): number {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return 0;
  const extra = validWindow(entitlement)
    ? Math.max(0, Math.min(to, entitlement.expiresAt) - Math.max(from, entitlement.confirmedAt)) : 0;
  return (to - from + extra) / 1000;
}
