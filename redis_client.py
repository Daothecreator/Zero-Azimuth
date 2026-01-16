"""
Redis client for caching and session management.
"""

import json
import pickle
from datetime import datetime, timedelta
from typing import Any, Optional, Dict, List

import redis.asyncio as redis

from ..config import get_settings


settings = get_settings()


class RedisClient:
    """Redis client for PSO v2.0 caching and session management."""
    
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
        self.is_connected = False
    
    async def connect(self) -> None:
        """Connect to Redis server."""
        try:
            self.redis = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
            )
            
            # Test connection
            await self.redis.ping()
            self.is_connected = True
            print(f"✓ Connected to Redis at {settings.redis_host}:{settings.redis_port}")
            
        except Exception as e:
            print(f"✗ Failed to connect to Redis: {e}")
            raise
    
    # Basic Operations
    async def get(self, key: str) -> Optional[str]:
        """Get value by key."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, expire: int = None) -> bool:
        """Set key-value pair with optional expiration."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        return await self.redis.set(key, value, ex=expire)
    
    async def delete(self, key: str) -> int:
        """Delete key."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        return await self.redis.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        return await self.redis.exists(key) > 0
    
    # JSON Operations
    async def set_json(self, key: str, data: Dict[Any, Any], expire: int = None) -> bool:
        """Store JSON data."""
        json_data = json.dumps(data, default=str)
        return await self.set(key, json_data, expire)
    
    async def get_json(self, key: str) -> Optional[Dict[Any, Any]]:
        """Get JSON data."""
        data = await self.get(key)
        return json.loads(data) if data else None
    
    # Object Serialization
    async def set_object(self, key: str, obj: Any, expire: int = None) -> bool:
        """Store Python object using pickle."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        pickled_data = pickle.dumps(obj)
        return await self.redis.set(key, pickled_data, ex=expire)
    
    async def get_object(self, key: str) -> Optional[Any]:
        """Get Python object using pickle."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        data = await self.redis.get(key)
        return pickle.loads(data) if data else None
    
    # Session Management
    async def create_session(self, session_id: str, data: Dict[Any, Any], expire_hours: int = 24) -> bool:
        """Create user session."""
        key = f"session:{session_id}"
        expire_seconds = expire_hours * 3600
        return await self.set_json(key, data, expire_seconds)
    
    async def get_session(self, session_id: str) -> Optional[Dict[Any, Any]]:
        """Get user session data."""
        key = f"session:{session_id}"
        return await self.get_json(key)
    
    async def update_session(self, session_id: str, data: Dict[Any, Any]) -> bool:
        """Update session data."""
        existing = await self.get_session(session_id)
        if existing:
            existing.update(data)
            return await self.create_session(session_id, existing)
        return False
    
    async def delete_session(self, session_id: str) -> int:
        """Delete user session."""
        key = f"session:{session_id}"
        return await self.delete(key)
    
    # User Session Management
    async def set_user_session(self, user_id: str, session_data: Dict[Any, Any]) -> bool:
        """Store user session."""
        key = f"user_session:{user_id}"
        return await self.set_json(key, session_data, 3600)  # 1 hour
    
    async def get_user_session(self, user_id: str) -> Optional[Dict[Any, Any]]:
        """Get user session."""
        key = f"user_session:{user_id}"
        return await self.get_json(key)
    
    # Caching
    async def cache_set(self, key: str, value: Any, expire: int = 300) -> bool:
        """Set cache value."""
        cache_key = f"cache:{key}"
        return await self.set(cache_key, str(value), expire)
    
    async def cache_get(self, key: str) -> Optional[str]:
        """Get cache value."""
        cache_key = f"cache:{key}"
        return await self.get(cache_key)
    
    async def cache_delete(self, key: str) -> int:
        """Delete cache value."""
        cache_key = f"cache:{key}"
        return await self.delete(cache_key)
    
    async def cache_clear_pattern(self, pattern: str) -> int:
        """Clear cache entries matching pattern."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        keys = await self.redis.keys(f"cache:{pattern}")
        if keys:
            return await self.redis.delete(*keys)
        return 0
    
    # Rate Limiting
    async def check_rate_limit(self, key: str, limit: int, window: int = 60) -> bool:
        """
        Check if request is within rate limit.
        window: time window in seconds
        limit: maximum requests in window
        """
        if not self.redis:
            raise RuntimeError("Redis not connected")
        
        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, window)
        
        return current <= limit
    
    # Scan Results Caching
    async def cache_scan_result(self, scan_id: str, result: Dict[Any, Any], expire: int = 3600) -> bool:
        """Cache scan results."""
        key = f"scan_result:{scan_id}"
        return await self.set_json(key, result, expire)
    
    async def get_scan_result(self, scan_id: str) -> Optional[Dict[Any, Any]]:
        """Get cached scan results."""
        key = f"scan_result:{scan_id}"
        return await self.get_json(key)
    
    # Exploit Results Caching
    async def cache_exploit_result(self, execution_id: str, result: Dict[Any, Any], expire: int = 7200) -> bool:
        """Cache exploit execution results."""
        key = f"exploit_result:{execution_id}"
        return await self.set_json(key, result, expire)
    
    async def get_exploit_result(self, execution_id: str) -> Optional[Dict[Any, Any]]:
        """Get cached exploit results."""
        key = f"exploit_result:{execution_id}"
        return await self.get_json(key)
    
    # Hardware Device Tracking
    async def track_device(self, device_id: str, device_data: Dict[Any, Any], expire: int = 300) -> bool:
        """Track hardware device status."""
        key = f"device:{device_id}"
        return await self.set_json(key, device_data, expire)
    
    async def get_device_status(self, device_id: str) -> Optional[Dict[Any, Any]]:
        """Get hardware device status."""
        key = f"device:{device_id}"
        return await self.get_json(key)
    
    # Statistics and Metrics
    async def increment_counter(self, metric: str, amount: int = 1) -> int:
        """Increment a counter metric."""
        key = f"metric:{metric}"
        return await self.redis.incrby(key, amount)
    
    async def get_counter(self, metric: str) -> int:
        """Get counter value."""
        key = f"metric:{metric}"
        value = await self.get(key)
        return int(value) if value else 0
    
    # Pub/Sub
    async def publish(self, channel: str, message: Dict[Any, Any]) -> int:
        """Publish message to channel."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        return await self.redis.publish(channel, json.dumps(message, default=str))
    
    # Queue Operations
    async def queue_push(self, queue: str, item: Dict[Any, Any]) -> int:
        """Push item to queue."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        return await self.redis.lpush(queue, json.dumps(item, default=str))
    
    async def queue_pop(self, queue: str) -> Optional[Dict[Any, Any]]:
        """Pop item from queue."""
        if not self.redis:
            raise RuntimeError("Redis not connected")
        item = await self.redis.brpop(queue, timeout=1)
        if item:
            return json.loads(item[1])
        return None
    
    # Graceful shutdown
    async def close(self) -> None:
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()
            self.is_connected = False
            print("✓ Redis connection closed")
    
    # Initialize Redis
    async def initialize(self) -> None:
        """Initialize Redis client."""
        await self.connect()
        print("✓ Redis client initialized")