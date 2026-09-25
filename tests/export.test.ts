import { beforeEach, expect, it, vi } from 'vitest';
const native = vi.hoisted(() => ({ platform: 'android', save: vi.fn() }));
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => native.platform }, registerPlugin: () => ({ save: native.save }) }));
import { exportProgress } from '../src/platform/export';
beforeEach(() => { native.platform = 'android'; native.save.mockReset(); });
it('exports through the Android document picker without browser globals', async () => {
  native.save.mockResolvedValue({ saved: true });
  expect(await exportProgress('{"version":4}', 'purrfect-threads-save.json')).toBe(true);
  expect(native.save).toHaveBeenCalledWith({ data: '{"version":4}', name: 'purrfect-threads-save.json' });
});
it('does not treat a cancelled picker as a successful backup', async () => {
  native.save.mockResolvedValue({ saved: false });
  expect(await exportProgress('{}', 'purrfect-threads-recovery.json')).toBe(false);
});
it('propagates write failures so the caller can preserve progress and show an error', async () => {
  native.save.mockRejectedValue(new Error('Unable to save'));
  await expect(exportProgress('{}', 'purrfect-threads-save.json')).rejects.toThrow('Unable to save');
});
