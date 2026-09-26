import type { UpgradeId } from '../game/catalog';
import type { GameState } from '../game/engine';
import { NOTE_SIZE, TREE_PINS, upgradeTooltip } from './upgrade-tree';

/** Owns one rendered board, including its tooltip outside the scroll clip. */
export function mountUpgradeBoard(host: HTMLElement, game: () => GameState): () => void {
  const viewport = host.querySelector<HTMLElement>('.tree-scroll')!;
  const lifetime = new AbortController(), options = { signal: lifetime.signal };
  const tooltip = document.createElement('div');
  tooltip.id = 'upgrade-tooltip'; tooltip.className = 'tree-tooltip';
  tooltip.setAttribute('role', 'tooltip'); tooltip.hidden = true; document.body.append(tooltip);
  let activeNote: HTMLButtonElement | null = null;
  let suppressClick = false;
  let suppressHover = false;
  let tapTimer = 0;
  let drag: { id: number; x: number; y: number; left: number; top: number; moved: boolean; note: HTMLButtonElement | null } | null = null;
  const noteAt = (target: EventTarget | null) => target instanceof Element ? target.closest<HTMLButtonElement>('.sticky-note') : null;
  const center = (id: UpgradeId) => {
    const [x, y] = TREE_PINS[id];
    viewport.scrollLeft = x - viewport.clientWidth / 2;
    viewport.scrollTop = y + NOTE_SIZE / 2 - viewport.clientHeight / 2;
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
    suppressClick = suppressHover = false; center(note.dataset.id as UpgradeId); show(note);
  }, options);
  viewport.addEventListener('focusout', hide, options);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); }, options);
  document.addEventListener('scroll', position, { ...options, capture: true });
  window.addEventListener('resize', position, options);
  window.addEventListener('blur', () => { clearTimeout(tapTimer); if (drag) finish({ pointerId: drag.id } as PointerEvent, true); hide(); }, options);
  host.querySelectorAll<HTMLButtonElement>('[data-pan]').forEach(button => button.addEventListener('click', () => {
    hide();
    switch (button.dataset.pan) {
      case 'home': center('hold'); break;
      case 'left': viewport.scrollLeft -= 180; break;
      case 'right': viewport.scrollLeft += 180; break;
      case 'up': viewport.scrollTop -= 180; break;
      case 'down': viewport.scrollTop += 180; break;
    }
  }, options));
  const dispose = () => {
    lifetime.abort(); clearTimeout(tapTimer);
    if (drag && viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id);
    drag = null; viewport.classList.remove('is-dragging'); tooltip.remove();
  };
  window.addEventListener('pagehide', dispose, { ...options, once: true });
  center('hold');
  return dispose;
}
