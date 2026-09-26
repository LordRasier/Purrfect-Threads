import english from './privacy-en.html?raw';
import spanish from './privacy-es.html?raw';
import type { Language } from './localization';

// Bundled policy stays available offline. Publish matching institutional policy and store declarations before releasing advertising builds.
export function privacyContent(language: Language): string {
  return `<section lang="${language}">${language === 'es' ? spanish : english}</section>`;
}
