import {test,expect} from '@playwright/test';
import Decimal from 'break_infinity.js';
import {createGame} from '../src/game/engine';
import {encode,SAVE_KEY} from '../src/game/storage';

test('first crew purchase awakens themed scenery once; later buys and reload do not replay it',async({page},info)=>{
 const game=createGame();game.yarn=game.lifetime=game.runEarned=new Decimal('1e12');
 await page.addInitScript(({key,raw})=>{if(!localStorage.getItem(key))localStorage.setItem(key,raw)}, {key:SAVE_KEY,raw:encode(game)});
 await page.goto('/');await page.locator('.navigation [data-screen="crew"]').click();
 await expect(page.locator('#card-kitten .crew-sprite')).toHaveCount(0);
 await page.locator('#buy-kitten').click();
 await expect(page.locator('#card-kitten')).toHaveClass(/crew-awakening/);
 await expect(page.locator('#card-kitten .crew-sprite')).toHaveCount(3);
 expect(await page.locator('#card-kitten .crew-worker').evaluate(el=>getComputedStyle(el).animationName)).not.toBe('none');
 await page.locator('#buy-kitten').click();await expect(page.locator('#card-kitten')).not.toHaveClass(/crew-awakening/);
 await page.locator('[data-quantity="10"]').click();await page.locator('#buy-basket').click();
 await expect(page.locator('#card-basket')).toHaveClass(/crew-awakening/);
 await expect(page.locator('#card-basket .crew-scene')).toHaveAttribute('data-theme','basket');
 await page.reload();await page.locator('.navigation [data-screen="crew"]').click();
 await expect(page.locator('#card-kitten .crew-sprite')).toHaveCount(3);
 await expect(page.locator('.crew-awakening')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('crew-sprites.png')});
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.locator('#quality').selectOption('low');await page.keyboard.press('Escape');
 await expect(page.locator('#card-kitten .crew-scene')).toHaveAttribute('data-resting','true');
 expect(await page.locator('#card-kitten .crew-worker').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.locator('#quality').selectOption('auto');await page.keyboard.press('Escape');
 expect(await page.locator('#card-kitten .crew-worker').evaluate(el=>getComputedStyle(el).animationName)).not.toBe('none');
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await page.locator('#card-kitten .crew-worker').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 const button=page.locator('#buy-kitten');const bounds=await button.boundingBox();
 expect(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('button')?.id,{x:bounds!.x+bounds!.width/2,y:bounds!.y+bounds!.height/2})).toBe('buy-kitten');
});

