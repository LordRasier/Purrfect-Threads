import { test, expect, type Page } from '@playwright/test';
import Decimal from 'break_infinity.js';
import { createGame, type GameState } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';

async function seed(page: Page, game: GameState) {
  game.settings.quality = 'low';
  await page.addInitScript(({ key, raw }) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key, raw); sessionStorage.setItem('seeded', 'true');
    }
  }, { key: SAVE_KEY, raw: encode(game) });
  await page.goto('/');
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
}

test('fresh cushion stays empty and six illustrated challenges need real progress', async ({ page }) => {
  await seed(page, createGame(Date.now()));
  await expect(page.locator('#world')).toHaveAttribute('data-companion', 'none');
  await page.getByRole('button', { name: 'Cat collection', exact: true }).click();
  await expect(page.locator('.companion-card')).toHaveCount(6);
  await expect(page.locator('.companion-card button:disabled')).toHaveCount(6);
  await expect(page.locator('#companion-summary')).toContainText('empty cushion');
  await expect(page.locator('#companion-kira')).toContainText('250 cats and 1,000 lifetime taps');
  await expect.poll(() => page.locator('.companion-portrait img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth === 512))).toBe(true);
  await page.locator('#management').evaluate(el => el.scrollTop = el.scrollHeight);
  await expect(page.locator('#pull')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('selected companion changes the bonus and cushion art, persists, and supports keyboard', async ({ page }, info) => {
  const game = createGame(Date.now()); game.collection = [0, 1, 2, 3, 4, 5]; game.owned.kitten = 10;
  await seed(page, game);
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 961, height: 854 });
  await expect(page.locator('#world')).toHaveAttribute('data-companion', 'kira');
  await expect(page.locator('#world')).toHaveAttribute('data-companion-ready', 'true');
  await page.getByRole('button', { name: 'Cat collection', exact: true }).click();
  await expect(page.locator('#companion-summary')).toContainText('Kira');
  await page.screenshot({ path: `docs/screenshots/v05-companions-${info.project.name}.png`, fullPage: true });
  await page.locator('#select-companion-1').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#select-companion-1')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#select-companion-0')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#companion-summary')).toContainText('Manual touches +25%');
  await expect(page.locator('#world')).toHaveAttribute('data-companion', 'mario');
  await expect(page.locator('#world')).toHaveAttribute('data-companion-ready', 'true');
  await page.reload();
  await expect(page.locator('#world')).toHaveAttribute('data-companion', 'mario');
  await page.getByRole('button', { name: 'Cat collection', exact: true }).click();
  await expect(page.locator('#select-companion-1')).toHaveAttribute('aria-pressed', 'true');
});

test('touch challenge unlock is announced and immediately places Kira on the cushion', async ({ page }) => {
  const game = createGame(Date.now()); game.owned.corner = 5; game.stats.taps = 999;
  game.yarn = game.runEarned = game.lifetime = new Decimal(10000);
  await seed(page, game);
  await page.getByRole('button', { name: 'Cat collection', exact: true }).click();
  await expect(page.locator('#select-companion-0')).toBeDisabled();
  await page.getByRole('button', { name: 'Pull yarn', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('Kira');
  await expect(page.locator('#select-companion-0')).toBeEnabled();
  await expect(page.locator('#world')).toHaveAttribute('data-companion', 'kira');
  await expect(page.locator('#world')).toHaveAttribute('data-companion-ready', 'true');
});

test('Spanish collection preserves pet names and explains the selected-only bonus', async ({ page }) => {
  const game = createGame(Date.now()); game.settings.language = 'es';
  await seed(page, game);
  await page.getByRole('button', { name: 'Colección de gatos', exact: true }).click();
  await expect(page.locator('.companion-rule')).toContainText('seleccionado');
  for (const name of ['Kira','Mario','Roman','Luigi','Lola','Biscocho']) await expect(page.getByRole('heading', {name, exact:true})).toBeVisible();
});

test('imported companions are restored without false unlock announcements', async ({ page }) => {
  await seed(page, createGame(Date.now()));
  const imported = createGame(Date.now()); imported.collection = [0, 1]; imported.coat = 1;
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#import-file').setInputFiles({ name: 'companions.json', mimeType: 'application/json', buffer: Buffer.from(encode(imported)) });
  await expect(page.locator('#toast')).toHaveText('Your workshop is ready. Welcome back!');
  await expect(page.locator('#world')).toHaveAttribute('data-companion', 'mario');
});
