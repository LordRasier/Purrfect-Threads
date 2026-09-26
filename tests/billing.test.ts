import { expect, it } from 'vitest';
import { BillingController, createBillingPort, type NativeBillingPort } from '../src/platform/billing';
const fake = (value: unknown): NativeBillingPort => ({ status: async () => value, refresh: async () => value, purchase: async () => value, restore: async () => value });
it('web remains unavailable and never returns paid time', async () => {
  const controller = new BillingController(createBillingPort('web', fake({ status: 'active', foregroundSeconds: 10 })));
  await controller.run('status'); expect(controller.state.status).toBe('unavailable');
});
it('accepts bounded native paid time only once per response and strips unknown fields', async () => {
  let credited = 0;
  const controller = new BillingController(fake({ status: 'active', active: true, foregroundSeconds: 2, offlineSeconds: 3, token: 'secret', price: '$2.00' }), () => (fg, off) => { credited += fg + off; });
  await controller.run('status'); expect(credited).toBe(5);
  expect(JSON.stringify(controller.state)).not.toContain('secret');
  expect(controller.state.active).toBe(true);
});
it('drops stale credit after game or identity change and serializes requests', async () => {
  let resolve!: (value: unknown) => void, calls = 0, credited = 0;
  const port = fake(null); port.status = () => { calls++; return new Promise(done => { resolve = done; }); };
  const controller = new BillingController(port, () => fg => { credited += fg; });
  const pending = controller.run('status'); await controller.run('status'); controller.invalidateCredits();
  resolve({ status: 'active', foregroundSeconds: 2 }); await pending;
  expect(calls).toBe(1); expect(credited).toBe(0);
});
it('rejects malformed or excessive credits and clears ready on failure', async () => {
  let credited = 0;
  const controller = new BillingController(fake({ status: 'active', foregroundSeconds: Infinity, offlineSeconds: 999999, ready: true }), () => fg => { credited += fg; });
  await controller.run('status'); expect(credited).toBe(0); expect(controller.state.ready).toBe(false);
});

it('non-economic UI work does not discard delayed offline credit', async () => {
  let resolve!: (value: unknown) => void, credited = 0;
  const port = fake(null); port.status = () => new Promise(done => { resolve = done; });
  const controller = new BillingController(port, () => (_fg, off) => { credited += off; });
  const pending = controller.run('status');
  // Reading shop/account UI is not an identity change or game replacement.
  expect(controller.state.pending).toBe(true);
  resolve({ status: 'active', offlineSeconds: 28800 }); await pending;
  expect(credited).toBe(28800);
});
it('disconnect does not let an old response restore purchase readiness', async () => {
  let resolve!: (value: unknown) => void;
  const port = fake(null); port.status = () => new Promise(done => { resolve = done; });
  const controller = new BillingController(port);
  const pending = controller.run('status'); controller.disconnect();
  resolve({ status: 'ready', ready: true }); await pending;
  expect(controller.state.ready).toBe(false);
});

it('stale rejection from a disconnected session cannot clear a newer pending request', async () => {
  let rejectOld!: (error: Error) => void, resolveNew!: (value: unknown) => void, calls = 0;
  const port = fake(null);
  port.status = () => ++calls === 1 ? new Promise((_resolve, reject) => { rejectOld = reject; })
    : new Promise(resolve => { resolveNew = resolve; });
  const controller = new BillingController(port);
  const old = controller.run('status'); controller.disconnect();
  const current = controller.run('status');
  rejectOld(new Error('old session')); await old;
  expect(controller.state.pending).toBe(true);
  resolveNew({ status: 'ready', ready: true }); await current;
  expect(controller.state.ready).toBe(true);
});
