import {icon} from './icons';
import {translate as tr} from './localization';

/** A per-document welcome screen; game ownership and save recovery stay outside it. */
export function showLaunch(root: HTMLElement, reduced: () => boolean, enter: () => void): void {
  const device = root.querySelector<HTMLElement>('.tablet-device')!;
  const surfaces = [...device.querySelectorAll<HTMLElement>(':scope > .topbar, :scope > .layout')];
  surfaces.forEach(surface => surface.inert = true);
  root.classList.add('is-launching');
  const screen = document.createElement('section');
  screen.id = 'app-intro'; screen.className = 'app-launch'; screen.tabIndex = -1;
  screen.setAttribute('aria-label', 'Purrfect Threads');
  screen.innerHTML = `<div class="launch-logo"><div class="launch-yarn" aria-hidden="true">${icon('yarn')}</div><h1>Purrfect<span>Threads<span class="brand-dot">.</span></span></h1></div><button id="enter-workshop" disabled>${tr('Tap to enter')}</button>`;
  if (reduced()) screen.classList.add('launch-static');
  device.append(screen); screen.focus({preventScroll:true});
  const button = screen.querySelector<HTMLButtonElement>('button')!;
  const ready = window.setTimeout(() => {
    if (!screen.isConnected) return;
    button.disabled = false; screen.classList.add('launch-ready'); button.focus({preventScroll:true});
  }, 2000);
  let entering = false;
  button.addEventListener('click', async () => {
    if (button.disabled || entering) return;
    entering = true; button.disabled = true;
    if (!reduced()) {
      const fade = screen.animate([{opacity:1}, {opacity:0}], {duration:450,easing:'ease-in-out',fill:'forwards'});
      await fade.finished.catch(() => {});
    }
    if (!screen.isConnected) return;
    screen.remove(); surfaces.forEach(surface => surface.inert = false);
    root.classList.remove('is-launching'); enter();
  });
  window.addEventListener('pagehide', () => clearTimeout(ready), {once:true});
}
