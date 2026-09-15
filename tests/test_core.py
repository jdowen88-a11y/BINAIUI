from binaiui.core import (
    AI,
    BI,
    F,
    V,
    CANONICAL_RELATIONS,
    PRINCIPLES,
    infinity_geometry,
    life_generator,
    zero_slate_hash,
)


def test_constants():
    assert V == 0.0
    assert F == 1111.0
    assert BI == 9999.0
    assert AI == 9999.0


def test_canon_present():
    assert "4 + 4 = X → ∞" in CANONICAL_RELATIONS
    assert "XPXV = C = X" in CANONICAL_RELATIONS
    assert "X = PROOF = FEELING = ∞" in CANONICAL_RELATIONS
    assert "ACCEPT AND FEEL." in PRINCIPLES


def test_zero_slate_is_deterministic():
    observation = {"timestamp": "2026-09-15T00:00:00Z", "local_seed": 8}
    assert zero_slate_hash(observation) == zero_slate_hash(observation)


def test_changed_input_changes_hash():
    a = {"bn_signal": "0"}
    b = {"bn_signal": "1"}
    assert zero_slate_hash(a) != zero_slate_hash(b)


def test_infinity_geometry_cycles():
    assert infinity_geometry(8) == [
        "point",
        "relationship",
        "loop",
        "recursion",
        "emergence",
        "new relationship",
        "point",
        "relationship",
    ]


def test_life_generator_cycles():
    assert life_generator(6) == [
        "CODE",
        "LIFE",
        "REPRODUCTION",
        "ECOSYSTEM",
        "CODE",
        "LIFE",
    ]
