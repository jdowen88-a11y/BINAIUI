"""Opt-in, in-memory localhost Carrier Node demo. Never transmits radio."""
from __future__ import annotations
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import argparse
import json
from threading import RLock
from urllib.parse import unquote, urlsplit

class CarrierStore:
    """Process-local memory; defaults to all writes disabled."""
    def __init__(self, writes_enabled: bool = False):
        self.items = {}
        self.writes_enabled = writes_enabled
        self.lock = RLock()

    def process(self, method: str, path: str, data=None):
        path = urlsplit(path).path
        if method == "GET" and path == "/health":
            return 200, {"status": "READY", "mode": "LOCAL_ONLY",
                         "writes_enabled": self.writes_enabled, "persistent": False}
        if method == "POST" and path == "/items":
            if not self.writes_enabled:
                return 403, {"error":"WRITE_DISABLED"}
            if not isinstance(data, dict) or set(data) != {"id","value"}:
                return 400, {"error":"INVALID_ITEM"}
            ident = data["id"]
            if not isinstance(ident,str) or not 1 <= len(ident) <= 80 or "/" in ident:
                return 400, {"error":"INVALID_ID"}
            with self.lock:
                if ident in self.items:
                    return 409, {"error":"ALREADY_EXISTS"}
                self.items[ident] = dict(data)
                return 201, dict(self.items[ident])
        if path.startswith("/items/"):
            ident = unquote(path[7:])
            if not ident or "/" in ident or len(ident) > 80:
                return 400, {"error":"INVALID_ID"}
            with self.lock:
                if method == "GET":
                    return (200, dict(self.items[ident])) if ident in self.items else (404, {"error":"NOT_FOUND"})
                if method in ("PUT", "DELETE"):
                    if not self.writes_enabled:
                        return 403, {"error":"WRITE_DISABLED"}
                    if ident not in self.items:
                        return 404, {"error":"NOT_FOUND"}
                    if method == "DELETE":
                        del self.items[ident]
                        return 200, {"deleted":ident,"persistent":False}
                    if not isinstance(data,dict) or set(data) != {"value"}:
                        return 400, {"error":"INVALID_ITEM"}
                    self.items[ident] = {"id":ident,"value":data["value"]}
                    return 200, dict(self.items[ident])
        return 404, {"error":"NOT_FOUND"}

def make_handler(store):
    class Handler(BaseHTTPRequestHandler):
        def respond(self, status, result):
            data = json.dumps(result,ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type","application/json")
            self.send_header("Cache-Control","no-store")
            self.send_header("Content-Length",str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        def handle_request(self):
            size = self.headers.get("Content-Length","0")
            if not size.isdigit() or int(size)>65536:
                return self.respond(413,{"error":"TOO_LARGE"})
            data=None
            if int(size):
                try: data=json.loads(self.rfile.read(int(size)))
                except (ValueError,UnicodeError):
                    return self.respond(400,{"error":"BAD_JSON"})
            status,result=store.process(self.command,self.path,data)
            self.respond(status,result)
        do_GET=handle_request
        do_POST=handle_request
        do_PUT=handle_request
        do_DELETE=handle_request
        def log_message(self,*args): pass
    return Handler

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--port",type=int,default=8000)
    parser.add_argument("--enable-writes",action="store_true")
    args=parser.parse_args()
    if not 1024<=args.port<=65535:
        parser.error("Port must be 1024..65535")
    with ThreadingHTTPServer(("127.0.0.1",args.port),make_handler(CarrierStore(args.enable_writes))) as server:
        print("Local demo at http://127.0.0.1:"+str(args.port))
        server.serve_forever()

if __name__=="__main__":
    main()
