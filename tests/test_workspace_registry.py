"""Integration safeguards for the read-only workspace inventory."""
import importlib.util
from pathlib import Path

def test_inventory_guard():
    module_path = Path(__file__).resolve().parents[1] / "tools" / "workspace_validate.py"
    spec = importlib.util.spec_from_file_location("workspace_validate", module_path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    summary = mod.validate()
    assert summary["count"] == 23
    assert summary["offline_checks"] == 4
