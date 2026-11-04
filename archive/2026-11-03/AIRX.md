# AirX / BINAIUI Air Exchanger

## Recovered design lineage

- **BINAIUI_air_exchanger.pdf:** original October 13, 2026, engineering design study, REV A, 11 pages.
- **Air_exchanger_2022.pdf:** 8-page illustrative 2022-era reference with a forced-draft fan, finned tubes and plug headers.
- **BINAIUI_Exchanger_REV_B.step:** later 3D CAD model found in the owner's file library.
- **BINAIUI_3D_Viewer.html:** companion 3D viewer in the owner's file library.

These named source files remain in the owner's file library; none is falsely represented as embedded in this GitHub patch.

## Concept comparison

| Parameter | BINAIUI REV A | 2022 reference |
| --- | --- | --- |
| Nominal study duty | 20 kW total | 20 kW total |
| Architecture | Eight radial cassettes, common liquid manifolds | One finned-tube bundle |
| Fan scheme | Local induced-draft per cassette | Forced-draft below bundle |
| Nominal duty per cassette | 2.5 kW | Not applicable |
| Assumed fan power | 881 W total | 881 W at shared assumed operating point |
| Assumed liquid flow | 19.14 L/min | Shared baseline conditions |
| Assumed air flow | 3.52 cubic meters per second | Shared baseline conditions |
| Heat recovery | Optional series plate exchanger and bypass | Not illustrated |

All values are **study inputs**, not independently measured performance. The pure calculation in [airx.py](../../binaiui/airx.py) reproduces the nominal eight-way duty split; it is not a CFD or sizing program.

## New material and form studies

- **Nacre / abalone:** reflective layered finish and microstructured inspiration. Test erosion, contaminants, adhesion, temperature cycling and cleanability before considering air-contact surfaces. No air-healing claim.
- **Nautilus-style spirals:** inspect branching/spiral flow channels; calculate pressure losses and avoid assuming an exact golden ratio.
- **Coral-like porous chambers:** investigate surface geometry, accessible cleaning and pressure drop.
- **Aerogel:** possible protected insulation, subject to product and exposure ratings.
- **Meteorite / nickel-iron textures:** visual material language; not an approved pressure-boundary alloy.
- **Crystalline fans, neon conduits, opalescent currents, ruby–gold accents:** visual motifs whose physical implementation would require an independent engineering design.

Evaluation needs fluid compatibility, design pressure, actual UA, fan curves, noise, electrical protection, thermal cycling, fouling, condensation, maintenance and site-weather inputs. Compare identical conditions when benchmarking any 2022-era system. No novelty, certified rating, fabrication readiness or physical health benefit is asserted.
