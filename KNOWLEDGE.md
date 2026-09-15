# KNOWLEDGE

BINAIUI knowledge is allowed to begin with a feeling, idea, pattern, image, equation, question, measurement, or anomaly. What turns a claim into reproducible knowledge is the testing loop.

## Core loop

```text
observe → measure → encode → hash → reproduce → falsify
```

### Observe
Record what happened before explaining it.

### Measure
When a claim is measurable, record units, device or instrument, method, conditions, timestamp, and uncertainty where possible.

### Encode
Convert the observation into a stable representation: text, numbers, image metadata, sensor values, or structured data.

### Hash
Create a digest so later copies can be checked against the original record.

### Reproduce
Run the same method again. Prefer independent reproduction when possible.

### Falsify
State what result would show the claim is wrong, incomplete, or limited.

## Zero Slate

```text
ZERO SLATE
→ no inherited interpretation
→ blind input
→ emergence
→ hash/log output
→ repeat
→ compare
```

Zero Slate is used when prior interpretation may contaminate the next observation.

## Phase 0 prototype

Inputs can include:

```text
timestamp
cpu_temperature
local_seed
bn_signal
```

Process:

```text
collect
→ canonical encode
→ SHA-512
→ modify one input
→ SHA-512 again
→ compare
```

A changed digest proves that the encoded input changed; it does not by itself prove why the underlying event happened. Causal claims require a test designed for causality.

## Claim record

Every empirical claim should be able to carry:

```text
claim
observation
method
measurement
units
conditions
timestamp
raw_data
encoding
hash
reproduction_count
falsifier
status
```

Suggested status values:

```text
OPEN
OBSERVED
MEASURED
REPRODUCED
FALSIFIED
REVISED
```

## Rule

Do not delete the love from knowledge, and do not delete the test from knowledge.
