import { enterWorkshop } from './entry';
import { test, expect } from '@playwright/test';
import Decimal from 'break_infinity.js';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY, BACKUP_KEY } from '../src/game/storage';

test('collection milestones do not relock after a chapter reset', async ({ page }) => {
  const game = createGame(Date.now());
  game.owned.kitten = 3; game.collection = [0, 1, 2, 3, 4, 5];
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: encode(game) });
  await page.goto('/'); await enterWorkshop(page);
  await page.getByRole('button', { name: 'Cat collection', exact: true }).click();
  await expect(page.locator('#goal-title')).toHaveText('A family worth purring about.');
});

test('prestige, permanent talents, collection and imports survive reload', async ({ page }) => {
  const game = createGame(Date.now());
  game.yarn = game.lifetime = game.runEarned = new Decimal(1000000);
  game.owned.kitten = 10; game.collection = [0, 1];
  game.upgrades = ['paws']; game.settings.quality = 'low';
  await page.addInitScript(({ key, raw }) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key, raw); sessionStorage.setItem('seeded', 'true'); }
  }, { key: SAVE_KEY, raw: encode(game) });
  await page.goto('/'); await enterWorkshop(page);
  await page.getByRole('button', { name: 'New chapter', exact: true }).click();
  await page.getByRole('button', { name: 'Begin a new chapter' }).click();
  await expect(page.getByRole('dialog')).toContainText('Your yarn stash, working teams, buildings, and chapter upgrades reset.');
  await page.getByRole('button', { name: 'Move to the new workshop' }).click();
  await expect(page.getByTestId('population')).toHaveText('0');
  await page.getByRole('button', { name: /Welcome Home/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Buy Welcome Home', exact:true }).click();
  await expect(page.locator('#talent-welcome')).toHaveClass(/purchased/);
  await page.locator('#talent-helping').click();
  await expect(page.getByRole('dialog').getByRole('button', {name:'Buy Helping Paw',exact:true})).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Back to workshop', exact: true }).click();
  await expect(page.locator('#pull')).toBeInViewport();
  await page.getByRole('button', { name: 'Cat collection', exact: true }).click();
  await page.getByRole('button', { name: 'Choose companion · Mario', exact: true }).click();
  await page.reload(); await enterWorkshop(page);
  await page.getByRole('button', { name: 'Cat collection', exact: true }).click();
  await expect(page.getByText('Your companion', { exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export save' }).click();
  const exported = await download;
  expect(exported.suggestedFilename()).toBe('purrfect-threads-save.json');
  await page.locator('#import-file').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"version":99}') });
  await expect(page.getByRole('status').filter({ hasText: 'could not be imported' })).toBeVisible();
  const imported = createGame(Date.now());
  imported.yarn = imported.runEarned = imported.lifetime = new Decimal(500000);
  imported.owned.basket = 2; imported.collection = [0, 1]; imported.settings.quality = 'low';
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#import-file').setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(encode(imported)) });
  await expect(page.getByTestId('population')).toHaveText('16');
  await page.reload(); await enterWorkshop(page);
  await expect(page.getByTestId('population')).toHaveText('16');
});

test('corrupt primary uses backup and a second tab cannot overwrite the game', async ({ page, context }) => {
  const game = createGame(Date.now()); game.owned.kitten = 2; game.collection = [0]; game.settings.quality = 'low';
  await page.addInitScript(({ primary, backup, raw }) => {
    localStorage.setItem(primary, 'broken'); localStorage.setItem(backup, raw);
  }, { primary: SAVE_KEY, backup: BACKUP_KEY, raw: encode(game) });
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.getByRole('status').filter({ hasText: 'last valid backup' })).toBeVisible();
  await expect(page.getByTestId('population')).toHaveText('2');
  const second = await context.newPage();
  await second.goto('/'); await enterWorkshop(second);
  await expect(second.getByRole('heading', { name: 'Your cats are busy in another tab.' })).toBeVisible();
  await second.close();
});

test('unrecoverable saves are preserved and recovery is explicit', async ({ page }) => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, 'broken'), { key: SAVE_KEY });
  await page.goto('/'); await enterWorkshop(page);
  await expect(page.getByRole('heading', { name: 'Your save needs a little care.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download existing data' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe('broken');
});
