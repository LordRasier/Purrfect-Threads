import type { UpgradeId } from '../game/catalog';
import type { GameState } from '../game/engine';
import { NOTE_SIZE, TREE_PINS, TREE_SIZE, upgradeTooltip } from './upgrade-tree';
import { anchorZoom, clampZoom, fitZoom } from './upgrade-zoom';

/** Owns one rendered board, including its tooltip outside the scroll clip. */
export function mountUpgradeBoard(host: HTMLElement, game: () => GameState): () => void {
  const viewport = host.querySelector<HTMLElement>('.tree-scroll')!;
  const surface = host.querySelector<HTMLElement>('.tree-zoom-surface')!;
  const canvas = host.querySelector<HTMLElement>('.upgrade-tree')!;
  const zoomOutput = host.querySelector<HTMLOutputElement>('[data-zoom-level]')!;
  const lifetime = new AbortController(), options = { signal: lifetime.signal };
  const tooltip = document.createElement('div');
  tooltip.id = 'upgrade-tooltip'; tooltip.className = 'tree-tooltip';
  tooltip.setAttribute('role', 'tooltip'); tooltip.hidden = true; document.body.append(tooltip);
  let activeNote: HTMLButtonElement | null = null;
  let suppressClick = false;
  let suppressHover = false;
  let tapTimer = 0;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let fitted = false;
  let drag: { id: number; x: number; y: number; left: number; top: number; moved: boolean; note: HTMLButtonElement | null } | null = null;
  const noteAt = (target: EventTarget | null) => target instanceof Element ? target.closest<HTMLButtonElement>('.sticky-note') : null;
  const applyZoom = (next: number, clientX = viewport.clientWidth / 2, clientY = viewport.clientHeight / 2) => {
    const to = clampZoom(next);
    const scaledWidth = TREE_SIZE.width * to, scaledHeight = TREE_SIZE.height * to;
    const nextOffsetX = Math.max(0, (viewport.clientWidth - scaledWidth) / 2);
    const nextOffsetY = Math.max(0, (viewport.clientHeight - scaledHeight) / 2);
    const anchored = anchorZoom({ scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop, pointerX: clientX, pointerY: clientY, from: zoom, to, fromOffsetX: offsetX, fromOffsetY: offsetY, toOffsetX: nextOffsetX, toOffsetY: nextOffsetY });
    zoom = to;
    offsetX = nextOffsetX; offsetY = nextOffsetY;
    surface.style.width = `${Math.max(scaledWidth, viewport.clientWidth)}px`; surface.style.height = `${Math.max(scaledHeight, viewport.clientHeight)}px`;
    canvas.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${zoom})`;
    zoomOutput.value = `${Math.round(zoom * 100)}%`; zoomOutput.textContent = zoomOutput.value;
    viewport.scrollLeft = anchored.left; viewport.scrollTop = anchored.top;
    position();
  };
  const center = (id: UpgradeId) => {
    const [x, y] = TREE_PINS[id];
    viewport.scrollLeft = offsetX + x * zoom - viewport.clientWidth / 2;
    viewport.scrollTop = offsetY + (y + NOTE_SIZE / 2) * zoom - viewport.clientHeight / 2;
  };
  const fit = (reveal = false) => {
    fitted = true;
    applyZoom(fitZoom({ canvasWidth: TREE_SIZE.width, canvasHeight: TREE_SIZE.height, viewportWidth: viewport.clientWidth, viewportHeight: viewport.clientHeight, padding: 16 }));
    if (reveal) viewport.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  const hide = () => {
    activeNote?.setAttribute('aria-describedby', `upgrade-state-${activeNote.dataset.id}`);
    activeNote = null; tooltip.hidden = true;
  };
  const position = () => {
    if (!activeNote || tooltip.hidden) return;
    const rect = activeNote.getBoundingClientRect(), board = viewport.getBoundingClientRect();
    if (rect.right < board.left || rect.left > board.right || rect.bottom < Math.max(0, board.top) || rect.top > Math.min(innerHeight, board.bottom)) { hide(); return; }
    const bounds = tooltip.getBoundingClientRect();
    const above = rect.top - bounds.height - 12;
    const top = above >= 8 ? above : rect.bottom + 12;
    tooltip.style.left = `${Math.max(8, Math.min(innerWidth - bounds.width - 8, rect.x + rect.width / 2 - bounds.width / 2))}px`;
    tooltip.style.top = `${Math.max(8, Math.min(innerHeight - bounds.height - 8, top))}px`;
  };
  const show = (note: HTMLButtonElement) => {
    if (drag || suppressHover) return;
    hide();
    activeNote = note; tooltip.innerHTML = upgradeTooltip(game(), note.dataset.id as UpgradeId);
    note.setAttribute('aria-describedby', `upgrade-state-${note.dataset.id} upgrade-tooltip`);
    tooltip.hidden = false; position();
  };
  const finish = (event: PointerEvent, canceled = false) => {
    if (!drag || drag.id !== event.pointerId) return;
    const tapped = !canceled && !drag.moved && event.pointerType === 'touch' && drag.note;
    suppressClick = drag.moved || canceled;
    suppressHover = suppressClick;
    drag = null; viewport.classList.remove('is-dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    // Custom touch panning can suppress compatibility clicks. Activate an
    // unmoved tap directly, then discard any native click for the same gesture.
    if (tapped && noteAt(document.elementFromPoint(event.clientX, event.clientY)) === tapped) {
      suppressClick = true;
      // Let this touch's native event sequence finish before opening a modal.
      tapTimer = window.setTimeout(() => {
        if (lifetime.signal.aborted) return;
        tapped.focus({ preventScroll: true }); suppressClick = true; tapped.click();
      }, 0);
    }
  };
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || drag) return;
    clearTimeout(tapTimer);
    if (event.pointerType === 'touch') event.preventDefault();
    suppressClick = suppressHover = false; hide();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false, note: noteAt(event.target) };
  }, options);
  viewport.addEventListener('pointermove', event => {
    if (!drag && event.buttons === 0 && event.pointerType !== 'touch') {
      suppressHover = false;
      const note = noteAt(event.target); if (note) show(note);
    }
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 7) return;
    if (!drag.moved) { drag.moved = true; viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging'); }
    event.preventDefault(); hide();
    viewport.scrollLeft = drag.left - dx; viewport.scrollTop = drag.top - dy;
  }, options);
  viewport.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey || event.deltaY === 0 || drag) return;
    event.preventDefault();
    const board = viewport.getBoundingClientRect();
    fitted = false;
    applyZoom(zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1), event.clientX - board.left, event.clientY - board.top);
  }, { ...options, passive: false });
  // Also end sub-threshold gestures released outside the uncaptured viewport.
  window.addEventListener('pointerup', event => finish(event), options);
  window.addEventListener('pointercancel', event => finish(event, true), options);
  viewport.addEventListener('lostpointercapture', event => finish(event, true), options);
  // Capture before the root's delegated button handler can open a detail dialog.
  viewport.addEventListener('click', event => {
    hide();
    if (suppressClick && event.detail !== 0) { event.preventDefault(); event.stopImmediatePropagation(); suppressClick = false; }
  }, { ...options, capture: true });
  viewport.addEventListener('pointerover', event => { const note = noteAt(event.target); if (note && event.pointerType !== 'touch') show(note); }, options);
  viewport.addEventListener('pointerout', event => {
    const note = noteAt(event.target);
    if (note && !note.contains(event.relatedTarget as Node | null) && document.activeElement !== note) hide();
  }, options);
  viewport.addEventListener('focusin', event => {
    const note = noteAt(event.target); if (!note || drag) return;
    suppressClick = suppressHover = false;
    if (zoom < 1) { fitted = false; applyZoom(1); }
    center(note.dataset.id as UpgradeId); show(note);
  }, options);
  viewport.addEventListener('focusout', hide, options);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); }, options);
  document.addEventListener('scroll', position, { ...options, capture: true });
  window.addEventListener('resize', position, options);
  window.addEventListener('blur', () => { clearTimeout(tapTimer); if (drag) finish({ pointerId: drag.id } as PointerEvent, true); hide(); }, options);
  host.querySelectorAll<HTMLButtonElement>('[data-pan]').forEach(button => button.addEventListener('click', () => {
    hide();
    switch (button.dataset.pan) {
      case 'home': fitted = false; applyZoom(1); center('hold'); break;
      case 'left': viewport.scrollLeft -= 180; break;
      case 'right': viewport.scrollLeft += 180; break;
      case 'up': viewport.scrollTop -= 180; break;
      case 'down': viewport.scrollTop += 180; break;
    }
  }, options));
  host.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    hide();
    if (button.dataset.zoom === 'fit') { fit(true); return; }
    fitted = false; applyZoom(zoom * (button.dataset.zoom === 'in' ? 1.1 : 1 / 1.1));
  }, options));
  const resizeObserver = new ResizeObserver(() => { if (fitted) fit(); else applyZoom(zoom); });
  resizeObserver.observe(viewport);
  const dispose = () => {
    lifetime.abort(); resizeObserver.disconnect(); clearTimeout(tapTimer);
    if (drag && viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id);
    drag = null; viewport.classList.remove('is-dragging'); tooltip.remove();
  };
  window.addEventListener('pagehide', dispose, { ...options, once: true });
  applyZoom(1); center('hold');
  return dispose;
}
