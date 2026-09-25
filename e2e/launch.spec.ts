import {test,expect} from '@playwright/test';

test('tablet launch waits two seconds, enters once, and returns on reload',async({page},info)=>{
 await page.goto('/');
 const intro=page.locator('#app-intro');const enter=page.locator('#enter-workshop');
 await expect(intro).toBeVisible();
 await expect(enter).toBeDisabled();
 await expect(enter).toHaveCSS('visibility','hidden');
 await page.keyboard.press('Space');
 await expect(page.locator('#yarn-count')).toHaveText('0');
 await expect(enter).toBeEnabled({timeout:4000});
 await expect(enter).toBeVisible();
 await page.screenshot({path:info.outputPath('app-intro.png')});
 await enter.press('Enter');
 await expect(intro).toHaveCount(0);
 await expect(page.locator('#pull')).toBeFocused();
 await page.locator('#pull').click();await expect(page.locator('#yarn-count')).not.toHaveText('0');
 await page.reload();await expect(page.locator('#app-intro')).toBeVisible();
});

test('reduced-motion launch is static and touch entry reveals the workshop',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('.launch-logo')).toHaveCSS('animation-name','none');
 await page.locator('#enter-workshop').click();
 await expect(page.locator('#app-intro')).toHaveCount(0);
 await expect(page.locator('.topbar')).not.toHaveAttribute('inert','');
 await expect(page.locator('#pull')).toBeVisible();
});
