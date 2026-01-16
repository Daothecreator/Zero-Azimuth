"""
NATS JetStream client for lightweight messaging.
"""

import asyncio
import json
from typing import Dict, Any, Optional, Callable, List
from datetime import datetime

import nats
from nats.aio.client import Client as NATSClientNative
from nats.aio.msg import Msg
from nats.js import JetStreamContext
from nats.js.errors import BucketNotFoundError
from nats.js.kv import KeyValue

from ..config import get_settings
from ..models.base import Base


settings = get_settings()


class NATSClient:
    """NATS JetStream client for PSO v2.0 messaging system."""
    
    def __init__(self):
        self.nc: Optional[NATSClientNative] = None
        self.js: Optional[JetStreamContext] = None
        self.kv_stores: Dict[str, KeyValue] = {}
        self.subscriptions: List = []
        self.is_connected = False
    
    async def connect(self) -> None:
        """Connect to NATS server with JetStream."""
        try:
            self.nc = await nats.connect(
                settings.nats_url,
                name="pso-v2-server",
                connect_timeout=5,
                reconnect_time_wait=2,
                max_reconnect_attempts=10,
                ping_interval=20,
                max_outstanding_pings=5,
            )
            
            # Create JetStream context
            self.js = self.nc.jetstream()
            
            # Setup KV stores
            await self._setup_kv_stores()
            
            self.is_connected = True
            print(f"✓ Connected to NATS JetStream at {settings.nats_url}")
            
        except Exception as e:
            print(f"✗ Failed to connect to NATS: {e}")
            raise
    
    async def _setup_kv_stores(self) -> None:
        """Setup KeyValue stores for different purposes."""
        kv_configs = {
            "config": {"history": 5, "ttl": 86400},  # 24 hours
            "sessions": {"history": 10, "ttl": 3600},  # 1 hour
            "cache": {"history": 1, "ttl": 1800},  # 30 minutes
            "telemetry": {"history": 100, "ttl": 604800},  # 7 days
        }
        
        for name, config in kv_configs.items():
            try:
                kv = await self.js.create_key_value(
                    bucket=name,
                    history=config["history"],
                    ttl=config["ttl"]
                )
                self.kv_stores[name] = kv
                print(f"  - Created KV store: {name}")
            except Exception as e:
                # Bucket might already exist
                try:
                    kv = await self.js.key_value(name)
                    self.kv_stores[name] = kv
                    print(f"  - Connected to existing KV store: {name}")
                except Exception:
                    print(f"  - Failed to setup KV store {name}: {e}")
    
    async def publish(self, subject: str, data: Dict[Any, Any]) -> None:
        """Publish message to NATS subject."""
        if not self.js:
            raise RuntimeError("NATS not connected")
        
        payload = json.dumps(data, default=str).encode()
        await self.js.publish(subject, payload)
    
    async def subscribe(self, subject: str, callback: Callable[[Msg], None]) -> None:
        """Subscribe to NATS subject."""
        if not self.nc:
            raise RuntimeError("NATS not connected")
        
        sub = await self.nc.subscribe(subject, cb=callback)
        self.subscriptions.append(sub)
    
    async def queue_subscribe(self, subject: str, queue: str, callback: Callable[[Msg], None]) -> None:
        """Subscribe to subject with queue group."""
        if not self.nc:
            raise RuntimeError("NATS not connected")
        
        sub = await self.nc.subscribe(subject, queue=queue, cb=callback)
        self.subscriptions.append(sub)
    
    # KeyValue Operations
    async def kv_put(self, bucket: str, key: str, value: Dict[Any, Any]) -> None:
        """Put value into KeyValue store."""
        if bucket not in self.kv_stores:
            raise ValueError(f"KV store '{bucket}' not found")
        
        payload = json.dumps(value, default=str).encode()
        await self.kv_stores[bucket].put(key, payload)
    
    async def kv_get(self, bucket: str, key: str) -> Optional[Dict[Any, Any]]:
        """Get value from KeyValue store."""
        if bucket not in self.kv_stores:
            raise ValueError(f"KV store '{bucket}' not found")
        
        try:
            entry = await self.kv_stores[bucket].get(key)
            return json.loads(entry.value.decode())
        except BucketNotFoundError:
            return None
        except Exception:
            return None
    
    async def kv_delete(self, bucket: str, key: str) -> None:
        """Delete key from KeyValue store."""
        if bucket not in self.kv_stores:
            raise ValueError(f"KV store '{bucket}' not found")
        
        await self.kv_stores[bucket].delete(key)
    
    # Stream Management
    async def create_stream(self, name: str, subjects: List[str]) -> None:
        """Create JetStream stream."""
        if not self.js:
            raise RuntimeError("NATS not connected")
        
        try:
            await self.js.add_stream(name=name, subjects=subjects)
            print(f"  - Created stream: {name}")
        except Exception as e:
            print(f"  - Stream {name} already exists or error: {e}")
    
    # AIEO Event Patterns
    async def publish_aieo_event(self, loop_type: str, event_data: Dict[Any, Any]) -> None:
        """Publish AIEO event to appropriate loop."""
        subject = f"aieo.{loop_type}"
        event_data.update({
            "timestamp": datetime.utcnow().isoformat(),
            "loop_type": loop_type
        })
        await self.publish(subject, event_data)
    
    async def publish_scan_event(self, scan_id: str, event_type: str, data: Dict[Any, Any]) -> None:
        """Publish scan-related event."""
        subject = f"scans.{scan_id}.{event_type}"
        await self.publish(subject, data)
    
    async def publish_security_event(self, event_type: str, data: Dict[Any, Any]) -> None:
        """Publish security event."""
        subject = f"security.{event_type}"
        data.update({
            "timestamp": datetime.utcnow().isoformat(),
            "severity": data.get("severity", "info")
        })
        await self.publish(subject, data)
    
    # Session Management
    async def store_session(self, session_id: str, session_data: Dict[Any, Any]) -> None:
        """Store session data in KV store."""
        await self.kv_put("sessions", session_id, session_data)
    
    async def get_session(self, session_id: str) -> Optional[Dict[Any, Any]]:
        """Get session data from KV store."""
        return await self.kv_get("sessions", session_id)
    
    async def delete_session(self, session_id: str) -> None:
        """Delete session from KV store."""
        await self.kv_delete("sessions", session_id)
    
    # Telemetry Collection
    async def record_telemetry(self, metric_name: str, value: float, tags: Dict[str, str] = None) -> None:
        """Record telemetry metric."""
        data = {
            "metric": metric_name,
            "value": value,
            "timestamp": datetime.utcnow().isoformat(),
            "tags": tags or {}
        }
        await self.publish("telemetry.metrics", data)
    
    # Message Handlers
    async def handle_scan_request(self, msg: Msg) -> None:
        """Handle incoming scan request."""
        data = json.loads(msg.data.decode())
        print(f"Received scan request: {data}")
        # Process scan request
        await msg.ack()
    
    async def handle_exploit_request(self, msg: Msg) -> None:
        """Handle incoming exploit request."""
        data = json.loads(msg.data.decode())
        print(f"Received exploit request: {data}")
        # Process exploit request
        await msg.ack()
    
    # Graceful shutdown
    async def close(self) -> None:
        """Close NATS connection and cleanup."""
        if self.nc:
            # Unsubscribe from all subjects
            for sub in self.subscriptions:
                await sub.unsubscribe()
            
            await self.nc.close()
            self.is_connected = False
            print("✓ NATS connection closed")
    
    # Initialize NATS subscriptions
    async def initialize_subscriptions(self) -> None:
        """Initialize default NATS subscriptions."""
        # Subscribe to scan requests
        await self.queue_subscribe("scans.request", "pso-workers", self.handle_scan_request)
        
        # Subscribe to exploit requests
        await self.queue_subscribe("exploits.request", "pso-workers", self.handle_exploit_request)
        
        print("✓ NATS subscriptions initialized")