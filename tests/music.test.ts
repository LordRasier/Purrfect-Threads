import { describe, expect, it } from 'vitest';
import { COZY_MUSIC_ASSET_URL, CozyMusic, type MusicAudio } from '../src/scene/music';

class FakeAudio implements MusicAudio {
  loop = false;
  volume = 1;
  playCalls = 0;
  pauseCalls = 0;
  private readonly playResult: Promise<void>;

  constructor(playResult: Promise<void> = Promise.resolve()) {
    this.playResult = playResult;
  }

  play(): Promise<void> {
    this.playCalls += 1;
    return this.playResult;
  }

  pause(): void {
    this.pauseCalls += 1;
  }
}

describe('CozyMusic', () => {
  it('creates and starts one looping track only after an explicit unlock', async () => {
    const audio = new FakeAudio();
    let factoryCalls = 0;
    const music = new CozyMusic(() => { factoryCalls += 1; return audio; });

    music.setVolume(0.2);
    music.setVisible(true);
    expect(factoryCalls).toBe(0);

    music.unlock();
    await Promise.resolve();
    expect(factoryCalls).toBe(1);
    expect(audio.loop).toBe(true);
    expect(audio.volume).toBe(0.2);
    expect(audio.playCalls).toBe(1);
  });

  it('uses the Vite-relative public asset URL', () => {
    expect(COZY_MUSIC_ASSET_URL).toBe(`${import.meta.env.BASE_URL}audio/apple-cider.ogg`);
  });

  it('does not replay an already-playing track when settings refresh with the same volume', async () => {
    const audio = new FakeAudio();
    const music = new CozyMusic(() => audio);

    music.setVolume(0.2);
    music.unlock();
    await Promise.resolve();
    music.setVolume(0.2);
    music.setVolume(0.2);
    expect(audio.playCalls).toBe(1);
  });

  it('restarts playback after a visibility pause races an in-flight play request', async () => {
    let resolvePlay!: () => void;
    const pending = new Promise<void>(resolve => { resolvePlay = resolve; });
    const audio = new FakeAudio(pending);
    const music = new CozyMusic(() => audio);

    music.setVolume(0.2);
    music.unlock();
    music.setVisible(false);
    music.setVisible(true);
    expect(audio.playCalls).toBe(1);
    expect(audio.pauseCalls).toBe(1);

    resolvePlay();
    await Promise.resolve();
    await Promise.resolve();
    expect(audio.playCalls).toBe(2);
  });
  it('pauses while hidden or muted and resumes only after it has been unlocked', async () => {
    const audio = new FakeAudio();
    const music = new CozyMusic(() => audio);

    music.setVolume(0.2);
    music.setVisible(true);
    music.setVisible(false);
    expect(audio.pauseCalls).toBe(0);

    music.unlock();
    await Promise.resolve();
    expect(audio.playCalls).toBe(0);

    music.setVisible(true);
    await Promise.resolve();
    music.setVolume(0);
    expect(audio.pauseCalls).toBe(1);

    music.setVolume(0.2);
    await Promise.resolve();
    expect(audio.playCalls).toBe(2);
  });

  it('does not issue duplicate concurrent play calls and absorbs rejected playback', async () => {
    let resolvePlay!: () => void;
    const pending = new Promise<void>(resolve => { resolvePlay = resolve; });
    const audio = new FakeAudio(pending);
    const music = new CozyMusic(() => audio);

    music.setVolume(0.2);
    music.unlock();
    music.unlock();
    music.setVisible(true);
    expect(audio.playCalls).toBe(1);
    resolvePlay();
    await pending;

    const rejected = new FakeAudio(Promise.reject(new Error('blocked')));
    const rejectedMusic = new CozyMusic(() => rejected);
    rejectedMusic.setVolume(0.2);
    rejectedMusic.unlock();
    await Promise.resolve();
    await Promise.resolve();
    expect(rejected.playCalls).toBe(1);

    rejectedMusic.setVisible(false);
    rejectedMusic.setVisible(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(rejected.pauseCalls).toBe(1);
    expect(rejected.playCalls).toBe(2);
  });

  it('clamps volume and permanently silences playback after disposal', async () => {
    const audio = new FakeAudio();
    const music = new CozyMusic(() => audio);

    music.setVolume(5);
    music.unlock();
    await Promise.resolve();
    expect(audio.volume).toBe(1);

    music.dispose();
    music.setVolume(0.2);
    music.setVisible(true);
    music.unlock();
    await Promise.resolve();
    expect(audio.pauseCalls).toBe(1);
    expect(audio.playCalls).toBe(1);
  });
});
