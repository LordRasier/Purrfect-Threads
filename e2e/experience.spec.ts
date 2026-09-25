import { test, expect } from '@playwright/test';
import Decimal from 'break_infinity.js';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';

test.beforeEach(async ({page}) => {
  const game = createGame(); game.yarn = game.lifetime = game.runEarned = new Decimal('1e8');
  await page.addInitScript(({key,raw}) => { if (!localStorage.getItem(key)) localStorage.setItem(key,raw); }, {key:SAVE_KEY,raw:encode(game)});
});

test('crew scroll keeps owned crews decorated while yarn stays on the workshop home', async ({page}) => {
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await page.locator('.navigation [data-screen="crew"]').click();
  await page.getByRole('button',{name:'Adopt Kitten',exact:true}).click();
  await expect(page.locator('#card-kitten .crew-motif')).toHaveCount(1);
  await page.getByRole('button',{name:'Adopt Kitten',exact:true}).click();
  await expect(page.locator('#card-kitten .crew-motif')).toHaveCount(2);
  await page.locator('#management').evaluate(el => el.scrollTop = el.scrollHeight);
  await expect(page.locator('#pull')).toBeHidden();
  await page.getByRole('button',{name:'Workshop',exact:true}).click();
  await expect(page.locator('#pull')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
});

test('notes and embroidered patches open details without accidental purchases', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Upgrades',exact:true}).click();
  await expect(page.locator('.sticky-note')).toHaveCount(12);
  await expect(page.locator('#upgrade-bell')).toHaveAccessibleName('Inspect Lucky Bell');
  await page.locator('#upgrade-bell').click();
  await expect(page.getByRole('dialog')).toContainText('5% chance');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.locator('#upgrade-bell')).not.toHaveClass(/purchased/);
  await page.locator('#upgrade-bell').click();
  await page.getByRole('dialog').getByRole('button',{name:'Buy Lucky Bell',exact:true}).click();
  await expect(page.locator('#upgrade-bell')).toHaveClass(/purchased/);
  await page.getByRole('button',{name:'Achievements',exact:true}).click();
  await expect(page.locator('button.achievement-patch')).toHaveCount(36);
  await page.locator('#achievement-first-thread').click();
  await expect(page.getByRole('dialog')).toContainText('Pull the yarn once.');
  await page.keyboard.press('Escape');
  await expect(page.locator('#achievement-first-thread')).toBeFocused();
});

test('Olympus is a separate sky realm and yarn remains on workshop home', async ({page}) => {
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'New chapter',exact:true}).click();
  await expect(page.locator('#app')).toHaveClass(/olympus-open/);
  await expect(page.locator('.sky-realm')).toHaveAttribute('aria-hidden','false');
  await expect(page.locator('#realm-management')).toBeVisible();
  await expect(page.locator('#management')).toBeHidden();
  await expect(page.locator('#pull')).toBeHidden();
  await page.getByRole('button',{name:'Back to workshop',exact:true}).click();
  await expect(page.locator('#app')).not.toHaveClass(/olympus-open/);
  await expect(page.locator('#pull')).toBeInViewport();
  await page.getByRole('button',{name:'New chapter',exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#app')).not.toHaveClass(/olympus-open/);
  await expect(page.locator('#pull')).toBeInViewport();
});

test('Spanish language and separate music level persist through reload', async ({page}) => {
  await page.goto('/'); await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('combobox',{name:'Language',exact:true}).selectOption('es');
  await expect(page.getByRole('dialog')).toContainText('Español');
  await page.locator('#music-volume').focus(); await page.keyboard.press('Home');
  for (let i=0;i<8;i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Mejoras',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Un poco de lana. Un montón de gatos.',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang','es');
  await page.getByRole('button',{name:'Ajustes',exact:true}).click();
  await expect(page.locator('#language')).toHaveValue('es');
  await expect(page.locator('#music-volume')).toHaveValue('0.4');
});

test('keyboard-only players can leave Olympus and unlock music', async ({page}) => {
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  const music = page.waitForResponse(response => response.url().endsWith('apple-cider.ogg'), {timeout:5000});
  await page.keyboard.press('Space');
  expect((await music).ok()).toBe(true);
  await page.getByRole('button',{name:'New chapter',exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#app')).not.toHaveClass(/olympus-open/);
});

test('save recovery remains scrollable inside a short viewport', async ({page}) => {
  await page.setViewportSize({width:320,height:568});
  await page.addInitScript(key => localStorage.setItem(key,'broken'), SAVE_KEY);
  await page.goto('/');
  await expect(page.locator('.boot-message')).toBeVisible();
  const area = await page.locator('.boot-message').boundingBox();
  expect(area!.y).toBeGreaterThanOrEqual(0);
  expect(area!.y + area!.height).toBeLessThanOrEqual(568);
  await page.locator('.boot-message').evaluate(el => el.scrollTop = el.scrollHeight);
  await expect(page.getByRole('button',{name:'Start a new workshop',exact:true})).toBeInViewport();
});

