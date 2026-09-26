import { test, expect } from '@playwright/test';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';
import { enterWorkshop } from './entry';

test('the falling parachute cat grants exactly five yarn once on desktop and mobile', async ({ page }) => {
  const game = createGame(Date.now());
  game.settings.quality = 'low';
  await page.addInitScript(({ key, raw }) => { localStorage.setItem(key, raw); Math.random = () => 59 / 60; }, { key: SAVE_KEY, raw: encode(game) });
  await page.clock.install();
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.clock.fastForward(121000);
  const cat = page.getByRole('button', { name: /Catch the parachute cat|Atrapa al gato lápiz/ });
  await expect(cat).toBeVisible();
  await page.clock.fastForward(3000);
  await page.screenshot({ path: `test-results/parachute-cat-${test.info().project.name}.png` });
  const bounds = await cat.boundingBox();
  const worldBounds = await page.locator('#world').boundingBox();
  expect(bounds?.width).toBeGreaterThanOrEqual(44);
  expect(bounds?.height).toBeGreaterThanOrEqual(44);
  expect(bounds!.x).toBeGreaterThanOrEqual(worldBounds!.x);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(worldBounds!.x + worldBounds!.width);
  expect(bounds!.y).toBeGreaterThanOrEqual(worldBounds!.y);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(worldBounds!.y + worldBounds!.height);
  for (const viewport of [{ width: 320, height: 480 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.clock.runFor(100);
    const catBounds = await cat.boundingBox();
    const resizedWorld = await page.locator('#world').boundingBox();
    expect(catBounds!.x).toBeGreaterThanOrEqual(resizedWorld!.x);
    expect(catBounds!.x + catBounds!.width).toBeLessThanOrEqual(resizedWorld!.x + resizedWorld!.width);
    expect(catBounds!.y).toBeGreaterThanOrEqual(resizedWorld!.y);
    expect(catBounds!.y + catBounds!.height).toBeLessThanOrEqual(resizedWorld!.y + resizedWorld!.height);
  }
  await cat.focus(); await page.keyboard.press('Enter');
  await expect(page.getByTestId('yarn')).toHaveText('5');
  await expect(cat).toBeDisabled();
  await expect(cat).toBeVisible();
  await page.clock.fastForward(600);
  await expect(cat).toBeHidden();
  await page.locator('.falling-cat').dispatchEvent('click');
  await expect(page.getByTestId('yarn')).toHaveText('5');
  const persisted = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect(persisted.yarn).toBe('5');
  expect(persisted.stats.taps).toBe(0);
});

test('the falling parachute cat is stationary, pointer-catchable, and disappears for dialogs', async ({ page }) => {
  const game = createGame(Date.now());
  game.settings.quality = 'low'; game.settings.reducedMotion = true;
  await page.addInitScript(({ key, raw }) => { localStorage.setItem(key, raw); Math.random = () => 59 / 60; }, { key: SAVE_KEY, raw: encode(game) });
  await page.clock.install();
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true', { timeout: 30000 });
  await page.clock.fastForward(121000);
  const cat = page.getByRole('button', { name: /Catch the parachute cat/ });
  await expect(cat).toBeVisible();
  await expect(cat).toHaveClass(/falling-cat--still/);
  const bounds = await cat.boundingBox();
  await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await expect(page.getByTestId('yarn')).toHaveText('5');
  await expect(cat).toBeDisabled();
  await expect(cat).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(cat).toBeHidden();
});
