# Upgrade tree implementation plan

Replace the upgrade grid with an icon-only, draggable red-string board, retaining chapter prices and existing progress. The user-confirmed refinement adds five +1% upgrades for each of ten producers (63 total nodes with the original milestones). No remote, billing, asset, or native package changes.

1. **Progression foundation:** test and add a 25-yarn hold root, single-parent graph, engine purchase gating, and v6 migration. Legacy saves receive only the root, not effectful ancestors; existing owned leaves remain valid. The input root does not count toward Forge of Paws production to preserve legacy output.
2. **Micro progression:** test additive, isolated producer bonuses and increasing prices; exclude input/micro nodes from Forge of Paws. Every tree node resets on prestige; only Olympus talents persist. Retain the v6 migration unchanged.
3. **Playable tree:** test and render small icon-only pinned notes on a computed branching canvas. Pointer/finger dragging uses a threshold and suppresses accidental clicks; focus pans into view. A clamped body-portal tooltip shows name/effect/price/requirements on hover/focus; tapping opens existing details. Dispose capture/listeners/tooltips on navigation and pagehide.
4. **Verification:** run all unit tests/build and focused desktop/mobile browser tests with one worker; inspect screenshots and document migration/controls. These checks prove arithmetic, not economic balance; pacing requires a real playtest.

Risks: legacy counters must not increase; modern reload/chapter reset must not re-grant root; fixed board geometry must scroll internally rather than overflow the document. Tests cover these boundaries. Existing framework and CSS conventions remain unchanged.
