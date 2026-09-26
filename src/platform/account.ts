import { Capacitor, registerPlugin } from '@capacitor/core';

export type AccountStatus = 'unavailable' | 'signed-out' | 'signed-in' | 'busy';
export type AccountNotice = 'cancelled' | 'failed' | 'clear-failed' | null;
export interface AccountState { status: AccountStatus; pending: boolean; notice: AccountNotice }
export interface AccountPort {
  status(): Promise<unknown>;
  connect(): Promise<unknown>;
  disconnect(): Promise<unknown>;
}
const unavailable = async () => ({ status: 'unavailable', outcome: 'ok' });
const native = registerPlugin<AccountPort>('GoogleAccount');
export function createAccountPort(platform = Capacitor.getPlatform(), plugin = native): AccountPort {
  return platform === 'android' ? plugin : { status: unavailable, connect: unavailable, disconnect: unavailable };
}

/** Only fixed status codes enter the UI. Identity and credential data stay native. */
export class AccountController {
  state: AccountState = { status: 'unavailable', pending: false, notice: null };
  private disposed = false;
  constructor(private port: AccountPort, private changed: () => void = () => {}) {}
  refresh(): Promise<void> { return this.run('status'); }
  connect(): Promise<void> {
    return this.state.status === 'signed-out' ? this.run('connect') : Promise.resolve();
  }
  disconnect(): Promise<void> {
    return this.state.status === 'signed-in' ? this.run('disconnect') : Promise.resolve();
  }
  dispose(): void { this.disposed = true; }
  private async run(method: keyof AccountPort): Promise<void> {
    if (this.disposed || this.state.pending) return;
    this.state = { ...this.state, pending: true, notice: null }; this.changed();
    try {
      const raw = await this.port[method]();
      if (this.disposed) return;
      const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
      const statuses: AccountStatus[] = ['unavailable', 'signed-out', 'signed-in', 'busy'];
      const status = statuses.includes(value.status as AccountStatus) ? value.status as AccountStatus : 'unavailable';
      const notice: AccountNotice = value.outcome === 'cancelled' ? 'cancelled'
        : value.outcome === 'clear-failed' ? 'clear-failed'
        : value.outcome === 'ok' || value.outcome === 'busy' ? null : 'failed';
      this.state = { status, pending: false, notice };
    } catch {
      if (this.disposed) return;
      this.state = { ...this.state, pending: false, notice: 'failed' };
    }
    this.changed();
  }
}
