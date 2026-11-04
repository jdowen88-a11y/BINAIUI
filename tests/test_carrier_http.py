import json
from pathlib import Path
from binaiui.carrier_api import CarrierStore
from binaiui.carrier_client import CarrierClient
import pytest

def test_api_readonly_default():
    store=CarrierStore()
    assert store.process("GET","/health")[0]==200
    assert store.process("POST","/items",{"id":"8","value":88})[0]==403
    assert store.items=={}

def test_api_crud_explicit():
    store=CarrierStore(True)
    assert store.process("POST","/items",{"id":"8","value":88})[0]==201
    assert store.process("GET","/items/8")[1]["value"]==88
    assert store.process("POST","/items",{"id":"8","value":1})[0]==409
    assert store.process("PUT","/items/8",{"value":9})[1]["value"]==9
    assert store.process("DELETE","/items/8")[0]==200
    assert store.process("GET","/items/8")[0]==404

def test_client_only_local():
    with pytest.raises(ValueError):CarrierClient("https://example.org")
    with pytest.raises(ValueError):CarrierClient("http://127.0.0.1.bad.test")

def test_generator_is_valid_python():
    root=Path(__file__).resolve().parents[1]
    env={}
    exec(compile((root/"tools/generate_client.py").read_text(),"generator","exec"),env)
    spec=json.loads((root/"tools/carrier_spec.json").read_text())
    source=env["render"](spec)
    compile(source,"generated.py","exec")
    assert "get_items_item_id" in source
