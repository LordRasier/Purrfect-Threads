import { test, expect } from '@playwright/test';

test('a new workshop can earn, adopt, produce, and reload', async ({ page, isMobile }) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A little yarn. A lot of cats.' })).toBeVisible();
  const pull = page.getByRole('button', { name: 'Pull yarn', exact: true });
  await expect(pull).toBeVisible();
  if (isMobile) {
    for (let n = 0; n < 75; n++) { await pull.tap(); await page.waitForTimeout(210); }
  } else {
    await pull.focus();
    await page.keyboard.down('Space');
    await page.waitForTimeout(15200);
    await page.keyboard.up('Space');
  }
  await page.locator('.navigation [data-screen="crew"]').click();
  const adopt = page.getByRole('button', { name: /Adopt Kitten/ });
  await expect(adopt).toBeEnabled();
  await adopt.click();
  await expect(page.getByTestId('population')).toHaveText('1');
  await expect(page.getByTestId('rate')).toHaveText('1');
  await page.reload();
  await expect(page.getByTestId('population')).toHaveText('1');
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('tabs, collection and settings are accessible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Cat collection', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Meet your little legends.' })).toBeVisible();
  await page.getByRole('button', { name: 'New chapter', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mount Pawlympus' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Begin a new chapter' })).toBeDisabled();
  await page.getByRole('button', { name: 'Back to workshop', exact: true }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Reduced motion').check();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
