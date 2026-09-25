import { test, expect } from '@playwright/test';
import Decimal from 'break_infinity.js';
import { createGame } from '../src/game/engine';
import { SAVE_KEY, encode } from '../src/game/storage';

test('responsive controls, reduced motion and a populated workshop', async ({ page }, info) => {
  const game = createGame(Date.now());
  game.yarn = game.runEarned = game.lifetime = new Decimal(200000);
  game.owned = { ...game.owned, kitten: 3, basket: 1, corner: 1, workshop: 1, factory: 1 };
  game.collection = [0, 1, 2, 3, 4, 5];
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: encode(game) });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#world')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('body')).toHaveClass(/reduced-motion/);
  for (const size of [{ width: 1440, height: 1000 }, { width: 375, height: 812 }, { width: 812, height: 375 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(size);
    await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible();
    expect(await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, offenders: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => el.className).slice(0,12) }))).toMatchObject({overflow:0});
    const undersized = await page.locator('button:visible').evaluateAll(buttons => buttons
      .filter(button => { const r = button.getBoundingClientRect(); return r.width < 43.9 || r.height < 43.9; })
      .map(button => button.getAttribute('aria-label') ?? button.textContent));
    expect(undersized).toEqual([]);
    if (info.project.name === 'desktop' && (size.width === 1440 || size.width === 375)) {
      await page.screenshot({ path: `docs/screenshots/workshop-${size.width}.png`, fullPage: true });
    }
  }
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Pull yarn', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('region', {name:'Workshop management',exact:true})).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BUTTON');
});
