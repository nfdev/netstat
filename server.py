import os
import json
import random
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url
from tornado.websocket import WebSocketHandler


class IndexHandler(RequestHandler):

    def get(self, *args, **kwargs):
        self.render('main.html')


class NetStatHandler(WebSocketHandler):

    waiters = set()
    netstat = []

    def open(self, *args, **kwargs):
        print("open")
        self.waiters.add(self)

        message = {'command': 'update', 'data': self.netstat}
        self.write_message(message)

    def _datadecode(self, message):
        try:
            result = json.loads(message)
            command = result['command']
            data = result['data']
        except Exception as e:
            command = None
            data = None

        return (command, data)

    def _replase(self, data):
        self.netstat = data

        message = {'command': 'update', 'data': self.netstat}
        for waiter in self.waiters:
            if waiter == self:
                continue
            waiter.write_message(message)

    def on_message(self, message):
        print("on message")
        command, data = self._datadecode(message)

        if command == 'replace':
            self._replase(data)
            print(data)
        else:
            pass

    def on_close(self):
        print("close")
        self.waiters.remove(self)


class Server(Application):

    def __init__(self):
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        Application.__init__(
            self,
            [
                url(r'/', IndexHandler, name='index'),
                url(r'/ws', NetStatHandler, name='ws'),
            ],
            template_path=os.path.join(BASE_DIR, 'templates'),
            static_path=os.path.join(BASE_DIR, 'static'),
        )


if __name__ == '__main__':
    sv = Server()
    http_server = HTTPServer(sv)
    http_server.listen(8000)
    IOLoop.instance().start()
