import { test, expect, type Page } from '@playwright/test';
import Decimal from 'break_infinity.js';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';
import { enterWorkshop } from './entry';

async function seed(page: Page, legacy = false) {
  const game = createGame(); game.yarn = game.lifetime = game.runEarned = new Decimal(900);
  game.settings.reducedMotion = true;
  const raw = JSON.stringify({ ...JSON.parse(encode(game)), ...(legacy ? { version: 5, upgrades: ['moonlit'] } : {}) });
  await page.addInitScript(({ key, raw }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
  }, { key: SAVE_KEY, raw });
  await page.goto('/'); await enterWorkshop(page);
}

async function pointerHold(page: Page) {
  const pull = page.locator('#pull');
  const box = await pull.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down(); await page.waitForTimeout(700); await page.mouse.up();
}

test('tree gates purchases and enables pointer and Space holds only after the root', async ({ page }, info) => {
  test.setTimeout(60000);
  await seed(page);
  await expect(page.locator('#tap-hint')).toHaveText('Unlock Helping Thread to hold the yarn or Space');
  await page.reload(); await enterWorkshop(page);
  const fresh = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect(fresh.upgrades).toEqual([]);
  const count = () => page.locator('#yarn-count').innerText();
  await pointerHold(page); expect(await count()).toBe('901');
  await page.waitForTimeout(240);
  await page.locator('#pull').focus(); await page.keyboard.down('Space'); await page.waitForTimeout(700); await page.keyboard.up('Space');
  await expect(page.locator('#yarn-count')).toHaveText('902');
  await page.getByRole('button', { name: 'Upgrades', exact: true }).click();
  await expect(page.locator('.upgrade-tree .sticky-note')).toHaveCount(63);
  await expect(page.locator('.tree-strings path')).toHaveCount(62);
  await expect(page.locator('#upgrade-hold')).toBeInViewport();
  await page.locator('#upgrade-paws').click();
  await expect(page.getByRole('dialog')).toContainText('Requires: Helping Thread');
  await expect(page.getByRole('button', { name: 'Buy Soft Paws', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.locator('#upgrade-hold').focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Buy Helping Thread', exact: true }).click();
  await expect(page.locator('#upgrade-hold')).toHaveClass(/purchased/);
  await expect(page.locator('#upgrade-hold')).toBeFocused();
  await page.locator('#upgrade-paws').click();
  await expect(page.getByRole('button', { name: 'Buy Soft Paws', exact: true })).toBeEnabled();
  await page.keyboard.press('Escape');
  // Coordinates are shared by the notes and the SVG; every string ends at its pin.
  const offsets = await page.locator('.tree-strings path').evaluateAll(paths => paths.map(path => {
    const line = path as SVGPathElement;
    const matrix = line.getScreenCTM()!;
    return Math.max(...[['from', 0], ['to', line.getTotalLength()]].map(([key, distance]) => {
      const point = line.getPointAtLength(Number(distance));
      const pin = document.querySelector(`#upgrade-${line.dataset[String(key)]} .note-pin`)!.getBoundingClientRect();
      return Math.hypot(point.x * matrix.a + matrix.e - pin.x - pin.width / 2, point.y * matrix.d + matrix.f - pin.y - pin.height / 2);
    }));
  }));
  expect(Math.max(...offsets)).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.mouse.move(0, 0);
  await page.locator('#upgrade-hold').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('#toast')).toBeHidden();
  await page.locator('#management').evaluate(el => { el.scrollTop = 0; });
  await page.screenshot({ path: `test-results/upgrade-tree-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Workshop', exact: true }).click();
  const before = Number((await count()).replaceAll(',', ''));
  await pointerHold(page);
  await expect.poll(async () => Number((await count()).replaceAll(',', ''))).toBeGreaterThanOrEqual(before + 3);
  await page.waitForTimeout(240);
  const beforeKeyboard = Number((await count()).replaceAll(',', ''));
  await page.locator('#pull').focus(); await page.keyboard.down('Space'); await page.waitForTimeout(700); await page.keyboard.up('Space');
  await expect.poll(async () => Number((await count()).replaceAll(',', ''))).toBeGreaterThanOrEqual(beforeKeyboard + 3);
  await page.reload(); await enterWorkshop(page);
  await page.getByRole('button', { name: 'Upgrades', exact: true }).click();
  await expect(page.locator('#upgrade-hold')).toHaveClass(/purchased/);
});

test('small icon notes expose clamped hover/focus details and pan without activating', async ({ page }, info) => {
  await seed(page);
  await page.locator('.navigation [data-screen="upgrades"]').click();
  const viewport = page.locator('.tree-scroll'), root = page.locator('#upgrade-hold');
  await expect(root).toBeInViewport();
  await root.evaluate(el => el.addEventListener('click', () => { el.dataset.activations = String(Number(el.dataset.activations ?? 0) + 1); }));
  if (info.project.name === 'mobile') { await root.tap(); await expect(page.getByRole('dialog')).toContainText('Helping Thread'); await page.keyboard.press('Escape'); }
  expect((await root.boundingBox())!.width).toBeLessThanOrEqual(56);
  await expect(root.locator('strong')).toHaveCount(0);
  expect(await root.locator('.sr-only').evaluateAll(nodes => nodes.every(node => node.getBoundingClientRect().width <= 1))).toBe(true);
  await root.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toContainText('Helping Thread');
  await expect(tooltip).toContainText('25 yarn');
  await expect(tooltip).toContainText('five times a second');
  expect(await tooltip.evaluate(el => el.closest('.tree-scroll') === null)).toBe(true);
  // A tiny uncaptured gesture can leave the viewport before pointerup.
  const edge = (await viewport.boundingBox())!;
  await page.mouse.move(edge.x + 1, edge.y + 30); await page.mouse.down();
  await page.mouse.move(edge.x - 3, edge.y + 30); await page.mouse.up();
  await root.hover(); await expect(tooltip).toBeVisible();
  const start = await viewport.evaluate(el => el.scrollLeft);
  const box = (await root.boundingBox())!;
  if (info.project.name === 'mobile') {
    const touch = await page.context().newCDPSession(page);
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 90, y: y - 45 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touch.detach();
  } else {
    await page.mouse.move(box.x + 24, box.y + 24); await page.mouse.down();
    await page.mouse.move(box.x - 80, box.y - 30, { steps: 5 }); await page.mouse.up();
  }
  expect(await viewport.evaluate(el => el.scrollLeft)).toBeGreaterThan(start + 50);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(tooltip).not.toBeVisible();
  if (info.project.name === 'mobile') await root.tap(); else await root.click();
  await expect(page.getByRole('dialog')).toContainText('Helping Thread');
  await expect(root).toHaveAttribute('data-activations', info.project.name === 'mobile' ? '2' : '1');
  await expect(page.locator('#yarn-count')).toHaveText('900');
  await page.keyboard.press('Escape');
  const distant = page.locator('#upgrade-astral-practice-5');
  await distant.focus();
  await expect(distant).toBeInViewport();
  await expect(tooltip).toContainText('Celestial Cats');
  await expect(tooltip).toContainText('+1%');
  await expect(tooltip).toContainText('Requires:');
  const bounds = (await tooltip.boundingBox())!;
  const screen = page.viewportSize()!;
  expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(screen.width);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(screen.height);
  await page.keyboard.press('Escape'); await expect(tooltip).not.toBeVisible();
  await page.locator('.navigation [data-screen="crew"]').click();
  await expect(page.locator('#upgrade-tooltip')).toHaveCount(0);
});

test('legacy root is granted once and shop status has breathing room', async ({ page }) => {
  await seed(page, true);
  await page.getByRole('button', { name: 'Upgrades', exact: true }).click();
  await expect(page.locator('#upgrade-hold')).toHaveClass(/purchased/);
  await expect(page.locator('#upgrade-moonlit')).toHaveClass(/purchased/);
  await expect(page.locator('#upgrade-purring')).not.toHaveClass(/purchased/);
  await page.reload(); await enterWorkshop(page);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect(saved.version).toBe(6); expect(saved.upgrades).toEqual(['moonlit', 'hold']);
  expect(saved.stats.upgradePurchases).toBe(0);
  await page.locator('.navigation [data-screen="shop"]').click();
  const margins = await page.locator('#shop-status').evaluate(el => [getComputedStyle(el).marginTop, getComputedStyle(el).marginBottom]);
  expect(margins.map(parseFloat)).toEqual([16, 16]);
});

test('Spanish notes remain reachable on a small phone and in landscape', async ({ page }) => {
  await seed(page);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('es');
  await page.keyboard.press('Escape');
  await page.locator('.navigation [data-screen="upgrades"]').click();
  for (const viewport of [{ width: 375, height: 667 }, { width: 740, height: 375 }]) {
    await page.setViewportSize(viewport);
    await page.locator('#upgrade-master').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toContainText('Requiere: Mejores herramientas + Tejedores maestros');
    await expect(page.getByRole('dialog').locator('[data-action="upgrade"]')).toBeDisabled();
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
