import { enterWorkshop } from './entry';
import { test, expect } from '@playwright/test';
import Decimal from 'break_infinity.js';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';

test('compact ten-crew shop and separate cozy progression spaces', async ({ page }, info) => {
  const game = createGame(Date.now()); game.yarn = game.runEarned = game.lifetime = new Decimal('1e14');
  game.chapters = 9; game.claimed = new Decimal(9); game.points = new Decimal(6); game.talents = ['knitters']; game.upgrades = ['hold'];
  await page.addInitScript(({key, raw}) => localStorage.setItem(key,raw), {key:SAVE_KEY,raw:encode(game)});
  await page.goto('/'); await enterWorkshop(page);
  if (info.project.name === 'desktop') await page.setViewportSize({width:961,height:854});
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await page.locator('.navigation [data-screen="crew"]').click();
  await expect(page.locator('.producer:visible')).toHaveCount(10);
  const row = page.locator('#card-kitten');
  expect((await row.boundingBox())!.height).toBeLessThanOrEqual(88);
  const art = await row.locator('.producer-icon').boundingBox();
  const buy = await row.getByRole('button').boundingBox();
  expect(Math.abs((art!.y + art!.height / 2) - (buy!.y + buy!.height / 2))).toBeLessThan(4);
  if (info.project.name === 'desktop') await page.screenshot({path:'docs/screenshots/v04-crew.png',fullPage:true});
  await expect(page.locator('#upgrade-paws')).toHaveCount(0);
  await expect(page.locator('.milestone')).toHaveCount(0);
  await page.getByRole('button', {name:'Upgrades',exact:true}).click();
  await expect(page.locator('.upgrade-board')).toBeVisible();
  if (info.project.name === 'desktop') await page.screenshot({path:'docs/screenshots/v04-board.png',fullPage:true});
  await page.getByRole('button', {name:'Inspect Soft Paws',exact:true}).click();
  await page.getByRole('dialog').getByRole('button', {name:'Buy Soft Paws',exact:true}).click();
  await expect(page.locator('#upgrade-paws')).toHaveClass(/purchased/);
  await page.getByRole('button', {name:'Achievements',exact:true}).click();
  await expect(page.locator('.achievement-card')).toHaveCount(36);
  await expect(page.getByText('A bright idea',{exact:true})).toBeVisible();
  await page.getByLabel('Achievement category').selectOption('Upgrades');
  await expect(page.locator('.achievement-card')).toHaveCount(4);
  if (info.project.name === 'desktop') await page.screenshot({path:'docs/screenshots/v04-achievements.png',fullPage:true});
  await page.getByRole('button', {name:'New chapter',exact:true}).click();
  await expect(page.locator('.olympus')).toBeVisible();
  await expect(page.locator('.statue-viewport')).toHaveCount(12);
  if (info.project.name === 'desktop') await page.screenshot({path:'docs/screenshots/v04-olympus.png',fullPage:true});
  await page.getByRole('button', {name:/Welcome Home/}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Buy Welcome Home',exact:true}).click();
  await expect(page.locator('#talent-welcome')).toHaveClass(/purchased/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});



test('simultaneous badges are announced without losing the purchase feedback', async ({ page }) => {
  const game = createGame(Date.now()); game.yarn = game.runEarned = game.lifetime = new Decimal('1e10'); game.stats.taps = 1000; game.owned.corner = 4; game.owned.kitten = 49;
  await page.addInitScript(({key, raw}) => localStorage.setItem(key,raw), {key:SAVE_KEY,raw:encode(game)});
  await page.goto('/'); await enterWorkshop(page);
  await page.locator('.navigation [data-screen="crew"]').click();
  await page.getByRole('button', {name:'Adopt Kitten',exact:true}).click();
  await expect(page.locator('#toast')).toContainText('Achievement unlocked');
  await expect(page.locator('#toast')).toContainText('Kira');
});
