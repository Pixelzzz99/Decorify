#!/bin/bash

# Тестирование готовности проекта к Railway deployment

echo "🧪 Проверка готовности Decorify к Railway deployment"
echo "=================================================="

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

errors=0

# Проверяем наличие необходимых файлов
echo "📋 Проверяем конфигурационные файлы..."

required_files=(
    "package.json"
    "railway.toml"
    "Procfile"
    "Dockerfile.gateway"
    "Dockerfile.microservice"
    ".railwayignore"
    "RAILWAY_DEPLOYMENT_GUIDE.md"
    "scripts/deploy-railway.sh"
    "scripts/railway-status.sh"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $file"
    else
        echo -e "  ${RED}❌ $file отсутствует${NC}"
        ((errors++))
    fi
done

# Проверяем Procfile для каждого сервиса
echo ""
echo "📦 Проверяем Procfile для сервисов..."

services=("auth" "product" "order" "payment" "vendor" "cart")

for service in "${services[@]}"; do
    procfile="apps/$service/Procfile"
    if [ -f "$procfile" ]; then
        echo -e "  ✅ $procfile"
    else
        echo -e "  ${RED}❌ $procfile отсутствует${NC}"
        ((errors++))
    fi
done

# Проверяем package.json scripts
echo ""
echo "🔧 Проверяем npm scripts..."

required_scripts=("build:all" "start:prod" "start:auth" "start:product" "start:order" "start:payment" "start:vendor" "start:cart" "prisma:generate" "prisma:migrate:deploy")

for script in "${required_scripts[@]}"; do
    if npm run --silent | grep -q "$script"; then
        echo -e "  ✅ $script"
    else
        echo -e "  ${RED}❌ Script '$script' не найден в package.json${NC}"
        ((errors++))
    fi
done

# Проверяем структуру проекта
echo ""
echo "🏗️ Проверяем структуру проекта..."

required_dirs=(
    "apps/api-gateway/src"
    "apps/auth/src"
    "apps/product/src"
    "apps/order/src"
    "apps/payment/src"
    "apps/vendor/src"
    "apps/cart/src"
    "libs/common/src"
    "prisma"
    "proto"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ✅ $dir/"
    else
        echo -e "  ${RED}❌ Директория $dir/ отсутствует${NC}"
        ((errors++))
    fi
done

# Проверяем зависимости
echo ""
echo "📦 Проверяем ключевые зависимости..."

key_deps=("@nestjs/core" "@nestjs/microservices" "@prisma/client" "grpc")

for dep in "${key_deps[@]}"; do
    if npm list "$dep" >/dev/null 2>&1; then
        echo -e "  ✅ $dep"
    else
        echo -e "  ${YELLOW}⚠️  $dep не найден или не установлен${NC}"
    fi
done

# Проверяем .env.example
echo ""
echo "🔐 Проверяем environment variables..."

if [ -f ".env.example" ]; then
    echo -e "  ✅ .env.example существует"

    required_vars=("DATABASE_URL" "REDIS_URL" "JWT_SECRET" "NODE_ENV" "PORT")

    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.example; then
            echo -e "    ✅ $var"
        else
            echo -e "    ${RED}❌ $var отсутствует в .env.example${NC}"
            ((errors++))
        fi
    done
else
    echo -e "  ${RED}❌ .env.example отсутствует${NC}"
    ((errors++))
fi

# Проверяем protobuf файлы
echo ""
echo "🔌 Проверяем protobuf файлы..."

proto_files=("auth.proto" "product.proto" "order.proto" "payment.proto" "vendor.proto" "cart.proto")

for proto in "${proto_files[@]}"; do
    if [ -f "proto/$proto" ]; then
        echo -e "  ✅ proto/$proto"
    else
        echo -e "  ${YELLOW}⚠️  proto/$proto отсутствует${NC}"
    fi
done

# Тестируем сборку
echo ""
echo "🔨 Тестируем сборку проекта..."

if npm run build:all >/dev/null 2>&1; then
    echo -e "  ✅ Сборка проекта успешна"
else
    echo -e "  ${RED}❌ Ошибка при сборке проекта${NC}"
    ((errors++))
fi

# Проверяем права доступа на скрипты
echo ""
echo "🔑 Проверяем права доступа на скрипты..."

scripts=("scripts/deploy-railway.sh" "scripts/railway-status.sh")

for script in "${scripts[@]}"; do
    if [ -x "$script" ]; then
        echo -e "  ✅ $script исполняемый"
    else
        echo -e "  ${YELLOW}⚠️  $script не исполняемый (chmod +x $script)${NC}"
    fi
done

# Итоговый результат
echo ""
echo "=================================================="

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}🎉 Все проверки пройдены! Проект готов к deployment на Railway.${NC}"
    echo ""
    echo "Следующие шаги:"
    echo "1. Установите Railway CLI: npm install -g @railway/cli"
    echo "2. Авторизуйтесь: railway login"
    echo "3. Запустите deployment: ./scripts/deploy-railway.sh"
else
    echo -e "${RED}❌ Найдено $errors ошибок. Исправьте их перед deployment.${NC}"
    exit 1
fi
