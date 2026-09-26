import { describe, expect, it } from 'vitest';
import { anchorZoom, clampZoom, fitZoom, ZOOM_LIMITS } from '../src/ui/upgrade-zoom';

describe('upgrade board zoom math', () => {
  it('clamps the supported overview and readable ranges', () => {
    expect(clampZoom(0)).toBe(ZOOM_LIMITS.min);
    expect(clampZoom(3)).toBe(ZOOM_LIMITS.max);
    expect(clampZoom(1)).toBe(1);
  });

  it('keeps the canvas point beneath the pointer stable while zooming', () => {
    expect(anchorZoom({ scrollLeft: 300, scrollTop: 120, pointerX: 200, pointerY: 150, from: 1, to: 1.5 }))
      .toEqual({ left: 550, top: 255 });
  });

  it('fits the whole canvas inside the available viewport with padding', () => {
    expect(fitZoom({ canvasWidth: 1800, canvasHeight: 1400, viewportWidth: 360, viewportHeight: 300, padding: 16 }))
      .toBeCloseTo(328 / 1800);
    expect(fitZoom({ canvasWidth: 1800, canvasHeight: 1400, viewportWidth: 4000, viewportHeight: 4000, padding: 16 }))
      .toBe(ZOOM_LIMITS.max);
  });
});
