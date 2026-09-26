import { beforeEach, describe, expect, it, vi } from 'vitest';

const native = vi.hoisted(() => ({
  initialize: vi.fn(),
  showBanner: vi.fn(),
  hideBanner: vi.fn(),
  showPrivacyOptions: vi.fn(),
  getStatus: vi.fn()
}));
const getPlatform = vi.hoisted(() => vi.fn());

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform },
  registerPlugin: vi.fn(() => native)
}));

import { hideBanner, initializeAds, showBanner, showPrivacyOptions } from '../src/platform/ads';

describe('Android ads bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPlatform.mockReturnValue('web');
  });

  it('is a strict no-op outside Android', async () => {
    await expect(initializeAds()).resolves.toMatchObject({ platform: 'web', initialized: false, usingTestAds: true });
    await expect(showBanner()).resolves.toMatchObject({ platform: 'web', bannerVisible: false });
    await expect(hideBanner()).resolves.toBeUndefined();
    await expect(showPrivacyOptions()).resolves.toMatchObject({ platform: 'web', privacyOptionsRequired: false });
    expect(native.initialize).not.toHaveBeenCalled();
    expect(native.showBanner).not.toHaveBeenCalled();
    expect(native.hideBanner).not.toHaveBeenCalled();
    expect(native.showPrivacyOptions).not.toHaveBeenCalled();
  });

  it('forwards every operation to the native Android plugin', async () => {
    getPlatform.mockReturnValue('android');
    const status = { platform: 'android', initialized: true, canRequestAds: true, bannerVisible: true, privacyOptionsRequired: true, usingTestAds: true } as const;
    native.initialize.mockResolvedValue(status);
    native.showBanner.mockResolvedValue(status);
    native.hideBanner.mockResolvedValue(undefined);
    native.showPrivacyOptions.mockResolvedValue(status);

    await expect(initializeAds()).resolves.toEqual(status);
    await expect(showBanner()).resolves.toEqual(status);
    await expect(hideBanner()).resolves.toBeUndefined();
    await expect(showPrivacyOptions()).resolves.toEqual(status);
    expect(native.initialize).toHaveBeenCalledOnce();
    expect(native.showBanner).toHaveBeenCalledOnce();
    expect(native.hideBanner).toHaveBeenCalledOnce();
    expect(native.showPrivacyOptions).toHaveBeenCalledOnce();
  });
});
