# Ten new full-resolution sources and new runnable systems

The user supplied ten **separate original JPEGs**, distinct from the screenshot-grid previews already cataloged in `manifest.json`. These filenames, dimensions and system mappings are documented in [full-resolution-references.json](full-resolution-references.json). The art files remain in a verified **10.5 MB downloadable offline ZIP delivered separately in the chat**. They are **not embedded as GitHub blobs** in this PR; no false claim of successful image upload is made.

## Source → software

| Reference | Implemented module | Intent |
|---|---|---|
| GENESIS-01 | `binaiui/genesis_field.py` | Reproducible generative SVG filaments and glyph structures |
| AIRX-01 through AIRX-06 | `binaiui/airx_network.py` | Six conceptual heat-exchanger topologies, capacity sharing and module derating |
| AirX material surfaces | `binaiui/materials.py` | Materials dictionary and mandatory suitability review |
| MESH-01 | `binaiui/mesh.py` | Consent-first five-zone symbolic network |
| CARRIER-01 | `binaiui/carrier_node.py`, `binaiui/carrier_api.py`, `binaiui/carrier_client.py`, `tools/generate_client.py` | Inert listener plus **separate opt-in** localhost-only in-memory CRUD demonstration and Python client generator |
| UNKEY-01 | `binaiui/unkey.py` | Deterministic repeatable glyph evolution with refusal gate |

## Original additions

- Stable graph digest for deterministic cross-run comparison.
- Explicit refusal before mesh connection and UNKEY transformations.
- Module-offline simulations for profile sensitivity; illustrative only.
- Symbolic SVG field output directly from pure Python; no remote images required.
- Client generator from the declared `carrier_spec.json`; its output never calls a remote service without explicit execution.
- GitHub Actions Python test workflow with source compilation verification.

## Scope and testing

This is original software exploring visual ideas. Frequencies such as `0000 Hz` are project names, not measured emissions; crystals and nacre are palette and exploratory material selections, not verified air-treatment technologies. Thermal numbers are inherited nominal **study assumptions**, not real performance data. The HTTP demo runs only when a developer explicitly starts it; it binds only `127.0.0.1`; writes are disabled unless `--enable-writes` is set.

**The earlier documentation said the companion ZIP existed before it did. That statement was premature.** It has now been created and checked locally, separately from the GitHub pull request.
