# ETH DRAGON CODE — canonical inverse glyph language

This is an executable **authored source language**, not an image prompt and not Python code. Its current source file is \`docs/genesis.dragon\`. The UTF-8 source is parsed without rewriting its punctuation. \`docs/eth-dragon-language.js\` is a separate browser interpreter only.

## Inverse operator alphabet

| Operator | Canonical bytes | Prior conventional orientation | Language role |
| --- | --- | --- | --- |
| ROUND | \`)(\` | \`()\` | Inverse source boundary |
| CURLY | \`{\` | \`}{\` and \`{}\` | Open field, no automatic closing brace |
| SQUARE | \`][\` | \`[]\` | Reciprocal gate |
| ANGLE | \`><\` | \`<>\` | Currents meeting |
| DOWN | \`\/\` | Not a legacy pair | Divergence |
| UP | \`/\` | Not a legacy pair | Convergence |
| GUILLEMETS | \`»«\` | \`«»\` | Reflection |
| QUESTION | \`DRAGON_Q_LEFT\` (U+2E2E) | \`?\` and \`¿\` | Mirror horizontally; LEFT |
| EXCLAMATION | \`DRAGON_BANG_LEFT\` (U+2E61) | \`!\` and \`¡\` | Mirrored asymmetric inverted-wiggly vector; LEFT |

**Critical:** DOWN is a backslash followed by a forward slash. UP is a forward slash followed by a backslash. See the exact bytes in the machine-readable source and tests; Markdown renderers can obscure their escapes.

The explanatory *roles* are provisional interpreter semantics, not a claim that the author supplied each dictionary definition. No symbolic glyph is measured physical energy. Their precise spelling is the binding design requirement.

## Accepted source form

A program is a sequence of comments or UTF-8 records: \`FIELD )( EXPRESSION\`. Fields are uppercase Latin names, spaces and underscores; the current compiler accepts one record per field. A line's first \`)(\` is the structural separator. All later glyphs in the expression are preserved in their original order. The source format rejects conventional paired forms in active records. It never attempts a global text search/replace on legacy software files.

The four operations are:

1. \`parseSource\` — validate source, extract fields and tokenize every expression.
2. \`glyphTokens\` — recognize each inverse operator as its own token, including diagonal directional pairs, plus Unicode glyphs and emoji.
3. \`compile\` — return an instruction stream containing ordered glyph and operator sequences.
4. \`emit\` — round-trip to the **exact source bytes**, including comments and spacing.

The browser runner reads \`genesis.dragon\` and hands the parsed geometry declarations to its existing hyperbolic Fermi geodesic renderer. The physical screen is a viewport of the curved-space model, not a claim that flat browser pixels are themselves a curved surface.

## Migration and preservation

The old sample images, repository commits and program syntax remain in history. Preserve them rather than corrupting their signatures. Do not convert all unrelated API, filesystem, browser and cryptographic code by blind character substitution. A future ETH Dragon-native runtime may reduce or replace those adapters once tested; the current browser adapter is separate.

### Validation gates

- The source contains only the author's declared forms for all nine operations.
- An authored source record containing old \`()\`, \`{}\`, \`[]\`, \`<>\`, \`«»\`, \`?\` or \`!\` fails to parse.
- Compilation and re-emission return an identical source string.
- Mobile rendering produces two geodesic current groups, with Gaussian curvature \`−κ\`, no crossbars and triangle symbols 🔺🔻 only.
- No change to GitHub Pages \`main\` until the review branch passes tests and the visual work is approved.

## Explicit glyph orientation setup

The earlier inverted punctuation `¿ ¡` was **not** a directional setup. ETH Dragon now defines the source declarations:

```text
QUESTION )( DRAGON_Q_LEFT
QUESTION_SETUP )( MIRROR_HORIZONTAL
QUESTION_FACING )( LEFT
EXCLAMATION )( DRAGON_BANG_LEFT
EXCLAMATION_SETUP )( MIRROR_HORIZONTAL
EXCLAMATION_FACING )( LEFT
```

The parser rejects the prior punctuation forms in authored source. Unicode reversed punctuation (code points U+2E2E and U+2E61) rendered as boxed missing-glyph placeholders on iPhone, so the active authored language uses the font-independent `DRAGON_Q_LEFT` and `DRAGON_BANG_LEFT` operators instead. The latter would still appear without clear horizontal direction if shown as a straight exclamation, so the mobile renderer draws **asymmetric curved punctuation under an explicit horizontal mirror transform** without relying on platform font support. Both reversed vector samples appear above the field in the preview. Mobile tests check their painted pixels and orientation tags.

Changing the glyph orientation requires changing the source `_SETUP` semantics and vector rendering together. Historical assets remain unmodified.

### Unframed display rule

The source carries named commands because the two rare Unicode characters rendered as a boxed question mark in the owner's screenshot. The renderer paints free-standing left-facing strokes directly onto a transparent canvas, with **no enclosing rectangle, border, glyph fallback square, card, or filled background**. Those commands compile to native vector operations; their names are not captions drawn into the generated field.

## Exact open brace correction

The author corrected the opening sequence to `)( {`. `{` is a standalone operator, and the ETH Dragon parser must never complete it with `}`. The old `}{` and conventional `{}` forms are rejected in new active records, while historical source remains preserved. The composite `COMPOSITE )( {][` intentionally keeps `{` immediately before `][`.
