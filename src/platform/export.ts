import { Capacitor, registerPlugin } from '@capacitor/core';

const SaveDocument = registerPlugin<{ save(options: { data: string; name: string }): Promise<{ saved: boolean }> }>('SaveDocument');

export async function exportProgress(data: string, name: string): Promise<boolean> {
  if (Capacitor.getPlatform() === 'android') return (await SaveDocument.save({ data, name })).saved;
  const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  try {
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  } finally { window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
  return true;
}
