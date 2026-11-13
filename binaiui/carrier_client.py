"""Localhost-only HTTP client for the optional in-memory Carrier API."""
from __future__ import annotations
import json
from urllib.parse import urlsplit,quote
from urllib.request import Request,urlopen
from urllib.error import HTTPError

class CarrierClient:
    def __init__(self,base_url="http://127.0.0.1:8000"):
        url=urlsplit(base_url)
        if url.scheme!="http" or url.hostname not in ("localhost","127.0.0.1") or url.username or url.password or url.path not in ("","/") or url.query or url.fragment:
            raise ValueError("Only local HTTP is allowed")
        self.base_url=base_url.rstrip("/")
    def request(self,method,path,data=None):
        if not path.startswith("/") or path.startswith("//"):
            raise ValueError("Invalid API path")
        body=json.dumps(data).encode() if data is not None else None
        request=Request(self.base_url+path,data=body,method=method,headers={"Content-Type":"application/json"})
        try:
            with urlopen(request,timeout=5) as response:
                return response.status,json.load(response)
        except HTTPError as error:
            with error:
                return error.code,json.load(error)
    def health(self):return self.request("GET","/health")
    def get(self,ident):return self.request("GET","/items/"+quote(str(ident),safe=""))
    def create(self,ident,value):return self.request("POST","/items",{"id":ident,"value":value})
    def update(self,ident,value):return self.request("PUT","/items/"+quote(str(ident),safe=""),{"value":value})
    def delete(self,ident):return self.request("DELETE","/items/"+quote(str(ident),safe=""))
