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

for (const language of ['en', 'es'] as const) {
  test(`account deletion request remains accessible without an account (${language})`, async ({ page }) => {
    await page.goto('/'); await enterWorkshop(page);
    if (language === 'es') {
      await page.getByRole('button', { name: 'Settings', exact: true }).click();
      await page.locator('#language').selectOption('es');
      await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
    }
    await page.locator('.navigation [data-screen="shop"]').click();
    const link = page.getByRole('link', { name: language === 'en' ? 'Request account deletion' : 'Solicitar eliminación de cuenta', exact: true });
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://www.auraliax.com/privacy-purrfect-threads#delete-account');
    await expect(link).toHaveAttribute('target', '_blank');
    await link.focus(); await expect(link).toBeFocused();
    await expect(page.locator('.account-card')).toContainText(language === 'en' ? 'does not delete your account' : 'no elimina tu cuenta');
    await page.screenshot({ path: `test-results/deletion-${test.info().project.name}-${language}.png` });
    // Do not navigate to the not-yet-published remote policy during a local smoke test.
  });
}
