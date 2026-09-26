import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { ACHIEVEMENTS, markAchievementRead, unreadAchievementCount } from '../src/game/achievements';
import { achievementStory } from '../src/game/achievement-stories';
import { createGame, tap } from '../src/game/engine';
import { prestige } from '../src/game/progression';
import { decode, encode } from '../src/game/storage';

describe('unread achievement stories', () => {
  it('has a distinct nonempty story in both languages for every patch', () => {
    for (const language of ['en', 'es'] as const) {
      const stories = ACHIEVEMENTS.map(item => achievementStory(item.id, language));
      expect(stories.every(story => story.trim().length > 15)).toBe(true);
      expect(stories.every(story => story.length >= 180 && story.length <= 420)).toBe(true);
      expect(new Set(stories).size).toBe(ACHIEVEMENTS.length);
    }
  });
  it('marks only unlocked patches, once each, and retains read status through a restart', () => {
    const game = createGame();
    expect(markAchievementRead(game, 'first-thread')).toBe(false);
    expect(markAchievementRead(game, 'unknown')).toBe(false);
    tap(game, 0);
    expect(unreadAchievementCount(game)).toBe(1);
    expect(markAchievementRead(game, 'first-thread')).toBe(true);
    expect(markAchievementRead(game, 'first-thread')).toBe(false);
    expect(unreadAchievementCount(game)).toBe(0);
    game.yarn = game.runEarned = game.lifetime = new Decimal(100000);
    expect(prestige(game)).toBe(true);
    const restored = decode(encode(game));
    expect(restored.readAchievements).toEqual(['first-thread']);
    expect(restored.achievements).toContain('fresh-start');
    expect(unreadAchievementCount(restored)).toBe(restored.achievements.length - 1);
  });
});
