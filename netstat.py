from tornado.ioloop import IOLoop, PeriodicCallback
from tornado.websocket import websocket_connect, WebSocketClosedError
import psutil
import json
import asyncio


class NetStatClient(object):

    def __init__(self, url):
        self.url = url
        self.connect()

    async def _fetch_ws(self):
        try:
            self.ws = await websocket_connect(self.url)
        except ConnectionRefusedError as e:
            print("%s seems to be down." % self.url)
            raise e

    def connect(self):
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self._fetch_ws())

    async def _write_info(self):
        while True:
            await asyncio.sleep(1)

            connections = []
            for c in psutil.net_connections():
                if (
                        c.type.name == 'SOCK_STREAM'
                        and c.raddr
                        #and (c.laddr.port == 80 or c.laddr.port == 443 or c.laddr.port == 8000)
                        #and (c.laddr.ip == '10.0.0.191')
                ):
                    data = {
                        'type': c.type.name,
                        'laddr': c.laddr.ip,
                        'lport': c.laddr.port,
                        'raddr': c.raddr.ip,
                        'rport': c.raddr.port,
                        'status': c.status
                    }
                    connections.append(data)

            data = {
                'command': 'replace',
                'data': connections
            }

            try:
                self.ws.write_message(json.dumps(data))
            except WebSocketClosedError:
                return

    def run(self):
        self.loop = asyncio.get_event_loop()
        self.loop.run_until_complete(self._write_info())

if __name__ == "__main__":
    url = "ws://localhost:8000/ws"
    nsc = NetStatClient(url)
    nsc.run()
