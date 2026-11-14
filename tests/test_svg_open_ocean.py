import pathlib
import sys
import xml.etree.ElementTree as ET

from binaiui.genesis_field import generate_svg,fingerprint
from binaiui.zero_nine_ocean import SYMBOLS


def test_svg_open_ocean_symbols():
    svg=generate_svg(seed=9,width=480,height=320,streams=8,symbols=80)
    root=ET.fromstring(svg)
    ns={'s':'http://www.w3.org/2000/svg'}
    glyphs=[(tag.text or '') for tag in root.findall('.//s:text',ns)]
    paths=[tag.attrib['d'] for tag in root.findall('.//s:path',ns)]
    assert paths
    assert glyphs
    assert all(g in SYMBOLS for g in glyphs)
    assert all(not d.rstrip().endswith(('Z','z')) for d in paths)
    assert all(d.startswith('M -') for d in paths)
    assert svg == generate_svg(seed=9,width=480,height=320,streams=8,symbols=80)
    assert fingerprint(svg)!=fingerprint(generate_svg(seed=10,width=480,height=320,streams=8,symbols=80))
