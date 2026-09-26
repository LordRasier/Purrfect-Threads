# Achievement and chapter progression update

The save format is now version 5. Older saves retain progress and treat previously unlocked patches as unread once. An unlocked patch becomes read only when its detail dialog opens; visiting the achievements tab is not enough. The red heart badge displays the remaining count. Each of the 36 patches has a short English and Spanish story.

Upgrade prices use `baseCost * 1.1^completedChapters`, including the displayed quote, affordability check and deducted balance. Chapter zero keeps its original prices. Upgrade effects and reset behavior are unchanged.

## Verification — September 26, 2026

- Focused gameplay, storage and expansion tests: 36 passed.
- Achievement story coverage and read-once/restart persistence tests: 2 passed.
- Browser regression set (`companion-chat`, `unread-achievements`, `tablet`, `privacy`): 18 passed across desktop and mobile, including small-screen/landscape layouts.
- Independent code review found no issues in unread persistence or chapter-cost integration.

Rollback must include the save-version migration, engine/UI cost quotes, unread state, stories and associated tests together. Do not downgrade a version-5 save reader in an already installed build without a migration strategy.
