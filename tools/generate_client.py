"""Generate a Python client from a JSON endpoint specification; offline only."""
from __future__ import annotations
import json,re,sys
from pathlib import Path

HEADER='''"""Generated read/write LOCAL demo client."""
import json
from urllib.request import Request,urlopen
from urllib.parse import quote
from urllib.error import HTTPError
class GeneratedClient:
    def __init__(self,base_url="http://127.0.0.1:8000"):
        if base_url not in ("http://127.0.0.1:8000","http://localhost:8000"):
            raise ValueError("Local only")
        self.base_url=base_url
    def _request(self,method,path,data=None):
        req=Request(self.base_url+path,method=method,
                    data=json.dumps(data).encode("utf-8") if data is not None else None,
                    headers={"Content-Type":"application/json"})
        try:
            with urlopen(req,timeout=5) as response:
                return response.status,json.load(response)
        except HTTPError as err:
            with err:
                return err.code,json.load(err)
'''
def render(spec):
    endpoints=spec.get("endpoints")
    if not isinstance(endpoints,list) or not endpoints:
        raise ValueError("endpoints required")
    seen=set()
    content=HEADER
    for entry in endpoints:
        method,path=entry["method"],entry["path"]
        if method not in ("GET","POST","PUT","DELETE") or not re.fullmatch(r"/[a-zA-Z0-9_/{}-]+",path):
            raise ValueError("Invalid API declaration")
        vars=re.findall(r"{([a-zA-Z_][a-zA-Z0-9_]*)}",path)
        name=method.lower()+"_"+re.sub(r"[^a-z0-9]+","_",path.lower().replace("{","").replace("}","")).strip("_")
        if name in seen:raise ValueError("Duplicate API declaration")
        seen.add(name)
        args=vars+(["data"] if method in ("POST","PUT") else [])
        expr=repr(path)
        if vars:
            for var in vars:
                path=path.replace("{"+var+"}","{quote(str("+var+"),safe='')}")
            expr="f"+repr(path)
        content+="\n    def "+name+"("+",".join(["self"]+args)+"):\n"
        content+="        return self._request("+repr(method)+","+expr+(",data" if method in ("POST","PUT") else "")+")\n"
    return content

def main():
    if len(sys.argv)!=3:
        raise SystemExit("Usage: python tools/generate_client.py spec.json client.py")
    src,dest=map(Path,sys.argv[1:])
    rendered=render(json.loads(src.read_text(encoding="utf-8")))
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(rendered,encoding="utf-8")
    print("Generated "+str(dest))
if __name__=="__main__":main()
