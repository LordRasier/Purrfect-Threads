import { Capacitor, registerPlugin } from '@capacitor/core';

export interface AdsStatus {
  platform: 'android' | 'web';
  initialized: boolean;
  canRequestAds: boolean;
  bannerVisible: boolean;
  privacyOptionsRequired: boolean;
  usingTestAds: boolean;
  consentError?: string;
  adError?: string;
}

interface AdMobBannerPlugin {
  initialize(): Promise<AdsStatus>;
  showBanner(): Promise<AdsStatus>;
  hideBanner(): Promise<void>;
  showPrivacyOptions(): Promise<AdsStatus>;
  getStatus(): Promise<AdsStatus>;
}

const AdMobBanner = registerPlugin<AdMobBannerPlugin>('AdMobBanner');

const webStatus = (): AdsStatus => ({
  platform: 'web',
  initialized: false,
  canRequestAds: false,
  bannerVisible: false,
  privacyOptionsRequired: false,
  usingTestAds: true
});

const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

/** Requests current UMP consent information, then initializes and shows the Android banner when allowed. */
export async function initializeAds(): Promise<AdsStatus> {
  return isAndroid() ? AdMobBanner.initialize() : webStatus();
}

export async function showBanner(): Promise<AdsStatus> {
  return isAndroid() ? AdMobBanner.showBanner() : webStatus();
}

export async function hideBanner(): Promise<void> {
  if (isAndroid()) await AdMobBanner.hideBanner();
}

export async function showPrivacyOptions(): Promise<AdsStatus> {
  return isAndroid() ? AdMobBanner.showPrivacyOptions() : webStatus();
}

export async function getAdsStatus(): Promise<AdsStatus> {
  return isAndroid() ? AdMobBanner.getStatus() : webStatus();
}
