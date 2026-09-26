export class HoldInput {
  private sources = new Set<string>();
  private nextAt = 0;
  constructor(private emit: (scheduledTime: number) => void, private canRepeat: () => boolean = () => true) {}
  press(source: string, now: number): void {
    if (this.sources.has(source)) return;
    if (!this.canRepeat()) {
      const first = !this.sources.size;
      this.sources.add(source);
      if (first) this.emit(now);
      return;
    }
    if (!this.sources.size) this.nextAt = now;
    this.sources.add(source);
    this.flush(now);
  }
  release(source: string, now: number): void {
    this.flush(now);
    this.sources.delete(source);
  }
  flush(now: number): void {
    if (!this.sources.size || !Number.isFinite(now) || !this.canRepeat()) return;
    // Bound recovery after an extreme foreground stall; hidden tabs cancel.
    this.nextAt = Math.max(this.nextAt, now - 199800);
    while (this.nextAt <= now) {
      this.emit(this.nextAt);
      this.nextAt += 200;
    }
  }
  cancel(): void { this.sources.clear(); }
}
