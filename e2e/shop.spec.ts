import { test, expect } from '@playwright/test';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';
import { enterWorkshop } from './entry';

for (const language of ['en', 'es'] as const) {
  test(`shop preview is accessible and fail-closed (${language})`, async ({ page }) => {
    const game = createGame(); game.settings.language = language; game.settings.quality = 'low'; game.settings.reducedMotion = true;
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: encode(game) });
    await page.goto('/'); await enterWorkshop(page);
    expect(await page.locator('#world').evaluate(el => getComputedStyle(el, '::before').backgroundImage)).toBe('none');
    const shop = page.locator('.navigation [data-screen="shop"]');
    await expect(shop).toHaveAccessibleName(language === 'en' ? 'Shop' : 'Tienda');
    const order = await page.locator('.navigation [data-screen]').evaluateAll(nodes => nodes.map(node => (node as HTMLElement).dataset.screen));
    expect(order.slice(-2)).toEqual(['chapter', 'shop']);
    await shop.click();
    await expect(page.getByRole('heading', { name: language === 'en' ? 'Meowtastic Crew' : 'Equipo Miautástico' })).toBeVisible();
    await expect(page.locator('.shop-price')).toContainText('USD 2.00');
    await expect(page.locator('[data-action="shop-purchase"]')).toBeDisabled();
    await expect(page.locator('#shop-status')).toContainText(language === 'en' ? 'not available' : 'no están disponibles');
    await expect.poll(() => page.locator('.shop-illustration img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(1536);
    await page.locator('.shop-illustration img').evaluate(image => (image as HTMLImageElement).decode());
    await expect(page.locator('.shop-illustration img')).toBeVisible();
    await page.screenshot({ path: `test-results/shop-${test.info().project.name}${language === 'es' ? '-es' : ''}.png` });
    await page.locator('[data-action="shop-restore"]').click();
    await expect(page.locator('#toast')).toContainText(language === 'en' ? 'No charge' : 'No se ha cobrado');
    for (const state of ['PENDING', 'CANCELED', 'PURCHASED']) {
      await page.evaluate(state => window.dispatchEvent(new CustomEvent('purchaseUpdated', { detail: { state, productId: 'meowtastic_crew_12h' } })), state);
    }
    for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 812 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(viewport);
      await shop.scrollIntoViewIfNeeded();
      const box = await shop.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('.navigation [data-screen="workshop"]').click();
    await expect(page.getByTestId('rate')).toHaveText('0');
    await expect(page.getByTestId('yarn')).toHaveText('0');
    await page.locator('#pull').click();
    await expect(page.getByTestId('yarn')).toHaveText('1');
  });
}
