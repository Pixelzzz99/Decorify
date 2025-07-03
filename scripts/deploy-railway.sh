#!/bin/bash

# Decorify Railway Deployment Script
# Автоматизирует процесс деплоя всех микросервисов на Railway

set -e

echo "🚄 Starting Decorify deployment to Railway..."

# Цвета для логов
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверяем, что Railway CLI установлен
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Railway CLI не найден. Устанавливаем...${NC}"
    npm install -g @railway/cli
fi

# Логин в Railway
echo -e "${BLUE}Проверяем авторизацию в Railway...${NC}"
railway whoami || railway login

# Создание проекта если не существует
echo -e "${BLUE}Создаем/подключаемся к проекту Railway...${NC}"
railway init decorify-marketplace || echo "Проект уже существует"

# Массив сервисов для деплоя
services=("auth" "product" "order" "payment" "vendor" "cart" "api-gateway")

# Деплоим каждый сервис
for service in "${services[@]}"; do
    echo -e "${YELLOW}📦 Деплоим $service...${NC}"

    # Создаем сервис если не существует
    railway service new $service || echo "Сервис $service уже существует"

    # Переключаемся на сервис
    railway service use $service

    # Устанавливаем переменные окружения
    railway variables set NODE_ENV=production
    railway variables set SERVICE_NAME=$service

    if [ "$service" = "api-gateway" ]; then
        # Для API Gateway используем web команду
        railway up --detach
    else
        # Для микросервисов устанавливаем gRPC порт
        case $service in
            "auth") railway variables set PORT=50051 ;;
            "product") railway variables set PORT=50052 ;;
            "order") railway variables set PORT=50053 ;;
            "payment") railway variables set PORT=50054 ;;
            "vendor") railway variables set PORT=50055 ;;
            "cart") railway variables set PORT=50056 ;;
        esac
        railway up --detach
    fi

    echo -e "${GREEN}✅ $service успешно задеплоен${NC}"
done

# Добавляем базы данных
echo -e "${BLUE}📊 Добавляем PostgreSQL...${NC}"
railway add postgresql

echo -e "${BLUE}🔴 Добавляем Redis...${NC}"
railway add redis

echo -e "${GREEN}🎉 Все сервисы успешно задеплоены на Railway!${NC}"
echo -e "${BLUE}Для просмотра статуса используйте: railway status${NC}"
echo -e "${BLUE}Для просмотра логов используйте: railway logs --follow${NC}"
