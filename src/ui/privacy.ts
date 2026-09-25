import english from './privacy-en.html?raw';
import spanish from './privacy-es.html?raw';
import type { Language } from './localization';

// Bundled policy stays available offline. Keep both snapshots aligned with the institutional page.
export function privacyContent(language: Language): string {
  return `<section lang="${language}">${language === 'es' ? spanish : english}</section>`;
}
