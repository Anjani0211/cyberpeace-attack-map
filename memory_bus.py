"""In-process pub/sub so one Render free web service can run without Redis."""

from __future__ import annotations

import asyncio
import threading
import time
from collections import defaultdict
from queue import Empty, Full, Queue


def _queue_get(queue: Queue, timeout: float):
    deadline = time.time() + max(0.0, float(timeout or 0.0))
    while True:
        remaining = deadline - time.time()
        if remaining <= 0:
            try:
                return queue.get_nowait()
            except Empty:
                return None
        try:
            return queue.get(timeout=remaining)
        except Empty:
            return None


class MemoryBus:
    def __init__(self):
        self._lock = threading.Lock()
        self._subs = defaultdict(list)

    def publish(self, channel, message):
        payload = {
            "type": "message",
            "channel": channel,
            "data": message,
        }
        with self._lock:
            queues = list(self._subs.get(channel, []))
        for queue in queues:
            try:
                queue.put_nowait(payload)
            except Full:
                try:
                    queue.get_nowait()
                except Empty:
                    pass
                try:
                    queue.put_nowait(payload)
                except Full:
                    pass
        return len(queues)

    def pubsub(self):
        return SyncPubSub(self)

    def ping(self):
        return True

    def close(self):
        return True

    def _subscribe(self, channel, queue):
        with self._lock:
            if queue not in self._subs[channel]:
                self._subs[channel].append(queue)

    def _unsubscribe(self, channel, queue):
        with self._lock:
            if channel in self._subs and queue in self._subs[channel]:
                self._subs[channel].remove(queue)


class SyncPubSub:
    def __init__(self, bus: MemoryBus):
        self._bus = bus
        self._queue: Queue = Queue(maxsize=2000)
        self._channels = set()

    def subscribe(self, *channels):
        for channel in channels:
            self._channels.add(channel)
            self._bus._subscribe(channel, self._queue)
        return True

    def unsubscribe(self, *channels):
        targets = channels or tuple(self._channels)
        for channel in targets:
            self._bus._unsubscribe(channel, self._queue)
            self._channels.discard(channel)
        return True

    def get_message(self, ignore_subscribe_messages=True, timeout=0.0):
        return _queue_get(self._queue, timeout)


class AsyncMemoryRedis:
    def __init__(self, bus: MemoryBus | None = None):
        self._bus = bus or BUS

    def pubsub(self):
        return AsyncPubSub(self._bus)

    async def close(self):
        return True


class AsyncPubSub:
    def __init__(self, bus: MemoryBus):
        self._bus = bus
        self._queue: Queue = Queue(maxsize=2000)
        self._channels = set()

    async def subscribe(self, *channels):
        for channel in channels:
            self._channels.add(channel)
            self._bus._subscribe(channel, self._queue)

    async def unsubscribe(self, *channels):
        targets = channels or tuple(self._channels)
        for channel in targets:
            self._bus._unsubscribe(channel, self._queue)
            self._channels.discard(channel)

    async def get_message(self, ignore_subscribe_messages=True, timeout=0.0):
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, _queue_get, self._queue, timeout)


BUS = MemoryBus()
