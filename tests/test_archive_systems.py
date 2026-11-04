from binaiui.carrier_node import evaluate, COLLAPSE
from binaiui.airx import AirXStudy


def test_seed_rejects_without_consent():
    response = evaluate("listen", consent=False)
    assert response["state"] == "UNDIFFERENTIATED"
    assert response["message"] == COLLAPSE
    assert not any(response[k] for k in ("writes", "transmits", "retains"))


def test_seed_refusal_has_no_side_effects():
    response = evaluate("refuse", consent=True)
    assert response["state"] == "UNDIFFERENTIATED"


def test_seed_listen_still_has_no_side_effects():
    response = evaluate("listen", consent=True)
    assert response["state"] == "LISTENING"
    assert not any(response[k] for k in ("writes", "transmits", "retains"))


def test_airx_nominal_split():
    s = AirXStudy().summary()
    assert s["cassettes"] == 8
    assert s["nominal_duty_per_cassette_kw"] == 2.5
    assert not s["verified"]


def test_airx_bad_inputs():
    try:
        AirXStudy(cassettes=0).summary()
    except ValueError:
        pass
    else:
        raise AssertionError("must reject invalid cassette count")
