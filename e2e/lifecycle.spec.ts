import { enterWorkshop } from './entry';
import { test, expect } from '@playwright/test';
import Decimal from 'break_infinity.js';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';

test('a denied storage getter never displays a saved confirmation', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError'); } }));
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.getByText('Saving unavailable', { exact: true })).toBeAttached();
  await expect(page.getByText('Saved with love', { exact: true })).toHaveCount(0);
});

test('BFCache restore cannot resume a stale writer after another tab takes ownership', async ({ page, context }) => {
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  const second = await context.newPage();
  await second.goto('/'); await enterWorkshop(second);
  await expect(second.getByRole('button', { name: 'Pull yarn', exact: true })).toBeVisible();
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.getByRole('heading', { name: 'Your cats are busy in another tab.' })).toBeVisible();
  await second.close();
});

test('losing pointer capture does not cancel a keyboard hold', async ({ page }) => {
  const game = createGame(); game.upgrades = ['hold'];
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: encode(game) });
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  const pull = page.getByRole('button', { name: 'Pull yarn', exact: true });
  await pull.focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(250);
  await page.locator('#pull').dispatchEvent('lostpointercapture');
  const before = Number(await page.getByTestId('yarn').textContent());
  await page.waitForTimeout(650);
  await page.keyboard.up('Space');
  expect(Number(await page.getByTestId('yarn').textContent())).toBeGreaterThan(before);
});

test('active and offline credit remain disjoint when storage writes fail', async ({ page }) => {
  const game = createGame(Date.now());
  game.owned.kitten = 10; game.collection = [];
  game.yarn = game.runEarned = game.lifetime = new Decimal(0);
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: encode(game) });
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.getByTestId('rate')).toHaveText('10');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const before = Number(await page.getByTestId('yarn').textContent());
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByText('Saving unavailable', { exact: true })).toBeAttached();
  const after = Number(await page.getByTestId('yarn').textContent());
  expect(after - before).toBeLessThan(14);
});

test('corrupt recovery re-enters ownership before returning from BFCache', async ({ page, context }) => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, 'broken'), { key: SAVE_KEY });
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.getByRole('heading', { name: 'Your save needs a little care.' })).toBeVisible();
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  const second = await context.newPage();
  await second.goto('/'); await enterWorkshop(second);
  await expect(second.getByRole('heading', { name: 'Your save needs a little care.' })).toBeVisible();
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(page.getByRole('heading', { name: 'Your cats are busy in another tab.' })).toBeVisible();
  await second.close();
});

test('an import suspended across pagehide cannot overwrite the next owner', async ({ page, context }) => {
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.evaluate(() => {
    const original = File.prototype.text;
    File.prototype.text = async function () {
      const result = await original.call(this);
      await new Promise<void>(resolve => { (window as any).resumeImport = resolve; });
      return result;
    };
  });
  const incoming = createGame(); incoming.owned.kitten = 100; incoming.collection = [0, 1, 2, 3];
  await page.locator('#import-file').setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(encode(incoming)) });
  await page.waitForFunction(() => typeof (window as any).resumeImport === 'function');
  await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  const second = await context.newPage(); await second.goto('/'); await enterWorkshop(second);
  await expect(second.locator('#world')).toHaveAttribute('data-ready', 'true');
  page.on('dialog', dialog => dialog.accept());
  await page.evaluate(() => (window as any).resumeImport());
  await page.waitForTimeout(400);
  const saved = await second.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect(saved.owned.kitten).toBe(0);
  await second.close();
});

test('pagehide releases ownership even while the 3D module is still loading', async ({ page, context }) => {
  let release!: () => void;
  const delayed = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/src/scene/world.ts', async route => { await delayed; await route.continue(); });
  try {
    await page.goto('/'); await enterWorkshop(page);
    await expect(page.getByRole('button', { name: 'Pull yarn', exact: true })).toBeVisible();
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    const second = await context.newPage();
    await second.goto('/'); await enterWorkshop(second);
    await expect(second.getByRole('button', { name: 'Pull yarn', exact: true })).toBeVisible();
    await second.close();
  } finally { release(); }
});
