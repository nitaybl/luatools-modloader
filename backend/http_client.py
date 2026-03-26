"""Shared HTTP client management for the LuaTools backend via native urllib."""

import subprocess
import json

from config import DEFAULT_HEADERS, HTTP_TIMEOUT_SECONDS, USER_AGENT
from logger import logger

class MockResponse:
    def __init__(self, text, status_code, headers):
        self.text = text
        self.status_code = status_code
        self.headers = headers

    def json(self):
        return json.loads(self.text)

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code}")

class MockStreamResponse:
    def __init__(self, proc, headers, status_code):
        self.proc = proc
        self.headers = headers
        self.status_code = status_code

    def __enter__(self):
        return self

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code}")

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.proc.kill()
        except:
            pass

    def iter_bytes(self):
        while True:
            chunk = self.proc.stdout.read(8192)
            if not chunk:
                break
            yield chunk

class NativeClient:
    def __init__(self, timeout=None):
        self.timeout = timeout or HTTP_TIMEOUT_SECONDS

    def get(self, url, headers=None, follow_redirects=True, timeout=None):
        cmd = ["curl.exe", "-sL", "-w", "%{http_code}"]
        
        # Merge default headers with passed headers
        req_headers = DEFAULT_HEADERS.copy()
        if headers:
            req_headers.update(headers)
        
        # Ensure the project's User-Agent is used if not explicitly overridden
        if "User-Agent" not in req_headers:
            req_headers["User-Agent"] = USER_AGENT
            
        for k, v in req_headers.items():
            cmd.extend(["-H", f"{k}: {v}"])
        cmd.append(url)
        
        try:
            # CREATE_NO_WINDOW = 0x08000000
            proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout or self.timeout, creationflags=0x08000000)
            output = proc.stdout.decode('utf-8', errors='ignore') if proc.stdout else ""
        except subprocess.TimeoutExpired as e:
            output = e.stdout.decode('utf-8', errors='ignore') if getattr(e, 'stdout', None) else ""
        except Exception as e:
            output = ""
            
        status_code_str = output[-3:] if len(output) >= 3 else "500"
        try:
            status_code = int(status_code_str)
            text = output[:-3]
        except:
            status_code = 500
            text = output
            
        return MockResponse(text, status_code, {})

    def stream(self, method, url, headers=None, follow_redirects=True, timeout=None):
        # Merge default headers with passed headers
        req_headers = DEFAULT_HEADERS.copy()
        if headers:
            req_headers.update(headers)
            
        # Ensure the project's User-Agent is used if not explicitly overridden
        if "User-Agent" not in req_headers:
            req_headers["User-Agent"] = USER_AGENT

        # First, we need to get the headers/status code via a HEAD request (simulated via -I)
        head_cmd = ["curl.exe", "-sL", "-I"]
        for k, v in req_headers.items():
            head_cmd.extend(["-H", f"{k}: {v}"])
        head_cmd.append(url)
        
        resp_headers = {}
        status_code = 200
        
        try:
            head_proc = subprocess.run(head_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10, creationflags=0x08000000)
            head_out = head_proc.stdout.decode('utf-8', errors='ignore') if head_proc.stdout else ""
            for line in head_out.splitlines():
                line = line.strip()
                if line.startswith("HTTP/"):
                    parts = line.split(" ")
                    if len(parts) >= 2:
                        try: status_code = int(parts[1])
                        except: pass
                elif ":" in line:
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        resp_headers[parts[0].strip().lower()] = parts[1].strip()
        except Exception as e:
            logger.warn(f"LuaTools: Failed to get headers for stream: {e}")

        # Now, prepare the actual streaming command
        stream_cmd = ["curl.exe", "-sL", "--compressed"]
        for k, v in req_headers.items():
            stream_cmd.extend(["-H", f"{k}: {v}"])
        stream_cmd.append(url)
        
        proc = subprocess.Popen(stream_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, creationflags=0x08000000)
        return MockStreamResponse(proc, resp_headers, status_code)

_HTTP_CLIENT = None

def ensure_http_client(context: str = "") -> NativeClient:
    """Create the shared HTTP client if needed and return it."""
    global _HTTP_CLIENT
    if _HTTP_CLIENT is None:
        prefix = f"{context}: " if context else ""
        logger.log(f"{prefix}Initializing shared native urllib client...")
        try:
            _HTTP_CLIENT = NativeClient(timeout=HTTP_TIMEOUT_SECONDS)
            logger.log(f"{prefix}Native client initialized")
        except Exception as exc:
            logger.error(f"{prefix}Failed to initialize client: {exc}")
            raise
    return _HTTP_CLIENT

def get_http_client() -> NativeClient:
    """Return the shared HTTP client, creating it if necessary."""
    return ensure_http_client()

def close_http_client(context: str = "") -> None:
    """Close and dispose of the shared HTTP client."""
    global _HTTP_CLIENT
    _HTTP_CLIENT = None
    prefix = f"{context}: " if context else ""
    logger.log(f"{prefix}Native client closed")
