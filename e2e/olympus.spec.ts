import { test, expect } from '@playwright/test';
import Decimal from 'break_infinity.js';
import { createGame } from '../src/game/engine';
import { encode, SAVE_KEY } from '../src/game/storage';

test.beforeEach(async ({ page }) => {
  const game = createGame();
  game.yarn = game.lifetime = game.runEarned = new Decimal('1e12');
  await page.addInitScript(({key, raw}) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
  }, { key: SAVE_KEY, raw: encode(game) });
});

test('twelve illustrated gods fit desktop and open inspect-before-buy dialogs', async ({ page }, info) => {
  await page.goto('/');
  if (info.project.name === 'desktop') await page.setViewportSize({width:961,height:854});
  await page.getByRole('button', {name:'New chapter', exact:true}).click();
  await expect(page.locator('.statue-viewport')).toHaveCount(12);
  await expect(page.locator('.olympus')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.olympus canvas')).toHaveCount(1);
  await expect(page.locator('.statue-viewport[data-art-ready="true"]')).toHaveCount(12);
  const back = page.getByRole('button', {name:'Back to workshop',exact:true});
  expect((await back.textContent())!.trim()).toBe('');
  if (info.project.name === 'desktop') {
    const heading = await page.locator('.realm-toolbar h2').boundingBox();
    const control = await back.boundingBox();
    expect(Math.abs(heading!.y + heading!.height / 2 - control!.y - control!.height / 2)).toBeLessThan(30);
    expect(await page.locator('#management').evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
    for (const card of await page.locator('.statue-card').all()) await expect(card).toBeInViewport({ratio:1});
    await expect(page.locator('#prestige-button')).toBeInViewport({ratio:1});
  }
  await page.locator('#talent-welcome').click();
  await expect(page.getByRole('dialog')).toContainText('Start every new chapter with 3 cats.');
  await expect(page.getByRole('dialog').getByRole('button',{name:'Buy Welcome Home',exact:true})).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.locator('#talent-welcome')).toBeFocused();
  await page.locator('#prestige-button').click();
  await expect(page.getByRole('dialog')).toContainText('+1 golden paw');
  await page.getByRole('button', {name:'Move to the new workshop'}).click();
  await expect(page.locator('#prestige-button')).toBeDisabled();
  await expect(page.locator('#prestige-reward')).toHaveText('+1 golden paw');
  await expect(page.locator('#points-label')).toHaveText('1 golden paw');
  await page.locator('#talent-welcome').click();
  await page.getByRole('dialog').getByRole('button',{name:'Buy Welcome Home',exact:true}).click();
  await expect(page.locator('#talent-welcome')).toHaveClass(/purchased/);
  await expect(page.locator('#points-label')).toHaveText('0 golden paws');
  await page.locator('#talent-welcome').click();
  await expect(page.getByRole('dialog').getByRole('button',{name:'Purchased',exact:true})).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button', {name:'New chapter',exact:true}).click();
  await expect(page.locator('#talent-welcome')).toHaveClass(/purchased/);
  await expect(page.locator('.olympus')).toHaveAttribute('data-ready','true');
  await expect(page.locator('#pull')).toBeInViewport();
  await expect(page.locator('.statue-viewport[data-art-ready="true"]')).toHaveCount(12);
  if (info.project.name === 'desktop') await page.screenshot({path:'docs/screenshots/v041-illustrated-pantheon.png'});
  else await page.screenshot({path:'docs/screenshots/v041-illustrated-mobile.png'});
});

test('compact pantheon survives short desktop, mobile scrolling and repeated navigation', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  if (info.project.name === 'desktop') await page.setViewportSize({width:1280,height:720});
  for (let i=0;i<3;i++) {
    await page.getByRole('button', {name:'New chapter',exact:true}).click();
    await expect(page.locator('.olympus')).toHaveAttribute('data-ready','true');
    if (info.project.name === 'desktop') {
      expect(await page.locator('#management').evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
    } else {
      await page.locator('#talent-dionysus').scrollIntoViewIfNeeded();
      await page.locator('#talent-dionysus').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('.olympus canvas')).toHaveCount(0);
    await expect(page.locator('#pull')).toBeInViewport();
  }
  expect(errors).toEqual([]);
});

test('a Spanish v3 workshop retains earned paws and blessings after migration', async ({page}) => {
  const game = createGame();
  game.lifetime = new Decimal('1600000'); game.yarn = game.runEarned = new Decimal('300000');
  game.chapters = 1; game.claimed = new Decimal(2); game.points = new Decimal(1); game.talents = ['welcome'];
  game.settings.language = 'es'; game.settings.reducedMotion = true;
  const legacy = { ...JSON.parse(encode(game)), version:3 };
  delete legacy.legacyClaimed; delete legacy.legacyChapters;
  await page.addInitScript(({key,raw}) => { if (!sessionStorage.getItem('legacy-seeded')) { localStorage.setItem(key,raw); sessionStorage.setItem('legacy-seeded','1'); } },{key:SAVE_KEY,raw:JSON.stringify(legacy)});
  await page.goto('/');
  await page.getByRole('button',{name:'Nuevo capítulo',exact:true}).click();
  await expect(page.locator('#points-label')).toHaveText('1 pata dorada');
  await expect(page.locator('#talent-welcome')).toHaveClass(/purchased/);
  await expect(page.locator('#prestige-reward')).toHaveText('+1 pata dorada');
  await expect(page.locator('#prestige-remaining')).toContainText('únicamente al reiniciar');
  await page.locator('#talent-knitters').click();
  await expect(page.getByRole('dialog')).toContainText('Atenea');
  await expect(page.getByRole('dialog')).toContainText('Desbloquea Herramientas maestras');
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button',{name:'Nuevo capítulo',exact:true}).click();
  await expect(page.locator('#points-label')).toHaveText('1 pata dorada');
  await expect(page.locator('#talent-welcome')).toHaveClass(/purchased/);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect(saved.version).toBe(4);
  expect(saved.legacyClaimed).toBe('2');
  expect(saved.settings.reducedMotion).toBe(true);
});


test('a failed portrait keeps an inspectable fallback and does not block other gods', async ({page}) => {
  await page.route('**/art/olympians/helping.webp', route => route.abort());
  await page.goto('/');
  await page.getByRole('button', {name:'New chapter',exact:true}).click();
  await expect(page.locator('[data-statue-id="helping"]')).toHaveAttribute('data-art-ready','error');
  await expect(page.locator('.statue-viewport[data-art-ready="true"]')).toHaveCount(11);
  await expect(page.locator('#talent-helping .statue-fallback')).toBeVisible();
  await page.locator('#talent-helping').click();
  await expect(page.getByRole('dialog')).toContainText('Helping Paw');
});
