# 0 → 9 · OPEN OCEAN MIGRATION

This is an additive, owner-reviewable migration from closed return-cycle drawings to open paths.

**Current creative rule:** 0 originates, the paired streams approach without bonding, deflect, then continue outward as 9. The symbol field uses numeric glyphs and mathematical symbols only. Each point has a strictly larger forward coordinate than the previous point. No backward motion, no sine/cosine, no eight-shaped closed circuit or return-to-source arrow is drawn. This is a field model, not a physical device controller.

## Shared implementation

- \`binaiui/zero_nine_ocean.py\`: deterministic backend coordinates and audit.
- \`docs/zero-nine-ocean.js\`: matching coordinates and actual Canvas drawing.
- \`docs/zero-nine-field.html\`: independent full-screen mobile preview.
- \`docs/genesis-studio.js\`: delegates its active field to the shared renderer.
- \`tests/test_zero_nine_ocean.py\`: parity and open-edge checks.

The original historical materials and unmodified modules remain in Git commit history for preservation. Refactoring the other Python cycles, symbolic canon, original-file importer, repository inventory and related projects is a *separate review stage*; do not claim this first stage has replaced those systems.

No automatic deployment, archive deletion, private-repository change, or live external action is part of this branch.

### Forward-only correction (09.2)

The earlier draft accidentally required a backward step in `curved_release` and used sine and cosine to generate a reversing curl. Both implementations have been replaced. Every sampled path begins at x=0, increases at every step, exits the viewport, and emits an alternating 090909 pattern. Lateral deflection occurs without longitudinal reversal. An injected zero or negative x step fails the integrity test. The independent preview no longer offers a previous button.
