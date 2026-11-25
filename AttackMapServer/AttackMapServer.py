#!/usr/bin/python3

"""
AUTHOR: Matthew May - mcmay.web@gmail.com
UPDATED: Modernized for Python 3.12+ with async/await patterns
"""

# Imports
import json
import asyncio
import os
import redis.asyncio as aioredis
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.gen
import re

from os import path
from sys import exit, path as sys_path

ROOT_DIR = path.abspath(path.join(path.dirname(__file__), '..'))
if ROOT_DIR not in sys_path:
    sys_path.insert(0, ROOT_DIR)

REDIS_URL = os.environ.get('REDIS_URL', 'redis://127.0.0.1:6379')
USE_MEMORY_BUS = os.environ.get('MEMORY_BUS', '').lower() in ('1', 'true', 'yes')
PORT = int(os.environ.get('PORT', '3306'))


# Look up service colors - CyberPeace color scheme
service_rgb = {
                'FTP':'#ff3333',        # Bright red
                'SSH':'#ff8000',        # Orange
                'TELNET':'#ffaa00',     # Darker orange
                'EMAIL':'#33ff66',      # Green
                'DNS':'#00ff80',        # Cyan-green
                'HTTP':'#00ccff',       # Cyan
                'HTTPS':'#0080ff',      # Blue
                'SQL':'#0066ff',        # Darker blue
                'SNMP':'#8000ff',       # Purple
                'SMB':'#cc00ff',        # Magenta
                'AUTH':'#ff00ff',       # Bright magenta
                'RDP':'#ff0066',        # Pink-red
                'DoS':'#ff0000',        # Bright red
                'ICMP':'#ffcccc',       # Light red
                'MODBUS':'#00ffff',     # Cyan (ICS)
                'DNP3':'#ff8800',       # Orange (ICS)
                'IEC61850':'#88ff00',   # Lime green (ICS)
                'PROFINET':'#ff0088',   # Hot pink (ICS)
                'OPC':'#8800ff'         # Purple-blue (ICS)
                }


class IndexHandler(tornado.web.RequestHandler):
    async def get(self):
        await self.render('index.html')


class WebSocketChatHandler(tornado.websocket.WebSocketHandler):
    def __init__(self, *args, **kwargs):
        super(WebSocketChatHandler, self).__init__(*args, **kwargs)
        self.redis_client = None
        self.pubsub = None
        self.redis_task = None

    def check_origin(self, origin):
        return True

    async def open(self):
        print('[*] WebSocketChatHandler opened')
        try:
            if USE_MEMORY_BUS:
                from memory_bus import AsyncMemoryRedis
                self.redis_client = AsyncMemoryRedis()
                print('[*] Using in-process memory bus')
            else:
                self.redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
                print(f'[*] Connected to Redis: {REDIS_URL.split("@")[-1]}')
            self.pubsub = self.redis_client.pubsub()
            await self.pubsub.subscribe('attack-map-production')
            print('[*] Subscribed to attack-map-production')
            self.redis_task = tornado.ioloop.IOLoop.current().spawn_callback(self._listen_redis)
        except Exception as ex:
            print(f'[*] Could not connect to message bus: {ex}')

    async def _listen_redis(self):
        """Listen for Redis pubsub messages and forward them via WebSocket"""
        try:
            while True:
                message = await self.pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message['type'] == 'message':
                    await self._process_redis_message(message['data'])
                await asyncio.sleep(0.01)  # Small delay to prevent tight loop
        except asyncio.CancelledError:
            pass
        except Exception as ex:
            print(f'[*] Error in Redis listener: {ex}')

    async def _process_redis_message(self, msg_data):
        """Process incoming Redis message and send via WebSocket"""
        if not msg_data or len(msg_data) == 0:
            return None

        # Handle IP blocking message
        if isinstance(msg_data, str) and 'ip_blocked:' in msg_data:
            ip = msg_data.split(":")
            if len(ip) > 1:
                print(f'[*] IP Blocked: {ip[1]}')
            return None

        try:
            if isinstance(msg_data, str):
                json_data = json.loads(msg_data)
            else:
                json_data = msg_data
        except Exception as ex:
            print(f'[*] Error parsing JSON: {ex}')
            return None

        # Extract all fields with defaults
        msg_type = json_data.get('msg_type')
        msg_type2 = json_data.get('msg_type2')
        msg_type3 = json_data.get('msg_type3')
        protocol = json_data.get('protocol')
        src_ip = json_data.get('src_ip')
        dst_ip = json_data.get('dst_ip')
        src_port = json_data.get('src_port')
        dst_port = json_data.get('dst_port')
        src_lat = json_data.get('latitude')
        src_long = json_data.get('longitude')
        dst_lat = json_data.get('dst_lat')
        dst_long = json_data.get('dst_long')
        city = json_data.get('city')
        continent = json_data.get('continent')
        continent_code = json_data.get('continent_code')
        country = json_data.get('country')
        iso_code = json_data.get('iso_code')
        postal_code = json_data.get('postal_code')
        event_count = json_data.get('event_count')
        continents_tracked = json_data.get('continents_tracked', {})
        countries_tracked = json_data.get('countries_tracked', {})
        ips_tracked = json_data.get('ips_tracked', {})
        unknowns = json_data.get('unknowns', {})
        event_time = json_data.get('event_time')
        country_to_code = json_data.get('country_to_code', {})
        ip_to_code = json_data.get('ip_to_code', {})

        # Get color based on protocol
        color = service_rgb.get(protocol, '#9999ff') if protocol else '#9999ff'

        msg_to_send = {
            'type': msg_type,
            'type2': msg_type2,
            'type3': msg_type3,
            'protocol': protocol,
            'src_ip': src_ip,
            'dst_ip': dst_ip,
            'src_port': src_port,
            'dst_port': dst_port,
            'src_lat': src_lat,
            'src_long': src_long,
            'dst_lat': dst_lat,
            'dst_long': dst_long,
            'city': city,
            'continent': continent,
            'continent_code': continent_code,
            'country': country,
            'iso_code': iso_code,
            'postal_code': postal_code,
            'color': color,
            'event_count': event_count,
            'continents_tracked': continents_tracked,
            'countries_tracked': countries_tracked,
            'ips_tracked': ips_tracked,
            'unknowns': unknowns,
            'event_time': event_time,
            'country_to_code': country_to_code,
            'ip_to_code': ip_to_code,
        }

        try:
            self.write_message(json.dumps(msg_to_send))
        except Exception as ex:
            print(f'[*] Error writing WebSocket message: {ex}')

    def on_message(self, message):
        """Handle incoming WebSocket message (e.g., IP block requests)"""
        if message and 'ip_blocked:' in message:
            print(f'[*] Received IP block request: {message}')

    def on_close(self):
        print('[*] Closing WebSocket connection')
        if self.redis_task:
            self.redis_task.cancel()
        # Schedule async cleanup
        if self.pubsub or self.redis_client:
            tornado.ioloop.IOLoop.current().add_callback(self._cleanup_redis)
    
    async def _cleanup_redis(self):
        """Async cleanup of Redis connections"""
        try:
            if self.pubsub:
                await self.pubsub.unsubscribe()
            if self.redis_client:
                await self.redis_client.close()
        except Exception as ex:
            print(f'[*] Error closing Redis connection: {ex}')


def main():
    # Register handler pages
    handlers = [
        (r'/websocket', WebSocketChatHandler),
        (r'/static/(.*)', tornado.web.StaticFileHandler, {'path': 'static'}),
        (r'/flags/(.*)', tornado.web.StaticFileHandler, {'path': 'static/flags'}),
        (r'/', IndexHandler)
    ]

    # Define static settings with template path
    settings = {
        'template_path': path.join(path.dirname(__file__)),
        'debug': True
    }

    try:
        app = tornado.web.Application(handlers, **settings)
        app.listen(PORT)
        print(f'[*] CyberPeace Attack Map Server started on port {PORT}')
        print('[*] Waiting on browser connections...')
        tornado.ioloop.IOLoop.current().start()
    except Exception as appFail:
        print(f'[*] Error starting server: {appFail}')
        exit(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\n[*] SHUTTING DOWN')
        exit(0)
