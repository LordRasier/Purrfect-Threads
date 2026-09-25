/** A small Audio surface so the controller remains testable outside the browser. */
export interface MusicAudio {
  loop: boolean;
  volume: number;
  play(): Promise<void>;
  pause(): void;
}

export const COZY_MUSIC_ASSET_URL = `${import.meta.env.BASE_URL}audio/apple-cider.ogg`;

/**
 * Controls the optional background loop without bypassing browser autoplay policy.
 * Call unlock from a user gesture before expecting playback.
 */
export class CozyMusic {
  private audio?: MusicAudio;
  private volume = 0;
  private visible = true;
  private unlocked = false;
  private disposed = false;
  private isPlaying = false;
  private playInFlight = false;
  private pauseGeneration = 0;

  constructor(private readonly createAudio: () => MusicAudio = () => new Audio(COZY_MUSIC_ASSET_URL)) {}

  unlock(): void {
    if (this.disposed) return;
    this.unlocked = true;
    this.reconcile();
  }

  setVolume(volume: number): void {
    if (this.disposed) return;
    const nextVolume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0;
    if (nextVolume === this.volume) return;
    this.volume = nextVolume;
    if (this.audio) this.audio.volume = this.volume;
    this.reconcile();
  }

  setVisible(visible: boolean): void {
    if (this.disposed || visible === this.visible) return;
    this.visible = visible;
    this.reconcile();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.pauseGeneration += 1;
    this.isPlaying = false;
    this.audio?.pause();
  }

  private shouldPlay(): boolean {
    return this.unlocked && this.visible && this.volume > 0 && !this.disposed;
  }

  private getAudio(): MusicAudio {
    this.audio ??= this.createAudio();
    this.audio.loop = true;
    this.audio.volume = this.volume;
    return this.audio;
  }

  private reconcile(): void {
    if (!this.unlocked || this.disposed) return;
    if (!this.shouldPlay()) {
      this.pauseGeneration += 1;
      this.isPlaying = false;
      this.audio?.pause();
      return;
    }
    if (this.isPlaying || this.playInFlight) return;

    const audio = this.getAudio();
    const pauseGenerationAtStart = this.pauseGeneration;
    this.playInFlight = true;
    try {
      void audio.play().then(
        () => this.onPlayResolved(audio, pauseGenerationAtStart),
        () => {
          this.playInFlight = false;
          this.isPlaying = false;
          // Playback is optional and can be rejected by browser/device policy.
        },
      );
    } catch {
      this.playInFlight = false;
      this.isPlaying = false;
    }
  }

  private onPlayResolved(audio: MusicAudio, pauseGenerationAtStart: number): void {
    this.playInFlight = false;
    if (!this.shouldPlay()) {
      this.isPlaying = false;
      audio.pause();
      return;
    }
    if (pauseGenerationAtStart !== this.pauseGeneration) {
      this.isPlaying = false;
      this.reconcile();
      return;
    }
    this.isPlaying = true;
  }
}
