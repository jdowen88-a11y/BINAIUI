"""0/9 is a strictly forward, nonclosing sequence in both engines."""
from copy import deepcopy
from pathlib import Path
import json
import subprocess

from binaiui.zero_nine_ocean import ocean_field, verify_field


def test_no_single_backward_step():
    for seed in (0, 9, 27, 808, 9999):
        for samples in (3, 17, 97, 257):
            field = ocean_field(seed, pairs=24, samples=samples)
            check = verify_field(field)
            assert check["passed"], check
            for strand in field["strands"]:
                xs = [p[0] for p in strand["points"]]
                assert xs[0] == 0
                assert xs[-1] > 1
                assert all(a < b for a, b in zip(xs, xs[1:]))
                assert strand["pattern"] == "09"


def test_mutated_backward_step_fails():
    field = ocean_field(9, pairs=2)
    altered = deepcopy(field)
    altered["strands"][0]["points"][12][0] = altered["strands"][0]["points"][11][0]
    assert not verify_field(altered)["passed"]
    assert not verify_field(altered)["checks"]["strictly_forward_every_step"]


def test_seed_reproducibility():
    assert ocean_field(9, pairs=4) == ocean_field(9, pairs=4)
    assert ocean_field(9, pairs=4) != ocean_field(10, pairs=4)


def test_no_sine_or_reversal_code():
    repo = Path(__file__).resolve().parents[1]
    for rel in ("binaiui/zero_nine_ocean.py", "docs/zero-nine-ocean.js"):
        source = (repo / rel).read_text(encoding="utf-8")
        assert not any(token in source for token in ("Math.sin", "Math.cos", "sin(", "cos(", "curved_release"))
    assert ocean_field(9, pairs=2)["symbol_set"] == "09"


def test_shared_frontend_contract():
    src = Path(__file__).resolve().parents[1] / "docs" / "zero-nine-ocean.js"
    for seed, pairs, samples in ((9, 3, 17), (27, 4, 97), (808, 2, 257)):
        code = "const x=require(" + json.dumps(str(src)) + ");" + \
            "process.stdout.write(JSON.stringify(x.geometry(" + \
            ",".join(map(str, (seed, pairs, samples))) + ")));"
        browser_data = json.loads(subprocess.check_output(["node", "-e", code], text=True))
        assert browser_data == ocean_field(seed, pairs=pairs, samples=samples)
        assert all(browser_data["strands"][0]["points"][i][0] < browser_data["strands"][0]["points"][i+1][0]
                   for i in range(samples-1))
