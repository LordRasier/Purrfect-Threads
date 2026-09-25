import {expect,type Page} from '@playwright/test';

/** Follow the real welcome flow; recovery/ownership screens deliberately have no intro. */
export async function enterWorkshop(page: Page, keyboard = false): Promise<void> {
  await page.locator('#app-intro, .boot-message').first().waitFor();
  if (await page.locator('#app-intro').count()) {
    const enter = page.locator('#enter-workshop');
    await expect(enter).toBeEnabled();
    if (keyboard) await enter.press('Enter'); else await enter.click();
    await expect(page.locator('#app-intro')).toHaveCount(0);
  }
}
