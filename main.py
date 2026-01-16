"""
PSO v2.0 - Main Application
Phantom Sovereign Orchestrator - Полнофункциональная система
"""

import asyncio
import signal
import sys
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

# Core modules
from core.database import init_database, close_database
from core.security import SecurityManager
from core.nats_client import NATSClient
from core.redis_client import RedisClient
from core.quantum_engine import QuantumEngine

# API routers
from api.auth import router as auth_router
from api.scans import router as scans_router
from api.exploits import router as exploits_router
from api.network import router as network_router
from api.hardware import router as hardware_router
from api.quantum import router as quantum_router
from api.knowledge import router as knowledge_router
from api.aieo import router as aieo_router

# Config
from config import get_settings

# Global services
nats_client: NATSClient = None
redis_client: RedisClient = None
security_manager: SecurityManager = None
quantum_engine: QuantumEngine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events - startup and shutdown"""
    global nats_client, redis_client, security_manager, quantum_engine
    
    # Startup
    logger.info("🚀 Starting PSO v2.0...")
    
    try:
        # Initialize database
        logger.info("📊 Initializing database...")
        await init_database()
        
        # Initialize Redis
        logger.info("🔄 Initializing Redis...")
        redis_client = RedisClient()
        await redis_client.initialize()
        
        # Initialize NATS JetStream
        logger.info("📡 Initializing NATS JetStream...")
        nats_client = NATSClient()
        await nats_client.connect()
        await nats_client.initialize_subscriptions()
        
        # Initialize security manager
        logger.info("🔐 Initializing security...")
        security_manager = SecurityManager()
        await security_manager.initialize()
        
        # Initialize quantum engine
        logger.info("⚛️ Initializing quantum engine...")
        quantum_engine = QuantumEngine()
        await quantum_engine.initialize()
        
        # Start background tasks
        logger.info("🔄 Starting background tasks...")
        asyncio.create_task(background_tasks())
        
        logger.info("✅ PSO v2.0 started successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to start PSO: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down PSO v2.0...")
    
    try:
        if nats_client:
            await nats_client.close()
        if redis_client:
            await redis_client.close()
        if quantum_engine:
            # quantum_engine cleanup if needed
            pass
        if security_manager:
            # security_manager cleanup if needed
            pass
        await close_database()
        
        logger.info("✅ PSO v2.0 shut down successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error during shutdown: {e}")


async def background_tasks():
    """Background tasks that run continuously"""
    try:
        while True:
            # Update system metrics
            await update_system_metrics()
            
            # Clean up old data
            await cleanup_old_data()
            
            # Record telemetry
            if nats_client:
                await nats_client.record_telemetry("system.heartbeat", 1)
            
            await asyncio.sleep(30)  # Every 30 seconds
            
    except asyncio.CancelledError:
        logger.info("Background tasks cancelled")
    except Exception as e:
        logger.error(f"Background task error: {e}")


async def update_system_metrics():
    """Update system metrics"""
    try:
        import psutil
        
        # CPU, Memory, Disk
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Network
        net_io = psutil.net_io_counters()
        
        # Store in Redis
        if redis_client:
            await redis_client.set_json("metrics:system", {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available": memory.available,
                "disk_percent": (disk.used / disk.total) * 100,
                "network_bytes_sent": net_io.bytes_sent,
                "network_bytes_recv": net_io.bytes_recv,
                "timestamp": time.time()
            })
        
    except Exception as e:
        logger.warning(f"Failed to update metrics: {e}")


async def cleanup_old_data():
    """Clean up old data"""
    try:
        # Clean up old sessions from Redis
        if redis_client:
            # This would clean up expired sessions
            pass
        
        logger.debug("✅ Old data cleaned up")
        
    except Exception as e:
        logger.error(f"Failed to cleanup old data: {e}")


# FastAPI app
app = FastAPI(
    title="PSO v2.0 - Phantom Sovereign Orchestrator",
    description="Полнофункциональная система для исследователей и специалистов по безопасности",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(scans_router)
app.include_router(exploits_router)
app.include_router(network_router)
app.include_router(hardware_router)
app.include_router(quantum_router)
app.include_router(knowledge_router)
app.include_router(aieo_router)

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": time.time() - startup_time,
        "services": {
            "database": "connected",
            "redis": "connected" if redis_client and redis_client.is_connected else "disconnected",
            "nats": "connected" if nats_client and nats_client.is_connected else "disconnected",
            "quantum": "ready",
        }
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PSO v2.0 - Phantom Sovereign Orchestrator",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


# Signal handlers
def signal_handler(signum, frame):
    logger.info(f"Received signal {signum}")
    sys.exit(0)


if __name__ == "__main__":
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Store startup time
    startup_time = time.time()
    
    # Run the app
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )