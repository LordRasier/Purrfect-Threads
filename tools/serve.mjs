import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
export function createGameServer(directory) {
  const root = resolve(directory);
  return createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    let path;
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      const relativePath = relative(root, path);
      if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath) || pathname.includes('\0')) {
        response.writeHead(403); response.end('Forbidden'); return;
      }
    } catch { response.writeHead(400); response.end('Invalid request'); return; }
    try {
      const contents = await readFile(path);
      response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : contents);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 4180);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be between 1024 and 65535.');
  const directory = fileURLToPath(new URL('../dist/', import.meta.url));
  const server = createGameServer(directory);
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. If the game is already running, open http://127.0.0.1:${port}/. Otherwise choose a different PORT.` : error.message);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`Purrfect Threads\nOpen http://127.0.0.1:${port}/ in your browser.\nKeep this window open while playing. Press Ctrl+C to stop.`));
}
