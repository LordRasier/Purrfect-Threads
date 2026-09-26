export const ZOOM_LIMITS = { min: 0.1, max: 2 } as const;

export function clampZoom(zoom: number): number {
  return Math.min(ZOOM_LIMITS.max, Math.max(ZOOM_LIMITS.min, zoom));
}

export function fitZoom({ canvasWidth, canvasHeight, viewportWidth, viewportHeight, padding }: {
  canvasWidth: number; canvasHeight: number; viewportWidth: number; viewportHeight: number; padding: number;
}): number {
  return clampZoom(Math.min((viewportWidth - padding * 2) / canvasWidth, (viewportHeight - padding * 2) / canvasHeight));
}

export function anchorZoom({ scrollLeft, scrollTop, pointerX, pointerY, from, to, fromOffsetX = 0, fromOffsetY = 0, toOffsetX = 0, toOffsetY = 0 }: {
  scrollLeft: number; scrollTop: number; pointerX: number; pointerY: number; from: number; to: number;
  fromOffsetX?: number; fromOffsetY?: number; toOffsetX?: number; toOffsetY?: number;
}): { left: number; top: number } {
  return {
    left: ((scrollLeft + pointerX - fromOffsetX) / from) * to + toOffsetX - pointerX,
    top: ((scrollTop + pointerY - fromOffsetY) / from) * to + toOffsetY - pointerY,
  };
}
