#!/bin/bash

# PSO v2.0 Deployment Script
# Phantom Sovereign Orchestrator - Полнофункциональная система

set -e

echo "🚀 PSO v2.0 Deployment Script"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   exit 1
fi

# Check dependencies
echo -e "${YELLOW}📋 Checking dependencies...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is not installed${NC}"
    exit 1
fi

# Check Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker service"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies found${NC}"

# Generate environment variables
echo -e "${YELLOW}🔐 Generating environment variables...${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << EOF
# Database Configuration
DB_PASSWORD=$(openssl rand -base64 32)

# Redis Configuration
REDIS_PASSWORD=$(openssl rand -base64 32)

# Security Keys
SECRET_KEY=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Grafana Configuration
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Environment
ENVIRONMENT=production
EOF
    echo -e "${GREEN}✅ Environment file created${NC}"
else
    echo -e "${YELLOW}⚠️  Environment file already exists${NC}"
fi

# Load environment variables
source .env

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs downloads exploits data monitoring/prometheus monitoring/grafana/dashboards monitoring/grafana/datasources ssl

echo -e "${GREEN}✅ Directories created${NC}"

# Create Prometheus configuration
cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'pso-backend'
    static_configs:
      - targets: ['pso-backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s
EOF

# Create Grafana datasource configuration
cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Create Nginx configuration
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=auth:10m rate=5r/s;

    upstream backend {
        server pso-backend:8000;
    }

    upstream frontend {
        server pso-frontend:80;
    }

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Auth endpoints with stricter rate limiting
        location /api/auth/ {
            limit_req zone=auth burst=10 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }
    }
}
EOF

# Pull Docker images
echo -e "${YELLOW}🐳 Pulling Docker images...${NC}"
docker-compose pull

# Start services
echo -e "${YELLOW}🚀 Starting PSO v2.0 services...${NC}"
docker-compose up -d postgres redis nats

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Start backend
echo -e "${YELLOW}🔧 Starting backend...${NC}"
docker-compose up -d pso-backend

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
sleep 20

# Start frontend
echo -e "${YELLOW}🎨 Starting frontend...${NC}"
docker-compose up -d pso-frontend nginx

# Wait for everything to be ready
echo -e "${YELLOW}⏳ Finalizing startup...${NC}"
sleep 30

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f -s http://localhost/health > /dev/null; then
        echo -e "${GREEN}✅ Health check passed${NC}"
        break
    fi
    
    echo -e "${YELLOW}⏳ Health check attempt $attempt/$max_attempts failed, retrying...${NC}"
    sleep 10
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}❌ Health check failed after $max_attempts attempts${NC}"
    echo -e "${YELLOW}📋 Checking service logs...${NC}"
    docker-compose logs --tail=50
    exit 1
fi

# Display status
echo -e "${GREEN}✅ PSO v2.0 deployed successfully!${NC}"
echo ""
echo -e "${YELLOW}📊 Services Status:${NC}"
docker-compose ps

echo ""
echo -e "${YELLOW}🌐 Access Points:${NC}"
echo "  • Web Interface: http://localhost"
echo "  • API Documentation: http://localhost/docs"
echo "  • Health Check: http://localhost/health"
echo "  • NATS Monitoring: http://localhost:8222"

echo ""
echo -e "${YELLOW}🔐 Default Credentials:${NC}"
echo "  • Register a new user at: http://localhost/docs"
echo "  • Use the /api/auth/register endpoint"

echo ""
echo -e "${YELLOW}📚 Useful Commands:${NC}"
echo "  • View logs: docker-compose logs -f pso-backend"
echo "  • Stop services: docker-compose down"
echo "  • Restart: docker-compose restart"
echo "  • Update: ./update.sh"

echo ""
echo -e "${GREEN}🎉 PSO v2.0 is ready to use!${NC}"
echo -e "${YELLOW}Start by registering a user and exploring the system.${NC}"

# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
# PSO v2.0 Update Script

echo "🔄 Updating PSO v2.0..."

# Pull latest images
docker-compose pull

# Recreate containers with new images
docker-compose up -d --force-recreate

echo "✅ Update complete!"
EOF

chmod +x update.sh

# Create logs script
cat > logs.sh << 'EOF'
#!/bin/bash
# PSO v2.0 Logs Script

if [ -z "$1" ]; then
    echo "Viewing all logs..."
    docker-compose logs -f
else
    echo "Viewing logs for $1..."
    docker-compose logs -f "$1"
fi
EOF

chmod +x logs.sh