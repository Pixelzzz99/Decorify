#!/bin/bash

# Railway Health Check Test Script
# Проверяет готовность всех сервисов к деплою на Railway

set -e

echo "🔍 Railway Health Check Test Script"
echo "=================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для проверки порта
check_port() {
    local port=$1
    local service=$2

    if lsof -i:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Port $port ($service) is available${NC}"
        return 0
    else
        echo -e "${RED}❌ Port $port ($service) is in use${NC}"
        return 1
    fi
}

# Функция для проверки health endpoint
check_health_endpoint() {
    local port=$1
    local service=$2
    local max_retries=30
    local retry_delay=2

    echo -e "${BLUE}🔍 Checking health endpoint for $service on port $port...${NC}"

    for i in $(seq 1 $max_retries); do
        if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1; then
            local response=$(curl -s "http://localhost:$port/health")
            echo -e "${GREEN}✅ $service health check passed${NC}"
            echo "   Response: $(echo $response | jq '.status' 2>/dev/null || echo $response)"
            return 0
        fi

        if [ $i -eq $max_retries ]; then
            echo -e "${RED}❌ $service health check failed after $max_retries attempts${NC}"
            return 1
        fi

        echo -e "${YELLOW}⏳ Waiting for $service... (attempt $i/$max_retries)${NC}"
        sleep $retry_delay
    done
}

# Сервисы и их порты
declare -A SERVICES=(
    ["api-gateway"]="3000"
    ["auth"]="8081"
    ["product"]="8082"
    ["order"]="8083"
    ["payment"]="8084"
    ["vendor"]="8085"
    ["cart"]="8086"
)

declare -A GRPC_PORTS=(
    ["auth"]="50051"
    ["product"]="50052"
    ["order"]="50053"
    ["payment"]="50054"
    ["vendor"]="50055"
    ["cart"]="50056"
)

echo ""
echo "1️⃣  Проверка доступности портов..."
echo "================================"

all_ports_available=true

# Проверяем HTTP порты
for service in "${!SERVICES[@]}"; do
    port=${SERVICES[$service]}
    if ! check_port $port $service; then
        all_ports_available=false
    fi
done

# Проверяем gRPC порты
for service in "${!GRPC_PORTS[@]}"; do
    port=${GRPC_PORTS[$service]}
    if ! check_port $port "$service-grpc"; then
        all_ports_available=false
    fi
done

if [ "$all_ports_available" = false ]; then
    echo -e "${RED}❌ Some ports are not available. Please stop conflicting services.${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Сборка проекта..."
echo "==================="

echo -e "${BLUE}🔨 Building all services...${NC}"
npm run build:all

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

echo ""
echo "3️⃣  Запуск сервисов..."
echo "====================="

# Массив для хранения PID процессов
declare -a PIDS=()

# Функция для очистки процессов при выходе
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    for pid in "${PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            echo -e "${YELLOW}   Stopped process $pid${NC}"
        fi
    done
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Устанавливаем trap для очистки при выходе
trap cleanup EXIT

# Запускаем микросервисы
echo -e "${BLUE}🚀 Starting microservices...${NC}"

for service in auth product order payment vendor cart; do
    echo -e "${BLUE}   Starting $service...${NC}"
    npm run start:$service &
    pid=$!
    PIDS+=($pid)
    echo -e "${GREEN}   Started $service (PID: $pid)${NC}"
    sleep 3
done

# Запускаем API Gateway
echo -e "${BLUE}🚀 Starting API Gateway...${NC}"
npm run start:prod &
pid=$!
PIDS+=($pid)
echo -e "${GREEN}   Started API Gateway (PID: $pid)${NC}"

echo ""
echo "4️⃣  Проверка health endpoints..."
echo "==============================="

sleep 10  # Даем время сервисам запуститься

all_health_checks_passed=true

# Проверяем API Gateway
if ! check_health_endpoint 3000 "API Gateway"; then
    all_health_checks_passed=false
fi

# Проверяем микросервисы
for service in "${!SERVICES[@]}"; do
    if [ "$service" != "api-gateway" ]; then
        port=${SERVICES[$service]}
        if ! check_health_endpoint $port $service; then
            all_health_checks_passed=false
        fi
    fi
done

echo ""
echo "5️⃣  Проверка Railway переменных..."
echo "================================="

# Проверяем основные Railway переменные
railway_vars_ok=true

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set (expected for Railway)${NC}"
fi

if [ -z "$REDIS_URL" ]; then
    echo -e "${YELLOW}⚠️  REDIS_URL not set (expected for Railway)${NC}"
fi

echo ""
echo "6️⃣  Проверка Railway файлов..."
echo "============================"

files_ok=true

# Проверяем наличие необходимых файлов
required_files=(
    "railway.toml"
    "Dockerfile.gateway"
    "Dockerfile.microservice"
    ".railwayignore"
    "Procfile"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        files_ok=false
    fi
done

# Проверяем Procfile для каждого сервиса
for service in auth product order payment vendor cart; do
    procfile="apps/$service/Procfile"
    if [ -f "$procfile" ]; then
        echo -e "${GREEN}✅ $procfile exists${NC}"
    else
        echo -e "${RED}❌ $procfile missing${NC}"
        files_ok=false
    fi
done

echo ""
echo "📊 Сводка результатов"
echo "===================="

if [ "$all_health_checks_passed" = true ] && [ "$files_ok" = true ]; then
    echo -e "${GREEN}🎉 Все проверки пройдены! Проект готов к деплою на Railway.${NC}"
    echo ""
    echo -e "${BLUE}📋 Следующие шаги:${NC}"
    echo "1. Установите Railway CLI: npm install -g @railway/cli"
    echo "2. Войдите в Railway: railway login"
    echo "3. Запустите деплой: ./scripts/deploy-railway.sh"
    echo ""
    echo -e "${BLUE}🌐 Health endpoints:${NC}"
    for service in "${!SERVICES[@]}"; do
        port=${SERVICES[$service]}
        echo "   $service: http://localhost:$port/health"
    done

    exit_code=0
else
    echo -e "${RED}❌ Обнаружены проблемы. Пожалуйста, исправьте их перед деплоем.${NC}"

    if [ "$all_health_checks_passed" = false ]; then
        echo -e "${RED}   - Health checks failed${NC}"
    fi

    if [ "$files_ok" = false ]; then
        echo -e "${RED}   - Required files missing${NC}"
    fi

    exit_code=1
fi

# Даем время посмотреть на результаты перед завершением
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services...${NC}"

# Ожидаем сигнал завершения
while true; do
    sleep 1
done
