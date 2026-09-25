import { describe, expect, it, vi } from 'vitest';
import { Group } from 'three';
import { COMPANION_IDS, CompanionPortrait } from '../src/scene/companion';
import { activeCompanion, createGame } from '../src/game/engine';

type Request = { url: string; loaded: (image: HTMLImageElement) => void; failed: () => void };

function fixture() {
  const requests: Request[] = [];
  const host = { dataset: {} } as unknown as HTMLElement;
  const portrait = new CompanionPortrait(host, new Group(), {
    load: (url, loaded, failed) => { requests.push({ url, loaded, failed }); },
  });
  return { host, portrait, requests };
}

describe('workshop companion selection', () => {
  it('keeps a locked selection off the cushion and maps unlocked coats to their original art', () => {
    const locked = createGame(); locked.coat = 2;
    expect(activeCompanion(locked)).toBeUndefined();
    expect(COMPANION_IDS[2]).toBe('roman');
  });

  it('ignores an out-of-order old image so switching never shows the previous cat', () => {
    const { host, portrait, requests } = fixture();
    portrait.sync('kira');
    portrait.sync('mario');
    requests[0].loaded({} as HTMLImageElement);
    expect(portrait.sprite.visible).toBe(false);
    expect(host.dataset.companion).toBe('mario');
    expect(host.dataset.companionReady).toBe('loading');
    requests[1].loaded({} as HTMLImageElement);
    expect(portrait.sprite.visible).toBe(true);
    expect(portrait.sprite.material.map!.version).toBeGreaterThan(0);
    expect(host.dataset.companionReady).toBe('true');
  });

  it('reports a failed selected image without retaining stale art', () => {
    const { host, portrait, requests } = fixture();
    portrait.sync('luigi');
    requests[0].failed();
    expect(portrait.sprite.visible).toBe(false);
    expect(host.dataset.companion).toBe('luigi');
    expect(host.dataset.companionReady).toBe('error');
  });

  it('stays still with reduced motion and disposes its current texture safely', () => {
    const { portrait, requests } = fixture();
    portrait.sync('lola');
    requests[0].loaded({} as HTMLImageElement);
    const texture = portrait.sprite.material.map!;
    const dispose = vi.spyOn(texture, 'dispose');
    const disposeMaterial = vi.spyOn(portrait.sprite.material, 'dispose');
    portrait.animate(100, true);
    expect(portrait.sprite.position.y).toBe(portrait.baseY);
    portrait.dispose();
    expect(dispose).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    requests[0].failed();
    expect(portrait.sprite.visible).toBe(false);
  });
});
