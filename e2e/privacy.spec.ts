import { test, expect } from '@playwright/test';
import { enterWorkshop } from './entry';

test('privacy is readable offline in both languages without leaving the game', async ({ page, context }) => {
  await page.goto('/'); await enterWorkshop(page);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Privacy policy', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Privacy policy' })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('90 days');
  await expect(page.getByRole('dialog')).toContainText('rasier_k@hotmail.com');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.locator('#language').selectOption('es');
  await page.getByRole('button', { name: 'Política de privacidad', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Política de privacidad' })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('90 días');
  await expect(page.getByRole('dialog')).toContainText('Auraliax');
});
