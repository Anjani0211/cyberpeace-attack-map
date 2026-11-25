#!/usr/bin/env python3
"""Start the full CyberPeace stack in one Render free web service.

- syslog generator: subprocess (writes test-syslog.log)
- DataServer: background thread (GeoIP + publish)
- AttackMapServer: main process (HTTP + WebSocket)

Uses MEMORY_BUS so Redis is not required.
"""

from __future__ import annotations

import os
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "DataServer"
WEB = ROOT / "AttackMapServer"
SYSLOG = DATA / "test-syslog.log"
CHILDREN: list[subprocess.Popen] = []


def start_syslog() -> subprocess.Popen:
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    print("[*] Starting syslog generator", flush=True)
    proc = subprocess.Popen(
        ["bash", str(DATA / "syslog-gen-file.sh")],
        cwd=str(DATA),
        env=env,
    )
    CHILDREN.append(proc)
    return proc


def start_dataserver_thread() -> None:
    def runner():
        os.environ["MEMORY_BUS"] = "1"
        os.environ["PYTHONUNBUFFERED"] = "1"
        os.chdir(str(DATA))
        if str(ROOT) not in sys.path:
            sys.path.insert(0, str(ROOT))
        if str(DATA) not in sys.path:
            sys.path.insert(0, str(DATA))
        import DataServer as ds  # noqa: WPS433

        sys.argv = ["DataServer.py", str(SYSLOG)]
        try:
            ds.main()
        except SystemExit:
            pass
        except Exception as exc:
            print(f"[!] DataServer crashed: {exc}", flush=True)

    thread = threading.Thread(target=runner, name="DataServer", daemon=True)
    thread.start()
    print("[*] DataServer thread started", flush=True)


def shutdown(*_args):
    print("[*] Shutting down platform...", flush=True)
    for proc in reversed(CHILDREN):
        if proc.poll() is None:
            proc.terminate()
    for proc in CHILDREN:
        try:
            proc.wait(timeout=4)
        except subprocess.TimeoutExpired:
            proc.kill()
    sys.exit(0)


def main():
    os.environ["MEMORY_BUS"] = "1"
    os.environ.setdefault("PORT", "10000")
    os.environ["PYTHONUNBUFFERED"] = "1"
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))

    SYSLOG.touch(exist_ok=True)
    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    gen = start_syslog()
    time.sleep(0.8)
    start_dataserver_thread()
    time.sleep(0.8)

    # Watchdog for syslog generator
    def watch():
        while True:
            code = gen.poll()
            if code is not None:
                print(f"[!] syslog-gen exited ({code})", flush=True)
                shutdown()
            time.sleep(2)

    threading.Thread(target=watch, name="watch-syslog", daemon=True).start()

    os.chdir(str(WEB))
    if str(WEB) not in sys.path:
        sys.path.insert(0, str(WEB))
    import AttackMapServer as web  # noqa: WPS433

    print(f"[*] Starting AttackMapServer on PORT={os.environ.get('PORT')}", flush=True)
    web.main()


if __name__ == "__main__":
    main()
