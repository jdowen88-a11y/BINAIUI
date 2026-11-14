"""Open-field backend/browser geometry parity and nonclosure checks."""
from binaiui.zero_nine_ocean import ocean_field, verify_field
import json
import pathlib
import subprocess

def test_all_open_edges_and_near_contact():
    report=verify_field(ocean_field(9,pairs=24,samples=97))
    assert report["passed"], report
    assert report["strands"]==48

def test_reproducibility_and_seed_change():
    assert ocean_field(9,pairs=4)==ocean_field(9,pairs=4)
    assert ocean_field(9,pairs=4)!=ocean_field(10,pairs=4)

def test_symbol_only():
    symbols=ocean_field(9,pairs=2)["symbol_set"]
    assert set(symbols)<=set("09•∴⋅↗⇝⟡")
    assert all(ord(c)>=32 for c in symbols)

def test_shared_frontend_contract():
    src=pathlib.Path(__file__).resolve().parents[1]/"docs"/"zero-nine-ocean.js"
    code="const x=require("+json.dumps(str(src))+");process.stdout.write(JSON.stringify(x.geometry(9,3,17)));"
    browser_data=json.loads(subprocess.check_output(["node","-e",code],text=True))
    assert browser_data==ocean_field(9,pairs=3,samples=17)
