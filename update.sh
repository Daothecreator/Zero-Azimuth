#!/bin/bash

# PSO v2.0 Update Script

echo "🔄 PSO v2.0 Update Script"
echo "========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
    echo "Please run this script from the pso-v2 directory"
    exit 1
fi

echo -e "${YELLOW}📋 Pulling latest Docker images...${NC}"
docker-compose pull

echo -e "${YELLOW}🔄 Recreating containers with new images...${NC}"
docker-compose up -d --force-recreate

echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Service Status:${NC}"
docker-compose ps

echo ""
echo -e "${YELLOW}📋 Recent logs:${NC}"
docker-compose logs --tail=20