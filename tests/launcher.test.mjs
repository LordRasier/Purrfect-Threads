import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createGameServer } from '../tools/serve.mjs';

test('launcher serves compiled assets locally and rejects traversal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'purrfect-server-'));
  await writeFile(join(root, 'index.html'), '<h1>Purrfect Threads</h1>');
  const server = createGameServer(root);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const url = `http://127.0.0.1:${address.port}`;
  try {
    assert.equal(await (await fetch(url)).text(), '<h1>Purrfect Threads</h1>');
    assert.equal((await fetch(`${url}/missing.js`)).status, 404);
    assert.equal((await fetch(`${url}/..%2fpackage.json`)).status, 403);
    assert.equal((await fetch(url, { method: 'POST' })).status, 405);
  } finally {
    await new Promise(resolve => server.close(resolve));
    assert.ok(root.startsWith(join(tmpdir(), 'purrfect-server-')));
    await rm(root, { recursive: true, force: true });
  }
});
