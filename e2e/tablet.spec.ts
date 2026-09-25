import { test, expect } from '@playwright/test';

test('tablet home and internal tabs share one device without a floating yarn dock', async ({page}) => {
  await page.addInitScript(() => document.addEventListener('click', () => {
    document.documentElement.dataset.observedTravel = document.querySelector<HTMLElement>('#app')?.dataset.travel;
    document.documentElement.dataset.observedTabAnimation = String((document.querySelector('#management')?.getAnimations().length ?? 0) > 0);
  }));
  await page.goto('/');
  await expect(page.locator('.tablet-device #pull')).toBeVisible();
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await expect(page.locator('#management')).toBeHidden();
  for (const screen of ['crew','upgrades','achievements','collection']) {
    await page.locator(`.navigation [data-screen="${screen}"]`).click();
    await expect(page.locator('.tablet-device #management')).toHaveAttribute('data-screen',screen);
    await expect(page.locator('#pull')).toBeHidden();
    await expect(page.locator('#app')).toHaveAttribute('data-travel','idle');
    await expect(page.locator('html')).toHaveAttribute('data-observed-tab-animation','true');
  }
  await page.locator('.navigation [data-screen="workshop"]').click();
  await expect(page.locator('#pull')).toBeVisible();
});

test('sky journey ascends out of the tablet and reverses safely, including reduced motion', async ({page}) => {
  await page.addInitScript(() => document.addEventListener('click', () => {
    document.documentElement.dataset.observedTravel = document.querySelector<HTMLElement>('#app')?.dataset.travel;
    document.documentElement.dataset.observedTabAnimation = String((document.querySelector('#management')?.getAnimations().length ?? 0) > 0);
  }));
  await page.goto('/'); await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await page.locator('.navigation [data-screen="chapter"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-observed-travel','ascending');
  await expect(page.locator('#app')).toHaveAttribute('data-travel','idle');
  await expect(page.locator('.sky-realm #talent-helping')).toBeInViewport();
  await expect(page.locator('#pull')).toBeHidden();
  await page.keyboard.press('Escape');
  // Escape can finish before the next automation round trip on a busy mobile emulator.
  await expect(page.locator('#app')).not.toHaveClass(/olympus-open/);
  await expect(page.locator('#app')).toHaveAttribute('data-travel','idle');
  await expect(page.locator('.navigation [data-screen="workshop"]')).toBeFocused();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.navigation [data-screen="chapter"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-travel','idle');
  await page.locator('.realm-back').click();
  await expect(page.locator('#pull')).toBeVisible();
  // A quick reversal cannot leave an invisible or inert workshop.
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.navigation [data-screen="chapter"]').click();await page.keyboard.press('Escape');
  await expect(page.locator('#app')).toHaveAttribute('data-travel','idle');
  await expect(page.locator('#pull')).toBeInViewport();
});

test('tablet and sky fit small phones, landscape and desktop with usable controls', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  for (const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1366,height:768}]) {
    await page.setViewportSize(size);
    await expect(page.locator('#pull')).toBeInViewport();
    expect(await page.locator('.navigation button').evaluateAll(buttons => buttons.filter(button => [...button.querySelectorAll('span')].some(label => label.getBoundingClientRect().width > button.getBoundingClientRect().width)).length)).toBe(0);
    await page.locator('.navigation [data-screen="crew"]').click();
    await expect(page.locator('#buy-kitten')).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('.navigation [data-screen="chapter"]').click();
    await page.locator('#talent-knitters').scrollIntoViewIfNeeded();
    const hit=await page.locator('#talent-knitters').evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')?.id});
    expect(hit).toBe('talent-knitters');
    await page.locator('#talent-knitters').click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
    await page.locator('.realm-back').click();
  }
});


test('leaving the play screen cancels held input and prevents hidden Space clicks', async ({page}) => {
  await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await page.locator('#pull').focus();await page.keyboard.down('Space');await page.waitForTimeout(450);
  await page.locator('.navigation [data-screen="crew"]').click();
  const balance=await page.locator('#tablet-yarn').textContent();
  expect(Number(balance)).toBeGreaterThan(0);
  await page.waitForTimeout(650);await expect(page.locator('#tablet-yarn')).toHaveText(balance!);
  await page.keyboard.up('Space');await page.locator('#management').focus();await page.keyboard.press('Space');
  await expect(page.locator('#tablet-yarn')).toHaveText(balance!);
  await page.locator('.navigation [data-screen="workshop"]').click();
  await expect(page.locator('#yarn-count')).toHaveText(balance!);
  await page.locator('#pull').focus();await page.keyboard.press('Space');
  await expect(page.locator('#yarn-count')).not.toHaveText(balance!);
});

test('travel completion follows the animation, and a mid-flight reversal preserves the viewport', async ({page}) => {
  await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-ready','true');
  await page.evaluate(() => {
    const track = document.querySelector('.journey-track')!;
    getComputedStyle(track).transform;
    document.querySelector<HTMLButtonElement>('.navigation [data-screen="chapter"]')!.click();
    const animation = track.getAnimations()[0]; animation.pause(); animation.currentTime = 350;
  });
  await page.waitForTimeout(1100);
  await expect(page.locator('#app')).toHaveAttribute('data-travel','ascending');
  const top=await page.locator('.sky-realm').evaluate(el=>el.getBoundingClientRect().top);
  expect(top).toBeLessThan(0);expect(top).toBeGreaterThan(-page.viewportSize()!.height);
  await page.keyboard.press('Escape');
  await expect(page.locator('#app')).toHaveAttribute('data-travel','idle');
  await expect(page.locator('#pull')).toBeInViewport();
});

test('home shortcuts transfer keyboard focus and regions never receive pressed state', async ({page}) => {
  await page.goto('/');await page.locator('.home-actions button').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#management')).toBeFocused();
  await expect(page.locator('[role="region"][aria-pressed]')).toHaveCount(0);
});
