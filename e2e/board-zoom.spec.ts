import { test, expect, type Page } from '@playwright/test';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';
import { enterWorkshop } from './entry';

async function openBoard(page: Page) {
  const game = createGame(); game.settings.reducedMotion = true;
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: encode(game) });
  await page.goto('/'); await enterWorkshop(page);
  await page.getByRole('button', { name: 'Upgrades', exact: true }).click();
}

test('zoom controls fit the board, preserve browser zoom gestures, and retain drag behavior', async ({ page }, info) => {
  await openBoard(page);
  const viewport = page.locator('.tree-scroll');
  const level = page.locator('[data-zoom-level]');
  await expect(level).toHaveText('100%');
  for (const button of await page.locator('.tree-zoom-controls button').all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(level).not.toHaveText('100%');
  expect(await viewport.evaluate(el => {
    const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100 }); el.dispatchEvent(wheel); return wheel.defaultPrevented;
  })).toBe(true);
  expect(await viewport.evaluate(el => {
    const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -100 }); el.dispatchEvent(wheel); return wheel.defaultPrevented;
  })).toBe(false);
  const root = page.locator('#upgrade-hold'); const box = (await root.boundingBox())!;
  const start = await viewport.evaluate(el => el.scrollLeft);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x - 80, box.y - 20, { steps: 4 }); await page.mouse.up();
  expect(await viewport.evaluate(el => el.scrollLeft)).toBeGreaterThan(start + 20);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.setViewportSize(info.project.name === 'mobile' ? { width: 320, height: 640 } : { width: 900, height: 700 });
  await page.getByRole('button', { name: 'Fit all upgrades', exact: true }).click();
  await expect(level).not.toHaveText('100%');
  expect(await viewport.evaluate(el => el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  const centered = await page.locator('.upgrade-tree').evaluate(tree => {
    const canvas = tree.getBoundingClientRect(), viewport = tree.parentElement!.parentElement!.getBoundingClientRect();
    return [canvas.left - viewport.left, canvas.top - viewport.top, viewport.right - canvas.right, viewport.bottom - canvas.bottom];
  });
  expect(Math.abs(centered[0] - centered[2])).toBeLessThanOrEqual(2);
  expect(Math.abs(centered[1] - centered[3])).toBeLessThanOrEqual(2);
  expect(await page.locator('.sticky-note').evaluateAll(nodes => {
    const scroll = document.querySelector('.tree-scroll')!.getBoundingClientRect();
    const management = document.querySelector('#management')!.getBoundingClientRect();
    const bounds = { left: Math.max(scroll.left, management.left, 0), top: Math.max(scroll.top, management.top, 0), right: Math.min(scroll.right, management.right, innerWidth), bottom: Math.min(scroll.bottom, management.bottom, innerHeight) };
    return nodes.every(node => {
      const rect = node.getBoundingClientRect();
      return rect.left >= bounds.left - 1 && rect.top >= bounds.top - 1 && rect.right <= bounds.right + 1 && rect.bottom <= bounds.bottom + 1;
    });
  })).toBe(true);
  await page.screenshot({ path: `test-results/board-zoom-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Center on Helping Thread', exact: true }).click();
  await expect(level).toHaveText('100%');
});
