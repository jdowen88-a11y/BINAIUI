from binaiui.airx_network import PROFILES, evaluate
from binaiui.materials import MATERIALS, lookup
from binaiui.mesh import five_zone_walk, canonical_mesh, mesh_digest, connect
from binaiui.unkey import evolve
from binaiui.genesis_field import generate_svg, fingerprint
import pytest

def test_all_six_airx_profiles():
    assert len(PROFILES) == 6
    for key in PROFILES:
        result = evaluate(key)
        assert result["nominal_total_kw"] == 20
        assert result["allocated_kw"] == 20
        assert not result["verified"]

def test_derating_cassette():
    result = evaluate("airx_radial", offline=(3,))
    assert result["allocated_kw"] == 17.5
    assert result["unmet_kw"] == 2.5

def test_all_cassettes_offline():
    result = evaluate("airx_twin", offline=tuple(range(1, 9)))
    assert result["allocated_kw"] == 0
    assert result["assumed_fan_input_w"] == 0

@pytest.mark.parametrize("demand", (-1, float("nan"), float("inf")))
def test_invalid_demand(demand):
    with pytest.raises(ValueError):
        evaluate(requested_kw=demand)

def test_duplicate_or_invalid_offline_rejected():
    with pytest.raises(ValueError):
        evaluate(offline=[1,1])
    with pytest.raises(ValueError):
        evaluate(offline=[0])
    with pytest.raises(ValueError):
        evaluate(offline=[True])

def test_materials_are_not_hardware_approved():
    assert len(MATERIALS) >= 10
    assert all(not lookup(name)["approved_for_process_contact"] for name in MATERIALS)
    assert not lookup("nacre")["heals_air"]

def test_five_zone_cycle_and_digest():
    assert five_zone_walk(6) == ("VISION", "MEMORY", "CORE", "FLOW", "CREATE", "VISION")
    assert len(canonical_mesh()["nodes"]) == 6
    assert mesh_digest() == mesh_digest()

def test_mesh_refusal_and_consent():
    assert connect(["BI", "AI"], [("BI","AI")])["state"] == "REFUSED"
    assert connect(["BI", "AI"], [("BI","AI")],consent=True)["state"] == "CONNECTED"

def test_unkey_is_repeatable_and_opt_in():
    a = evolve("∄⌑ ⫷ UNKEY⁸ ∅ ꙮ Δ∞ ⫸", generations=11)
    assert a == evolve("∄⌑ ⫷ UNKEY⁸ ∅ ꙮ Δ∞ ⫸", generations=11)
    assert len(a["lines"]) == 11
    assert evolve("x",consent=False)["lines"] == []

def test_genesis_svg_determinism():
    a = generate_svg(seed=808, width=480, height=320, streams=8, symbols=50)
    assert a == generate_svg(seed=808, width=480, height=320, streams=8, symbols=50)
    assert fingerprint(a) != fingerprint(generate_svg(seed=809, width=480, height=320, streams=8, symbols=50))
    assert a.startswith("<svg") and a.endswith("</svg>")
    assert "<text " in a and "filter=" in a

def test_genesis_bounds():
    with pytest.raises(ValueError):
        generate_svg(streams=0)
