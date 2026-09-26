import { Capacitor, registerPlugin } from '@capacitor/core';
import type { CrewEntitlement } from '../game/shop';
export interface NativeBillingPort {
  status(): Promise<unknown>; refresh(): Promise<unknown>;
  purchase(): Promise<unknown>; restore(): Promise<unknown>;
}
export type BillingStatus = 'unavailable' | 'signed-out' | 'busy' | 'ready' | 'active' | 'pending' | 'cancelled' | 'verified' | 'restore-required' | 'account-mismatch';
export interface BillingState { status: BillingStatus; ready: boolean; active: boolean; price: string; pending: boolean }
export const unavailableBilling: BillingState = { status: 'unavailable', ready: false, active: false, price: '', pending: false };
const native = registerPlugin<NativeBillingPort>('CrewBilling');
const unavailable = async () => ({ status: 'unavailable' as const });
export function createBillingPort(platform = Capacitor.getPlatform(), plugin = native): NativeBillingPort {
  return platform === 'android' ? plugin : { status: unavailable, refresh: unavailable, purchase: unavailable, restore: unavailable };
}
// Legacy calculation seam stays inert: no reusable entitlement or save can grant paid time.
export const billing = Object.freeze({ entitlement: (): CrewEntitlement | null => null, purchase: unavailable, restore: unavailable });
export class BillingController {
  state: BillingState = { ...unavailableBilling };
  private epoch = 0;
  private sessionEpoch = 0;
  private disposed = false;
  constructor(private port: NativeBillingPort,
    private capture: () => (foreground: number, offline: number) => void = () => () => {},
    private changed: () => void = () => {}) {}
  invalidateCredits(): void { this.epoch++; }
  disconnect(): void { this.sessionEpoch++; this.invalidateCredits(); this.state = { ...unavailableBilling }; this.changed(); }
  dispose(): void { this.disposed = true; this.invalidateCredits(); }
  async run(method: keyof NativeBillingPort): Promise<void> {
    if (this.disposed || this.state.pending) return;
    const epoch = this.epoch, sessionEpoch = this.sessionEpoch, credit = this.capture();
    this.state = { ...this.state, pending: true, ready: false }; this.changed();
    try {
      const raw = await this.port[method]();
      if (this.disposed || sessionEpoch !== this.sessionEpoch) return;
      const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
      const statuses: BillingStatus[] = ['unavailable', 'signed-out', 'busy', 'ready', 'active', 'pending', 'cancelled', 'verified', 'restore-required', 'account-mismatch'];
      const status = statuses.includes(value.status as BillingStatus) ? value.status as BillingStatus : 'unavailable';
      const fg = value.foregroundSeconds ?? 0, off = value.offlineSeconds ?? 0;
      const valid = typeof fg === 'number' && Number.isFinite(fg) && fg >= 0 && fg <= 43200
        && typeof off === 'number' && Number.isFinite(off) && off >= 0 && off <= 28800;
      this.state = { status, active: valid && value.active === true, ready: valid && value.ready === true && value.active !== true,
        price: typeof value.price === 'string' && value.price.length <= 80 ? value.price : '', pending: false };
      if (valid && epoch === this.epoch) credit(fg as number, off as number);
    } catch { if (!this.disposed && sessionEpoch === this.sessionEpoch) this.state = { ...unavailableBilling }; }
    if (!this.disposed && sessionEpoch === this.sessionEpoch) this.changed();
  }
}
