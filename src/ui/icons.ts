const paths: Record<string, string> = {
  cat: '<path d="M5 11V4l5 4h4l5-4v7c3 9-2 11-7 11S2 20 5 11Z"/><path d="M8 14v1m8-1v1m-6 3 2 1 2-1"/>',
  yarn: '<circle cx="12" cy="11" r="8"/><path d="M6 5c0 7 5 12 11 12M4 10c5-1 10-1 15 3M8 4c1 7 4 10 11 11M8 18c3-4 6-6 11-7m-7 8c0 4 7 0 9 3"/>',
  paw: '<ellipse cx="12" cy="16" rx="5" ry="4"/><ellipse cx="5" cy="10" rx="2" ry="2.5"/><ellipse cx="10" cy="6" rx="2" ry="2.5"/><ellipse cx="16" cy="7" rx="2" ry="2.5"/><ellipse cx="20" cy="12" rx="1.6" ry="2"/>',
  basket: '<path d="m3 10 3 10h12l3-10H3Zm4 0 5-7 5 7M8 13l1 4m7-4-1 4m-3-4v4"/>',
  knit: '<path d="m5 3 14 18M19 3 5 21M3 9h18M5 14h14"/><circle cx="6" cy="3" r="1"/><circle cx="18" cy="3" r="1"/>',
  house: '<path d="m2 11 10-8 10 8M5 9v12h14V9M10 21v-7h4v7"/>',
  cloud: '<path d="M7 19a5 5 0 0 1-1-10 6 6 0 0 1 12-1 5.5 5.5 0 0 1 0 11H7Z"/><path d="M9 14h6m-4-3h2"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
  heart: '<path d="M12 21S2 15 2 8c0-6 8-7 10-1 2-6 10-5 10 1 0 7-10 13-10 13Z"/>',
  settings: '<path d="m9 3-1 3-3 1-2 4 2 3v4l4 3 3-1 3 1 4-3v-4l2-3-2-4-3-1-1-3H9Z"/><circle cx="12" cy="12" r="3"/>',
  sound: '<path d="M3 9h4l5-5v16l-5-5H3V9Zm13-1c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
  muted: '<path d="M3 9h4l5-5v16l-5-5H3V9Zm13 0 6 6m0-6-6 6"/>',
  leaf: '<path d="M20 3C4 0 1 10 7 16s16 3 13-13ZM4 21l11-11"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
};
export function icon(name: string, className = ''): string {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.paw}</svg>`;
}
