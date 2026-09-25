import {it,expect} from 'vitest';
import {PRODUCERS} from '../src/game/catalog';
import {crewScenery} from '../src/ui/crew-art';
it('keeps inactive crew cards empty and bounds active artwork to three decorative sprites',()=>{
 for(const producer of PRODUCERS){
  expect(crewScenery(producer,0,false)).toBe('');
  const art=crewScenery(producer,10000,false);
  expect(art.match(/class="crew-sprite /g)).toHaveLength(3);
  expect(art).toContain(`data-theme="${producer.id}"`);
  expect(art).toContain('aria-hidden="true"');
 }
});
it('provides a static low-power variant',()=>{
 expect(crewScenery(PRODUCERS[0],1,true)).toContain('data-resting="true"');
});
