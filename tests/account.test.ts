import { expect, it } from 'vitest';
import { AccountController, createAccountPort, type AccountPort } from '../src/platform/account';

const response = (status = 'signed-out', outcome = 'ok') => ({ status, outcome });
const fake = (overrides: Partial<AccountPort> = {}): AccountPort => ({
  status: async () => response(), connect: async () => response('signed-in'),
  disconnect: async () => response(), ...overrides,
});

it('never connects during construction or status and defaults unavailable on web', async () => {
  let calls = 0;
  const port = createAccountPort('web', fake({ connect: async () => { calls++; return response('signed-in'); } }));
  const account = new AccountController(port);
  await account.refresh(); await account.connect();
  expect(account.state.status).toBe('unavailable'); expect(calls).toBe(0);
});

it('connects and disconnects explicitly without keeping native identity fields', async () => {
  const account = new AccountController(fake({ connect: async () => ({ ...response('signed-in'), email: 'private', uid: 'private', token: 'private' }) }));
  await account.refresh(); expect(account.state.status).toBe('signed-out');
  await account.connect(); expect(account.state.status).toBe('signed-in');
  expect(JSON.stringify(account.state)).not.toContain('private');
  await account.disconnect(); expect(account.state.status).toBe('signed-out');
});

it('serializes actions and ignores status refresh while a picker is open', async () => {
  let finish!: (value: unknown) => void; let calls = 0;
  const account = new AccountController(fake({ connect: () => { calls++; return new Promise(resolve => { finish = resolve; }); } }));
  await account.refresh(); const pending = account.connect();
  expect(account.state.pending).toBe(true);
  await account.connect(); await account.disconnect(); await account.refresh();
  expect(calls).toBe(1);
  finish(response('signed-in')); await pending;
  expect(account.state.status).toBe('signed-in'); expect(account.state.pending).toBe(false);
});

it('handles cancellation and sanitized error with retry', async () => {
  let attempt = 0;
  const account = new AccountController(fake({ connect: async () => {
    if (attempt++ === 0) return response('signed-out', 'cancelled');
    if (attempt === 2) throw new Error('private SDK details');
    return response('signed-in');
  } }));
  await account.refresh(); await account.connect(); expect(account.state.notice).toBe('cancelled');
  await account.connect(); expect(account.state.notice).toBe('failed');
  expect(JSON.stringify(account.state)).not.toContain('private');
  await account.connect(); expect(account.state.status).toBe('signed-in');
});

it('fails closed for malformed replies and supports default Android unavailable', async () => {
  const account = new AccountController(createAccountPort('android', fake({ status: async () => response('unavailable') })));
  await account.refresh(); expect(account.state.status).toBe('unavailable');
  const malformed = new AccountController(fake({ status: async () => ({ uid: 'x' }) }));
  await malformed.refresh(); expect(malformed.state.status).toBe('unavailable');
});

it('reports native busy and credential-clear failure without claiming an active account', async () => {
  const account = new AccountController(fake({ status: async () => response('busy'), disconnect: async () => response('signed-out', 'clear-failed') }));
  await account.refresh(); expect(account.state.status).toBe('busy');
  await account.disconnect(); expect(account.state.status).toBe('busy');
  const connected = new AccountController(fake({ disconnect: async () => response('signed-out', 'clear-failed') }));
  await connected.refresh(); await connected.connect(); await connected.disconnect();
  expect(connected.state).toMatchObject({ status: 'signed-out', notice: 'clear-failed', pending: false });
});

it('disposed owners ignore late replies and stop publishing updates', async () => {
  let finish!: (value: unknown) => void; let updates = 0;
  const account = new AccountController(fake({ connect: () => new Promise(resolve => { finish = resolve; }) }), () => updates++);
  await account.refresh(); const pending = account.connect(); account.dispose(); const before = updates;
  finish(response('signed-in')); await pending;
  expect(updates).toBe(before); expect(account.state.status).not.toBe('signed-in');
});
