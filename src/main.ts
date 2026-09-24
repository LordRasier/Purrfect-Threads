import { createGame, tap, buyProducer, advance, production } from './game/engine';

const game = createGame();
document.querySelector('#app')!.innerHTML = '<h1>Purrfect Threads</h1><p>A little yarn. A lot of cats.</p><output id="yarn">0 yarn</output><p><button id="pull">Pull yarn</button> <button id="buy">Adopt kitten · 15 yarn</button></p>';
const render = () => { document.querySelector('#yarn')!.textContent = `${game.yarn.floor()} yarn · ${production(game)}/s`; };
document.querySelector('#pull')!.addEventListener('click', () => { tap(game, performance.now()); render(); });
document.querySelector('#buy')!.addEventListener('click', () => { buyProducer(game, 'kitten', 1); render(); });
let previous = performance.now();
setInterval(() => { const now = performance.now(); advance(game, (now - previous) / 1000); previous = now; render(); }, 100);
